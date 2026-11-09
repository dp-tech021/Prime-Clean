#!/usr/bin/env python3
"""Audita referências e arquivos órfãos sem excluir mídia automaticamente."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import urlsplit

RAIZ_PADRAO = Path(__file__).resolve().parents[1]
EXTENSOES = {".webp", ".jpg", ".jpeg", ".png", ".avif"}
PASTAS_GERENCIADAS = (
    Path("media/hero"),
    Path("media/fotos-servicos"),
    Path("media/comparacoes"),
)


def carregar_json(raiz: Path, relativo: str, erros: list[str]) -> Any | None:
    caminho = raiz / relativo
    try:
        return json.loads(caminho.read_text(encoding="utf-8"))
    except FileNotFoundError:
        erros.append(f"{relativo}: arquivo não encontrado")
    except json.JSONDecodeError as erro:
        erros.append(
            f"{relativo}: JSON inválido na linha {erro.lineno}, coluna {erro.colno}: {erro.msg}"
        )
    except OSError as erro:
        erros.append(f"{relativo}: não foi possível ler: {erro}")
    return None


def normalizar_referencia(valor: Any) -> tuple[str | None, str | None]:
    if not isinstance(valor, str) or not valor.strip():
        return None, None
    referencia = valor.strip()
    partes = urlsplit(referencia)
    if partes.scheme or partes.netloc or referencia.startswith("//"):
        return None, f"URL externa não permitida: {referencia}"
    if "\\" in referencia:
        return None, f"use barras normais no caminho: {referencia}"
    relativo = referencia.removeprefix("./").removeprefix("/")
    posix = PurePosixPath(relativo)
    if ".." in posix.parts:
        return None, f"caminho com ../ não permitido: {referencia}"
    if not posix.parts or posix.parts[0] != "media":
        return None, f"mídia deve ficar em media/: {referencia}"
    if posix.suffix.lower() not in EXTENSOES:
        return None, f"extensão de imagem não permitida: {referencia}"
    return posix.as_posix(), None


def adicionar_referencia(
    referencias: dict[str, list[str]],
    erros: list[str],
    valor: Any,
    origem: str,
) -> None:
    relativo, erro = normalizar_referencia(valor)
    if erro:
        erros.append(f"{origem}: {erro}")
    elif relativo:
        referencias.setdefault(relativo, []).append(origem)


def coletar_referencias(raiz: Path) -> tuple[dict[str, list[str]], list[str]]:
    erros: list[str] = []
    referencias: dict[str, list[str]] = {}
    site = carregar_json(raiz, "data/site.json", erros)
    servicos = carregar_json(raiz, "data/servicos.json", erros)
    comparacoes = carregar_json(raiz, "data/comparacoes.json", erros)

    if isinstance(site, dict):
        adicionar_referencia(
            referencias, erros, site.get("heroImage"), "data/site.json:heroImage"
        )
    elif site is not None:
        erros.append("data/site.json:$: deve ser objeto")

    if isinstance(servicos, list):
        for indice, servico in enumerate(servicos):
            if isinstance(servico, dict):
                adicionar_referencia(
                    referencias,
                    erros,
                    servico.get("image"),
                    f"data/servicos.json[{indice}]:image",
                )
    elif servicos is not None:
        erros.append("data/servicos.json:$: deve ser lista")

    if isinstance(comparacoes, list):
        for indice, comparacao in enumerate(comparacoes):
            if not isinstance(comparacao, dict):
                continue
            for campo in ("before", "after"):
                adicionar_referencia(
                    referencias,
                    erros,
                    comparacao.get(campo),
                    f"data/comparacoes.json[{indice}]:{campo}",
                )
    elif comparacoes is not None:
        erros.append("data/comparacoes.json:$: deve ser lista")
    return referencias, erros


def listar_arquivos(raiz: Path) -> set[str]:
    arquivos: set[str] = set()
    for pasta in PASTAS_GERENCIADAS:
        destino = raiz / pasta
        if not destino.is_dir():
            continue
        for arquivo in destino.rglob("*"):
            if arquivo.is_file() and arquivo.suffix.lower() in EXTENSOES:
                arquivos.add(arquivo.relative_to(raiz).as_posix())
    return arquivos


def caminho_dentro_da_raiz(raiz: Path, relativo: str) -> bool:
    destino = (raiz / relativo).resolve()
    try:
        return os.path.commonpath((str(raiz.resolve()), str(destino))) == str(
            raiz.resolve()
        )
    except ValueError:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Lista referências e mídias órfãs sem apagar arquivos."
    )
    parser.add_argument(
        "--verificar-exclusao",
        metavar="CAMINHO",
        help="falha se o arquivo ainda estiver referenciado",
    )
    parser.add_argument("--raiz", type=Path, default=RAIZ_PADRAO, help=argparse.SUPPRESS)
    args = parser.parse_args()
    raiz = args.raiz.resolve()
    referencias, erros = coletar_referencias(raiz)
    arquivos = listar_arquivos(raiz)

    for relativo, origens in sorted(referencias.items()):
        if not caminho_dentro_da_raiz(raiz, relativo):
            erros.append(f"{relativo}: caminho resolve para fora do repositório")
        elif relativo not in arquivos:
            erros.append(
                f"{relativo}: arquivo referenciado não encontrado ({', '.join(origens)})"
            )

    if erros:
        for erro in erros:
            print(f"ERRO: {erro}", file=sys.stderr)
        print(f"FALHA: {len(erros)} problema(s) de mídia.", file=sys.stderr)
        return 1

    if args.verificar_exclusao:
        relativo, erro = normalizar_referencia(args.verificar_exclusao)
        if erro or not relativo:
            print(f"ERRO: {erro or 'caminho vazio'}", file=sys.stderr)
            return 1
        if relativo in referencias:
            print(
                f"BLOQUEADO: {relativo} ainda é usado por {', '.join(referencias[relativo])}.",
                file=sys.stderr,
            )
            return 2
        if relativo not in arquivos:
            print(f"ERRO: arquivo não encontrado: {relativo}", file=sys.stderr)
            return 1
        print(f"OK PARA LIMPEZA: {relativo} não possui referência nos JSONs.")
        return 0

    orfas = sorted(arquivos - set(referencias))
    print(
        f"OK: {len(referencias)} mídia(s) referenciada(s) existe(m); "
        f"{len(orfas)} arquivo(s) órfão(s)."
    )
    for relativo in orfas:
        print(f"ÓRFÃ: {relativo}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
