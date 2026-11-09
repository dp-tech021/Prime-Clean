#!/usr/bin/env python3
"""Valida os dados públicos da Prime-Clean sem dependências externas."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import urlsplit


RAIZ = Path(__file__).resolve().parents[1]
EXTENSOES_IMAGEM = {".webp", ".jpg", ".jpeg", ".png", ".avif"}
MARCADORES_SIMULACAO = (
    "ia",
    "sintét",
    "sintet",
    "simula",
    "fictí",
    "ficti",
    "ilustra",
)
PADROES_CONTATO = {
    "wa.me": re.compile(r"wa\.me", re.IGNORECASE),
    "instagram.com": re.compile(r"instagram\.com", re.IGNORECASE),
    "mailto:": re.compile(r"mailto:", re.IGNORECASE),
    "tel:": re.compile(r"tel:", re.IGNORECASE),
}


class ColetorLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[int, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        atributos = dict(attrs)
        self.links.append((self.getpos()[0], atributos.get("href")))


class Resultado:
    def __init__(self) -> None:
        self.erros: list[str] = []
        self.avisos: list[str] = []
        self.imagens: set[str] = set()

    def erro(self, arquivo: Path | str, campo: str, mensagem: str) -> None:
        self.erros.append(f"{arquivo}:{campo}: {mensagem}")

    def aviso(self, arquivo: Path | str, campo: str, mensagem: str) -> None:
        self.avisos.append(f"{arquivo}:{campo}: {mensagem}")


def caminho_exibicao(caminho: Path) -> str:
    try:
        return caminho.resolve().relative_to(RAIZ).as_posix()
    except ValueError:
        return caminho.as_posix()


def carregar_json(caminho: Path, resultado: Resultado) -> Any | None:
    nome = caminho_exibicao(caminho)
    try:
        with caminho.open(encoding="utf-8") as arquivo:
            return json.load(arquivo)
    except FileNotFoundError:
        resultado.erro(nome, "$", "arquivo JSON não encontrado")
    except json.JSONDecodeError as erro:
        resultado.erro(
            nome,
            "$",
            f"JSON inválido na linha {erro.lineno}, coluna {erro.colno}: {erro.msg}",
        )
    except OSError as erro:
        resultado.erro(nome, "$", f"não foi possível ler o arquivo: {erro}")
    return None


def texto_obrigatorio(
    registro: dict[str, Any], campo: str, arquivo: str, resultado: Resultado
) -> str | None:
    valor = registro.get(campo)
    if not isinstance(valor, str) or not valor.strip():
        resultado.erro(arquivo, campo, "deve ser texto não vazio")
        return None
    return valor.strip()


def booleano_obrigatorio(
    registro: dict[str, Any], campo: str, arquivo: str, resultado: Resultado
) -> bool | None:
    valor = registro.get(campo)
    if type(valor) is not bool:
        resultado.erro(arquivo, campo, "deve ser booleano (true ou false)")
        return None
    return valor


def ordem_obrigatoria(
    registro: dict[str, Any], campo: str, arquivo: str, resultado: Resultado
) -> int | None:
    valor = registro.get(campo)
    if type(valor) is not int or valor < 1:
        resultado.erro(arquivo, campo, "deve ser número inteiro maior ou igual a 1")
        return None
    return valor


def contem_marcador_simulacao(texto: str) -> bool:
    texto_normalizado = texto.casefold()
    return any(marcador in texto_normalizado for marcador in MARCADORES_SIMULACAO)


def validar_caminho_imagem(
    valor: Any, arquivo: str, campo: str, resultado: Resultado
) -> str | None:
    if not isinstance(valor, str) or not valor.strip():
        resultado.erro(arquivo, campo, "deve apontar para uma imagem local")
        return None

    referencia = valor.strip()
    partes_url = urlsplit(referencia)
    if partes_url.scheme or partes_url.netloc or referencia.startswith("//"):
        resultado.erro(arquivo, campo, f"URL externa não é permitida: {referencia}")
        return None
    if "\\" in referencia:
        resultado.erro(arquivo, campo, "use barras normais (/) no caminho")
        return None

    relativo = referencia.removeprefix("./").removeprefix("/")
    caminho_posix = PurePosixPath(relativo)
    if ".." in caminho_posix.parts:
        resultado.erro(arquivo, campo, "caminhos com ../ não são permitidos")
        return None
    if not caminho_posix.parts or caminho_posix.parts[0] != "media":
        resultado.erro(arquivo, campo, "a imagem deve ficar dentro de media/")
        return None
    if caminho_posix.suffix.lower() not in EXTENSOES_IMAGEM:
        extensoes = ", ".join(sorted(EXTENSOES_IMAGEM))
        resultado.erro(arquivo, campo, f"extensão não permitida; use {extensoes}")
        return None

    destino = (RAIZ / Path(*caminho_posix.parts)).resolve()
    raiz_resolvida = RAIZ.resolve()
    try:
        dentro_da_raiz = os.path.commonpath((str(raiz_resolvida), str(destino))) == str(
            raiz_resolvida
        )
    except ValueError:
        dentro_da_raiz = False
    if not dentro_da_raiz:
        resultado.erro(arquivo, campo, "o caminho resolve para fora do repositório")
        return None
    if not destino.is_file():
        resultado.erro(arquivo, campo, f"arquivo de imagem não encontrado: {relativo}")
        return None

    resultado.imagens.add(relativo)
    return relativo


def validar_ordens(
    ordens: list[int], arquivo: str, resultado: Resultado
) -> None:
    if len(set(ordens)) != len(ordens):
        resultado.aviso(
            arquivo,
            "order",
            "há valores repetidos; o contrato atual permite empates e mantém a ordem original",
        )
    if ordens != sorted(ordens):
        resultado.aviso(
            arquivo,
            "order",
            "a lista não está em ordem crescente; o frontend fará a ordenação",
        )


def validar_servico(
    registro: Any, arquivo: str, resultado: Resultado
) -> int | None:
    if not isinstance(registro, dict):
        resultado.erro(arquivo, "$", "cada serviço deve ser um objeto JSON")
        return None

    texto_obrigatorio(registro, "title", arquivo, resultado)
    texto_obrigatorio(registro, "description", arquivo, resultado)
    alt = texto_obrigatorio(registro, "imageAlt", arquivo, resultado)
    ilustrativa = booleano_obrigatorio(registro, "illustrative", arquivo, resultado)
    booleano_obrigatorio(registro, "visible", arquivo, resultado)
    ordem = ordem_obrigatoria(registro, "order", arquivo, resultado)
    validar_caminho_imagem(registro.get("image"), arquivo, "image", resultado)

    if ilustrativa is not True:
        resultado.erro(arquivo, "illustrative", "deve ser true no modo portfólio")
    if alt and not contem_marcador_simulacao(alt):
        resultado.erro(
            arquivo,
            "imageAlt",
            "deve identificar explicitamente a imagem como ilustrativa, sintética ou gerada por IA",
        )
    return ordem


def validar_comparacao(
    registro: Any, arquivo: str, resultado: Resultado
) -> int | None:
    if not isinstance(registro, dict):
        resultado.erro(arquivo, "$", "cada comparação deve ser um objeto JSON")
        return None

    titulo = texto_obrigatorio(registro, "title", arquivo, resultado)
    texto_obrigatorio(registro, "service", arquivo, resultado)
    descricao = registro.get("description", "")
    if not isinstance(descricao, str):
        resultado.erro(arquivo, "description", "deve ser texto")
        descricao = ""
    before_alt = texto_obrigatorio(registro, "beforeAlt", arquivo, resultado)
    after_alt = texto_obrigatorio(registro, "afterAlt", arquivo, resultado)
    ordem = ordem_obrigatoria(registro, "order", arquivo, resultado)
    demonstrativa = booleano_obrigatorio(
        registro, "demonstrative", arquivo, resultado
    )
    consentimento = booleano_obrigatorio(
        registro, "consentConfirmed", arquivo, resultado
    )
    publicada = booleano_obrigatorio(registro, "published", arquivo, resultado)
    before = validar_caminho_imagem(registro.get("before"), arquivo, "before", resultado)
    after = validar_caminho_imagem(registro.get("after"), arquivo, "after", resultado)

    if before and after and before == after:
        resultado.erro(arquivo, "before/after", "as duas imagens devem ser diferentes")
    if demonstrativa is True and consentimento is not False:
        resultado.erro(
            arquivo,
            "consentConfirmed",
            "deve ser false em uma simulação sintética; não representa consentimento jurídico",
        )
    if publicada is True and demonstrativa is not True:
        resultado.erro(
            arquivo,
            "demonstrative",
            "comparação pública deve ser uma simulação explícita no modo portfólio",
        )
    if demonstrativa is True:
        campos_rotulo = {
            "title": titulo or "",
            "description": descricao,
            "beforeAlt": before_alt or "",
            "afterAlt": after_alt or "",
        }
        for campo, texto in campos_rotulo.items():
            if not contem_marcador_simulacao(texto):
                resultado.erro(
                    arquivo,
                    campo,
                    "deve rotular explicitamente a comparação como sintética, fictícia, simulação ou gerada por IA",
                )
    return ordem


def validar_site(dados: Any, arquivo: str, resultado: Resultado) -> None:
    if not isinstance(dados, dict):
        resultado.erro(arquivo, "$", "deve ser um objeto JSON")
        return
    for campo in ("instagram", "whatsapp", "area"):
        if not isinstance(dados.get(campo), str):
            resultado.erro(arquivo, campo, "deve ser texto")
    for campo in ("instagram", "whatsapp"):
        valor = dados.get(campo)
        if isinstance(valor, str) and valor.strip():
            resultado.erro(
                arquivo,
                campo,
                "deve permanecer vazio no modo portfólio; contatos externos são proibidos",
            )
    area = dados.get("area")
    if isinstance(area, str) and not area.strip():
        resultado.erro(arquivo, "area", "deve explicar que não existe atendimento")


def validar_lista(
    dados: Any,
    arquivo: str,
    validador: Any,
    resultado: Resultado,
) -> None:
    if not isinstance(dados, list):
        resultado.erro(arquivo, "$", "deve ser uma lista JSON")
        return
    ordens: list[int] = []
    for indice, registro in enumerate(dados):
        ordem = validador(registro, f"{arquivo}[{indice}]", resultado)
        if ordem is not None:
            ordens.append(ordem)
    validar_ordens(ordens, arquivo, resultado)


def validar_links_portfolio(resultado: Resultado) -> None:
    html_path = RAIZ / "index.html"
    app_path = RAIZ / "app.js"
    try:
        html = html_path.read_text(encoding="utf-8")
        app = app_path.read_text(encoding="utf-8")
    except OSError as erro:
        resultado.erro("index.html/app.js", "$", f"não foi possível ler: {erro}")
        return

    coletor = ColetorLinks()
    coletor.feed(html)
    for linha, href in coletor.links:
        if not href or not href.startswith("#"):
            resultado.erro(
                "index.html", f"linha {linha}", f"link deve ser âncora interna: {href!r}"
            )

    for arquivo, conteudo in (("index.html", html), ("app.js", app)):
        for nome, padrao in PADROES_CONTATO.items():
            if padrao.search(conteudo):
                resultado.erro(
                    arquivo,
                    "contato",
                    f"padrão de contato externo habilitado ou referenciado: {nome}",
                )


def validar_repositorio() -> Resultado:
    resultado = Resultado()
    caminhos = {
        "site": RAIZ / "data/site.json",
        "servicos": RAIZ / "data/servicos.json",
        "comparacoes": RAIZ / "data/comparacoes.json",
    }
    dados = {nome: carregar_json(caminho, resultado) for nome, caminho in caminhos.items()}

    if dados["site"] is not None:
        validar_site(dados["site"], "data/site.json", resultado)
    if dados["servicos"] is not None:
        validar_lista(
            dados["servicos"], "data/servicos.json", validar_servico, resultado
        )
    if dados["comparacoes"] is not None:
        validar_lista(
            dados["comparacoes"],
            "data/comparacoes.json",
            validar_comparacao,
            resultado,
        )
    validar_links_portfolio(resultado)
    return resultado


def validar_fixture(caminho: Path, tipo: str) -> Resultado:
    resultado = Resultado()
    dados = carregar_json(caminho, resultado)
    if dados is None:
        return resultado
    arquivo = caminho_exibicao(caminho)
    if tipo == "servico":
        validar_servico(dados, arquivo, resultado)
    else:
        validar_comparacao(dados, arquivo, resultado)
    return resultado


def imprimir_resultado(resultado: Resultado, contexto: str) -> int:
    for aviso in resultado.avisos:
        print(f"AVISO: {aviso}")
    if resultado.erros:
        for erro in resultado.erros:
            print(f"ERRO: {erro}", file=sys.stderr)
        print(
            f"FALHA: {len(resultado.erros)} erro(s) encontrado(s) em {contexto}.",
            file=sys.stderr,
        )
        return 1
    print(
        f"OK: {contexto} válido; {len(resultado.imagens)} imagem(ns) local(is) verificada(s)."
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Valida conteúdo, imagens e links internos da Prime-Clean."
    )
    parser.add_argument("--fixture", type=Path, help="valida um único fixture JSON")
    parser.add_argument(
        "--tipo",
        choices=("servico", "comparacao"),
        help="tipo do registro passado em --fixture",
    )
    argumentos = parser.parse_args()

    if argumentos.fixture:
        if not argumentos.tipo:
            parser.error("--tipo é obrigatório quando --fixture é usado")
        resultado = validar_fixture(argumentos.fixture, argumentos.tipo)
        return imprimir_resultado(resultado, caminho_exibicao(argumentos.fixture))
    if argumentos.tipo:
        parser.error("--tipo só pode ser usado com --fixture")

    resultado = validar_repositorio()
    return imprimir_resultado(resultado, "dados do repositório")


if __name__ == "__main__":
    raise SystemExit(main())
