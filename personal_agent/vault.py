"""Local encrypted archive for one personal vault and one enterprise vault.

Disk holds ciphertext only. The passphrase never leaves this process.
Personal and enterprise records cannot see each other.
A caller without secret clearance cannot read secret records.
"""

from __future__ import annotations

import json
import os
import re
import secrets
import uuid
from dataclasses import dataclass, field
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt

MAGIC = b"PAV1"
SALT_LEN = 16
NONCE_LEN = 12
REALMS = ("personal", "enterprise")
CLEARANCES = ("open", "secret")


class VaultError(Exception):
    pass


def _kdf(passphrase: str, salt: bytes) -> bytes:
    if not passphrase:
        raise VaultError("口令不能为空")
    return Scrypt(salt=salt, length=32, n=2**14, r=8, p=1).derive(
        passphrase.encode("utf-8")
    )


def _bigrams(text: str) -> set[str]:
    compact = re.sub(r"\s+", "", text.lower())
    if len(compact) < 2:
        return {compact} if compact else set()
    return {compact[i : i + 2] for i in range(len(compact) - 1)}


def _score(query: str, body: str) -> int:
    q = _bigrams(query)
    if not q:
        return 0
    return len(q & _bigrams(body))


@dataclass
class Document:
    id: str
    realm: str
    clearance: str
    title: str
    body: str

    def public(self) -> dict:
        return {
            "id": self.id,
            "realm": self.realm,
            "clearance": self.clearance,
            "title": self.title,
            "body": self.body,
        }


@dataclass
class Constraint:
    id: str
    text: str

    def public(self) -> dict:
        return {"id": self.id, "text": self.text}


@dataclass
class Draft:
    id: str
    realm: str
    body: str
    citations: list[str]
    status: str

    def public(self) -> dict:
        return {
            "id": self.id,
            "realm": self.realm,
            "body": self.body,
            "citations": self.citations,
            "status": self.status,
        }


@dataclass
class State:
    docs: list[Document] = field(default_factory=list)
    constraints: list[Constraint] = field(default_factory=list)
    drafts: list[Draft] = field(default_factory=list)

    def to_json(self) -> bytes:
        payload = {
            "docs": [d.public() for d in self.docs],
            "constraints": [c.public() for c in self.constraints],
            "drafts": [d.public() for d in self.drafts],
        }
        return json.dumps(payload, ensure_ascii=False).encode("utf-8")

    @classmethod
    def from_json(cls, raw: bytes) -> "State":
        data = json.loads(raw.decode("utf-8"))
        return cls(
            docs=[Document(**item) for item in data.get("docs", [])],
            constraints=[Constraint(**item) for item in data.get("constraints", [])],
            drafts=[Draft(**item) for item in data.get("drafts", [])],
        )


class Vault:
    def __init__(self, path: Path, passphrase: str, state: State, salt: bytes):
        self.path = Path(path)
        self.passphrase = passphrase
        self.state = state
        self.salt = salt

    @classmethod
    def create(cls, path: Path, passphrase: str) -> "Vault":
        path = Path(path)
        if path.exists():
            raise VaultError("档案已存在")
        vault = cls(path, passphrase, State(), secrets.token_bytes(SALT_LEN))
        vault.save()
        return vault

    @classmethod
    def open(cls, path: Path, passphrase: str) -> "Vault":
        path = Path(path)
        blob = path.read_bytes()
        if not blob.startswith(MAGIC) or len(blob) < len(MAGIC) + SALT_LEN + NONCE_LEN:
            raise VaultError("档案格式无法识别")
        salt = blob[len(MAGIC) : len(MAGIC) + SALT_LEN]
        nonce = blob[len(MAGIC) + SALT_LEN : len(MAGIC) + SALT_LEN + NONCE_LEN]
        ciphertext = blob[len(MAGIC) + SALT_LEN + NONCE_LEN :]
        try:
            raw = AESGCM(_kdf(passphrase, salt)).decrypt(nonce, ciphertext, None)
        except Exception as exc:
            raise VaultError("口令错误或档案已损坏") from exc
        return cls(path, passphrase, State.from_json(raw), salt)

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        nonce = secrets.token_bytes(NONCE_LEN)
        ciphertext = AESGCM(_kdf(self.passphrase, self.salt)).encrypt(
            nonce, self.state.to_json(), None
        )
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp.write_bytes(MAGIC + self.salt + nonce + ciphertext)
        os.replace(tmp, self.path)

    def add_document(self, realm: str, clearance: str, title: str, body: str) -> Document:
        self._check_realm(realm)
        self._check_clearance(clearance)
        if not title.strip() or not body.strip():
            raise VaultError("标题和正文都不能为空")
        doc = Document(uuid.uuid4().hex[:8], realm, clearance, title.strip(), body.strip())
        self.state.docs.append(doc)
        self.save()
        return doc

    def add_constraint(self, text: str) -> Constraint:
        if not text.strip():
            raise VaultError("长期约束不能为空")
        item = Constraint(uuid.uuid4().hex[:8], text.strip())
        self.state.constraints.append(item)
        self.save()
        return item

    def ask(self, realm: str, clearance: str, question: str) -> dict:
        self._check_realm(realm)
        self._check_clearance(clearance)
        visible = self._visible(realm, clearance)
        ranked = sorted(
            (( _score(question, f"{doc.title}\n{doc.body}"), doc) for doc in visible),
            key=lambda item: item[0],
            reverse=True,
        )
        hits = [(score, doc) for score, doc in ranked if score > 0][:3]
        if not hits:
            return {"answer": "资料里没有", "citations": []}
        lines = []
        citations = []
        for _, doc in hits:
            snippet = doc.body[:180]
            lines.append(f"[{doc.title}] {snippet}")
            citations.append(doc.id)
        return {"answer": "\n".join(lines), "citations": citations}

    def draft(self, realm: str, clearance: str, question: str) -> Draft:
        found = self.ask(realm, clearance, question)
        if not found["citations"]:
            body = "资料里没有，不能起草。"
            status = "blocked"
        else:
            body = "待确认草稿：\n" + found["answer"]
            status = "pending"
        if realm == "enterprise":
            blocked = [c.text for c in self.state.constraints if c.text and c.text in body]
            if blocked:
                body = "已拦截。草稿触及长期约束：" + "、".join(blocked)
                status = "blocked"
        item = Draft(uuid.uuid4().hex[:8], realm, body, found["citations"], status)
        self.state.drafts.append(item)
        self.save()
        return item

    def confirm(self, draft_id: str) -> Draft:
        for item in self.state.drafts:
            if item.id == draft_id:
                if item.status != "pending":
                    raise VaultError("只有待确认草稿可以确认")
                item.status = "confirmed"
                self.save()
                return item
        raise VaultError("找不到这份草稿")

    def _visible(self, realm: str, clearance: str) -> list[Document]:
        allowed = ("open", "secret") if clearance == "secret" else ("open",)
        return [
            doc
            for doc in self.state.docs
            if doc.realm == realm and doc.clearance in allowed
        ]

    @staticmethod
    def _check_realm(realm: str) -> None:
        if realm not in REALMS:
            raise VaultError("库只能是 personal 或 enterprise")

    @staticmethod
    def _check_clearance(clearance: str) -> None:
        if clearance not in CLEARANCES:
            raise VaultError("权限只能是 open 或 secret")
