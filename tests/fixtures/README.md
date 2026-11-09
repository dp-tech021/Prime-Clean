# Fixtures não publicáveis

Estes registros existem somente para testar `scripts/validar_conteudo.py`. Eles
ficam fora de `data/` e `media/`, não são carregados pelo site nem apresentados
no Pages CMS.

- `servico_valido.json`: deve passar.
- `servico_sem_imagem.json`: deve passar e usar o fallback gráfico no site.
- `comparacao_foto_ausente.json`: deve falhar por referência quebrada.
- `comparacao_url_externa.json`: deve falhar por URL externa.
- `site_principal_ausente.json`: deve falhar por foto principal inexistente.
- `site_principal_oculto_sem_imagem.json`: deve passar e permitir o fallback
  gráfico quando a foto principal estiver oculta.
- `site_alt_principal_invalido.json`: deve falhar por texto alternativo sem
  identificação de imagem fictícia ou gerada por IA.
