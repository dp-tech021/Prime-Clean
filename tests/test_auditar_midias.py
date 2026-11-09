"""Testes da auditoria segura de mídias usando somente a biblioteca padrão."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SCRIPT = RAIZ / "scripts/auditar_midias.py"


class AuditoriaDeMidias(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.raiz = Path(self.tempdir.name)
        (self.raiz / "data").mkdir()
        (self.raiz / "media/hero").mkdir(parents=True)
        (self.raiz / "media/fotos-servicos").mkdir(parents=True)
        (self.raiz / "media/comparacoes").mkdir(parents=True)
        (self.raiz / "data/site.json").write_text(
            json.dumps({"heroImage": "/media/hero/referenciada.webp"}),
            encoding="utf-8",
        )
        (self.raiz / "data/servicos.json").write_text("[]", encoding="utf-8")
        (self.raiz / "data/comparacoes.json").write_text("[]", encoding="utf-8")
        (self.raiz / "media/hero/referenciada.webp").write_bytes(b"imagem")
        (self.raiz / "media/hero/orfa.webp").write_bytes(b"imagem")

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def executar(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT), "--raiz", str(self.raiz), *args],
            cwd=RAIZ,
            check=False,
            capture_output=True,
            text=True,
        )

    def test_lista_orfa_sem_apagar(self) -> None:
        processo = self.executar()
        self.assertEqual(processo.returncode, 0, processo.stdout + processo.stderr)
        self.assertIn("1 arquivo(s) órfão(s)", processo.stdout)
        self.assertIn("media/hero/orfa.webp", processo.stdout)
        self.assertTrue((self.raiz / "media/hero/orfa.webp").exists())

    def test_bloqueia_exclusao_de_arquivo_referenciado(self) -> None:
        processo = self.executar(
            "--verificar-exclusao", "media/hero/referenciada.webp"
        )
        self.assertEqual(processo.returncode, 2)
        self.assertIn("BLOQUEADO", processo.stderr)
        self.assertIn("data/site.json:heroImage", processo.stderr)

    def test_libera_orfa_para_limpeza_manual(self) -> None:
        processo = self.executar("--verificar-exclusao", "media/hero/orfa.webp")
        self.assertEqual(processo.returncode, 0, processo.stdout + processo.stderr)
        self.assertIn("OK PARA LIMPEZA", processo.stdout)

    def test_falha_quando_referencia_esta_quebrada(self) -> None:
        (self.raiz / "media/hero/referenciada.webp").unlink()
        processo = self.executar()
        self.assertNotEqual(processo.returncode, 0)
        self.assertIn("arquivo referenciado não encontrado", processo.stderr)


if __name__ == "__main__":
    unittest.main()
