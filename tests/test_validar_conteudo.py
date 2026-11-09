"""Testes dos fixtures do validador usando somente unittest."""

from __future__ import annotations

import subprocess
import sys
import unittest
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]
SCRIPT = RAIZ / "scripts/validar_conteudo.py"
FIXTURES = RAIZ / "tests/fixtures"


def executar_fixture(nome: str, tipo: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--fixture",
            str(FIXTURES / nome),
            "--tipo",
            tipo,
        ],
        cwd=RAIZ,
        check=False,
        capture_output=True,
        text=True,
    )


class FixturesDoValidador(unittest.TestCase):
    def test_servico_valido_passa(self) -> None:
        processo = executar_fixture("servico_valido.json", "servico")
        self.assertEqual(processo.returncode, 0, processo.stdout + processo.stderr)
        self.assertIn("OK:", processo.stdout)

    def test_foto_ausente_falha_com_campo(self) -> None:
        processo = executar_fixture("comparacao_foto_ausente.json", "comparacao")
        self.assertNotEqual(processo.returncode, 0)
        self.assertIn("before", processo.stderr)
        self.assertIn("arquivo de imagem não encontrado", processo.stderr)

    def test_url_externa_falha_com_campo(self) -> None:
        processo = executar_fixture("comparacao_url_externa.json", "comparacao")
        self.assertNotEqual(processo.returncode, 0)
        self.assertIn("before", processo.stderr)
        self.assertIn("URL externa não é permitida", processo.stderr)


if __name__ == "__main__":
    unittest.main()
