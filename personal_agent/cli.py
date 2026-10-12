"""Command line for the local encrypted archive."""

from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
from pathlib import Path

from personal_agent.vault import Vault, VaultError


def _passphrase() -> str:
    value = os.environ.get("VAULT_PASSPHRASE", "")
    if value:
        return value
    return getpass.getpass("口令: ")


def _print(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="本地加密档案")
    parser.add_argument("--path", default="vault.enc")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init")

    add = sub.add_parser("add")
    add.add_argument("--realm", required=True, choices=["personal", "enterprise"])
    add.add_argument("--clearance", default="secret", choices=["open", "secret"])
    add.add_argument("--title", required=True)
    add.add_argument("--text", required=True)

    ask = sub.add_parser("ask")
    ask.add_argument("--realm", required=True, choices=["personal", "enterprise"])
    ask.add_argument("--clearance", default="secret", choices=["open", "secret"])
    ask.add_argument("--q", required=True)

    rule = sub.add_parser("constrain")
    rule.add_argument("--text", required=True)

    draft = sub.add_parser("draft")
    draft.add_argument("--realm", required=True, choices=["personal", "enterprise"])
    draft.add_argument("--clearance", default="secret", choices=["open", "secret"])
    draft.add_argument("--q", required=True)

    confirm = sub.add_parser("confirm")
    confirm.add_argument("--id", required=True)

    args = parser.parse_args(argv)
    path = Path(args.path)
    try:
        if args.cmd == "init":
            Vault.create(path, _passphrase())
            _print({"ok": True, "path": str(path)})
            return 0
        vault = Vault.open(path, _passphrase())
        if args.cmd == "add":
            doc = vault.add_document(args.realm, args.clearance, args.title, args.text)
            _print({"ok": True, "id": doc.id})
        elif args.cmd == "ask":
            _print(vault.ask(args.realm, args.clearance, args.q))
        elif args.cmd == "constrain":
            item = vault.add_constraint(args.text)
            _print({"ok": True, "id": item.id})
        elif args.cmd == "draft":
            _print(vault.draft(args.realm, args.clearance, args.q).public())
        elif args.cmd == "confirm":
            _print(vault.confirm(args.id).public())
    except VaultError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
