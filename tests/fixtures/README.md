# Fixtures não publicáveis

Estes registros existem somente para testar `scripts/validar_conteudo.py`. Eles
ficam fora de `data/` e `media/`, não são carregados pelo site nem apresentados
no Pages CMS.

- `servico_valido.json`: deve passar.
- `comparacao_foto_ausente.json`: deve falhar por referência quebrada.
- `comparacao_url_externa.json`: deve falhar por URL externa.
