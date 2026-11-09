# Capturas locais verificadas

As imagens desta pasta foram capturadas em 09/11/2026 a partir de
`python3 -m http.server 8768`, usando Chromium headless e Playwright já
disponíveis no ambiente de QA. Nenhuma dependência foi adicionada ao projeto.

- `inicio-desktop.jpg`: viewport de 1280 × 900 px.
- `inicio-mobile.jpg`: viewport de 360 × 800 px.

Na mesma execução foram verificados 360, 768 e 1280 px: aviso de ficção visível
no topo e no rodapé, foto principal editável e rotulada, cinco serviços, três
comparações e 12 de 12 imagens carregadas. Não houve link externo, erro
HTTP/JavaScript ou overflow horizontal. No viewport móvel, o menu abriu por
teclado e fechou com `Escape`.

As capturas mostram o site servido localmente. Elas não comprovam um deploy.
