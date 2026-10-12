import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from personal_agent.vault import Vault, VaultError


SENTINEL = "机密哨兵甲乙丙丁"


class VaultTests(unittest.TestCase):
    def test_disk_has_no_plaintext_and_wrong_passphrase_fails(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "vault.enc"
            vault = Vault.create(path, "correct-horse")
            vault.add_document("personal", "secret", "交易备忘", SENTINEL + "只存在于正文")
            raw = path.read_bytes()
            self.assertNotIn(SENTINEL.encode("utf-8"), raw)
            with self.assertRaises(VaultError):
                Vault.open(path, "wrong-horse")

    def test_realms_and_clearance_do_not_leak(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "vault.enc"
            vault = Vault.create(path, "pw")
            vault.add_document("personal", "secret", "个人", "个人秘密是琥珀")
            vault.add_document("enterprise", "secret", "公司", "公司秘密是石英")
            vault.add_document("enterprise", "open", "公告", "公司公告是公开招聘")

            personal = vault.ask("personal", "secret", "秘密是什么")
            self.assertIn("琥珀", personal["answer"])
            self.assertNotIn("石英", personal["answer"])

            enterprise_open = vault.ask("enterprise", "open", "秘密是什么")
            self.assertNotIn("石英", enterprise_open["answer"])
            self.assertIn("公开招聘", vault.ask("enterprise", "open", "公告招聘")["answer"])

    def test_missing_material_does_not_invent(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "vault.enc"
            vault = Vault.create(path, "pw")
            vault.add_document("personal", "open", "日程", "周二下午有例会")
            result = vault.ask("personal", "open", "火星殖民地预算")
            self.assertEqual(result["answer"], "资料里没有")
            self.assertEqual(result["citations"], [])

    def test_enterprise_constraint_blocks_and_confirm_requires_pending(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "vault.enc"
            vault = Vault.create(path, "pw")
            vault.add_document(
                "enterprise",
                "secret",
                "对外口径",
                "草案写有不得对外承诺收益，因为尚未审计",
            )
            vault.add_constraint("不得对外承诺收益")
            blocked = vault.draft("enterprise", "secret", "对外口径承诺收益")
            self.assertEqual(blocked.status, "blocked")
            with self.assertRaises(VaultError):
                vault.confirm(blocked.id)

            vault.add_document("personal", "open", "日程", "周五提交周报")
            pending = vault.draft("personal", "open", "周五周报")
            self.assertEqual(pending.status, "pending")
            confirmed = vault.confirm(pending.id)
            self.assertEqual(confirmed.status, "confirmed")
            with self.assertRaises(VaultError):
                vault.confirm(pending.id)


if __name__ == "__main__":
    unittest.main()
