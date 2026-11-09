# Site público com Supabase no Cloudflare Workers

Este procedimento prepara o site fictício para ler conteúdo publicado no
Supabase sem novo commit a cada edição. Ele não executa deploy, não migra dados
e não altera o projeto Supabase.

## Como a configuração chega ao navegador

Variáveis do Cloudflare Worker existem no processo do Worker; elas não aparecem
automaticamente em `app.js`. O Worker em `worker/index.mjs` responde
`/api/public-config` com três valores públicos e sem cache:

- `PUBLIC_CONTENT_SOURCE`: `json` durante homologação ou `supabase` no cutover;
- `SUPABASE_URL`: deve ser exatamente `https://zffigzpmwcbmqfgrhrao.supabase.co`;
- `SUPABASE_PUBLISHABLE_KEY`: somente a chave publicável, nunca `service_role`
  ou `sb_secret_`.

A chave publicável será visível no navegador por definição. RLS continua sendo
o controle de acesso. O endpoint recusa origem diferente e chaves elevadas.

`public-content-config.json` mantém `json` como modo de compatibilidade quando o
site é servido fora do Worker. Em um deploy Worker, a resposta marcada pelo
cabeçalho `X-Prime-Clean-Config: worker` prevalece. Se o Worker indicar
`supabase` com configuração incompleta, o frontend falha fechado.

## Prévia sem cutover

Pré-requisitos: Node.js 22+, conta Cloudflare legítima e Wrangler 4.159.0,
versão consultada no npm em 09/11/2026.

1. No painel Cloudflare, crie/configure o Worker ligado a este repositório ou
   autentique o Wrangler na conta correta.
2. Configure `PUBLIC_CONTENT_SOURCE=json`.
3. Configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. A chave pode ficar em
   variável criptografada, embora seja deliberadamente pública no frontend.
4. Rode localmente:

```bash
node scripts/build_public.mjs
npx wrangler@4.159.0 dev
```

5. Confira `/api/public-config`: deve responder `{"mode":"json"}` e
   `Cache-Control: no-store`.
6. Faça o deploy de preview pelo fluxo da conta, sem direcionar domínio de
   produção. Não invente URL; registre apenas a URL realmente fornecida.

## Homologação e ativação

Antes do cutover, confirme no banco que a foto principal, serviços, comparações
e `media_assets` já foram migrados e revisados. Os JSONs não são enviados ao
Supabase automaticamente por este código.

Na prévia, mude somente `PUBLIC_CONTENT_SOURCE` para `supabase` e valide:

- foto principal publicada e troca após recarregar;
- serviço visível, ocultação e `sort_order`;
- comparação publicada, despublicação e slider por teclado/toque;
- mídia com `public_visible=false` ausente;
- seções vazias quando não há registros;
- erro de rede sem retorno aos JSONs;
- RLS negando escrita anônima.

Depois da aprovação, aplique a mesma variável no ambiente de produção. Esse é
o cutover controlado. Edições posteriores feitas pelo painel chegam ao site no
próximo recarregamento, sem commit ou deploy.

## Verificação HTTP

Substitua apenas `<URL_REAL>` por uma URL obtida do Cloudflare:

```bash
curl -fsS -D - <URL_REAL>/api/public-config
curl -fsSI <URL_REAL>/
curl -fsSI <URL_REAL>/app.js
```

Confira HTTPS, status 200, CSP restrita à origem Supabase esperada e ausência de
cache na configuração. Use DevTools para confirmar que as consultas públicas
são somente `GET` e que nenhuma credencial elevada aparece.

## Rollback

Altere `PUBLIC_CONTENT_SOURCE` para `json`. Os arquivos em `data/` e `media/`
ficam preservados temporariamente para esse rollback manual. Depois do cutover,
eles não são fallback automático de erros do Supabase. Não apague dados ou
objetos do Storage durante o rollback.
