# Prime-Clean — case fictício de portfólio

> **Projeto fictício para portfólio — demonstração de interface e gerenciamento
> de conteúdo; não é uma empresa em operação.**

A Prime-Clean é uma marca criada para o portfólio de dois desenvolvedores em
formação. O case mostra como construir uma interface estática responsiva,
separar conteúdo dos componentes visuais e preparar um fluxo editorial baseado
em Git. Não existem empresa, clientes, atendimento ou contatos comerciais.

## Objetivo e público

O objetivo é demonstrar fundamentos de frontend, acessibilidade, conteúdo
estruturado, automação de QA e documentação de publicação. O público pretendido
é formado por recrutadores, pessoas desenvolvedoras iniciantes e avaliadores de
portfólio que queiram inspecionar tanto a interface quanto as decisões técnicas.

O tema de higienização serve apenas como contexto visual. Imagens de serviços e
comparações são sintéticas, geradas por IA e rotuladas como simulação; não são
trabalhos realizados nem garantias de resultado.

## Capturas reais do ambiente local

![Início do projeto em viewport desktop](docs/capturas/inicio-desktop.jpg)

![Início do projeto em viewport móvel](docs/capturas/inicio-mobile.jpg)

As capturas foram obtidas localmente com Chromium em 1280 × 900 e 360 × 800 px.
O procedimento e o resultado da verificação estão em
[`docs/capturas/README.md`](docs/capturas/README.md). Elas não representam um
deploy público.

## Stack e recursos

- HTML semântico, CSS responsivo e JavaScript puro, sem framework no site;
- adaptador público para Supabase, com ativação controlada e rollback em JSON;
- foto principal, cartões e comparadores com imagens sintéticas administráveis;
- navegação por teclado, foco visível, menu móvel e respeito a movimento reduzido;
- painel próprio em `admin/` para textos, visibilidade, ordem e mídias;
- `_headers` com CSP restrita e Worker para configuração pública em runtime;
- validador Python com biblioteca padrão, fixtures e GitHub Actions.
- Supabase Auth, PostgreSQL, RLS e Storage no backend já existente.

## Arquitetura

O navegador recebe arquivos estáticos e `app.js` usa `public-content.mjs` para
consultar somente linhas públicas do Supabase. O adaptador cruza as referências
com `media_assets`, valida a origem e o bucket das imagens e entrega conteúdo ao
DOM por `textContent`. As policies RLS continuam sendo a autorização efetiva.

O comparador só publica registros completos marcados como demonstrativos. Os
contatos permanecem vazios e todos os CTAs navegam dentro da página. O painel
administrativo atualiza o Supabase; após o cutover, o próximo recarregamento do
site reflete essas edições sem commit ou novo deploy.

A foto principal vem de `site_settings` e `media_assets`. Se estiver oculta ou
falhar, a ilustração CSS acessível permanece. Serviços continuam íntegros sem
foto; pares incompletos ou com mídia não pública não são exibidos. Os JSONs
ficam disponíveis somente para rollback manual temporário.

## Divisão de trabalho em dupla

A documentação não atribui commits anteriores a uma pessoa específica. Para
manter uma divisão verificável sem inventar autoria, o projeto trabalha com duas
frentes e revisão cruzada:

- **Frente de interface:** HTML, CSS, responsividade, acessibilidade e revisão
  visual;
- **Frente de conteúdo e qualidade:** Supabase, RLS, validação,
  documentação e CI.

Cada mudança passa pela revisão da outra frente antes do merge. As frentes podem
trocar de responsável para que ambos pratiquem as duas áreas.

## Executar e testar

Pré-requisitos: Python 3.10+ e Node.js. Nenhuma biblioteca adicional é exigida.

```bash
python3 scripts/validar_conteudo.py
python3 scripts/auditar_midias.py
python3 -m unittest discover -s tests -p "test_*.py" -v
node --check app.js
node --check public-content.mjs
node --test tests/public-content.test.mjs
python3 -m http.server 8000
```

Abra `http://localhost:8000`. O resultado esperado do validador começa com:

```text
OK: dados do repositório válido; 12 imagem(ns) local(is) verificada(s).
OK: 12 mídia(s) referenciada(s) existe(m); 0 arquivo(s) órfão(s).
```

Os 11 testes devem terminar com `OK`; `node --check` não produz saída em
sucesso. Falhas retornam código diferente de zero e identificam arquivo, índice
e campo. Consulte [`QA-PUBLICACAO.md`](QA-PUBLICACAO.md) para o checklist.

## Publicação e indexação

A equipe optou explicitamente por permitir a indexação da publicação principal
do portfólio. O bloqueio global `X-Robots-Tag: noindex, nofollow` foi removido de
`_headers`, preservando a CSP e os demais cabeçalhos. Previews do Cloudflare
Pages continuam recebendo `X-Robots-Tag: noindex` automaticamente.

Nenhum deploy ou domínio é declarado neste repositório. O passo a passo, a
configuração sem framework e os comandos de verificação com uma URL real estão
em [`DEPLOY-PORTFOLIO.md`](DEPLOY-PORTFOLIO.md).

## Fonte editorial e rollback

O painel próprio é a fonte editorial vigente. Pages CMS, `.pages.yml` e os três
JSONs são mantidos temporariamente como legado e rollback manual; eles não devem
receber edições paralelas depois do cutover.

## Painel administrativo experimental

A estrutura inicial em [`admin/`](admin/README.md) demonstra login por e-mail e
senha com Supabase Auth e autorização separada por RLS. Uma sessão autenticada
somente acessa o painel quando a leitura do próprio registro em `admin_users`
confirma `active=true`. As telas
de gerenciamento permitem administrar foto principal, serviços, comparações e
biblioteca no backend separado. O cutover é controlado por
`PUBLIC_CONTENT_SOURCE` no Worker e exige homologação antes de usar `supabase`.

## O que aprendemos / decisões técnicas

- Um site pequeno pode separar conteúdo e interface sem adotar um framework.
- Validar JSON, tipos e caminhos reduz falhas antes do deploy.
- Dados configuráveis devem chegar ao DOM por `textContent` e URLs locais
  permitidas.
- Conteúdo sintético precisa de rótulos visuais e regras editoriais, não apenas
  uma observação escondida na documentação.
- Fixar Actions por SHA e usar testes da biblioteca padrão mantém o custo e a
  superfície de dependências baixos.
- Produção e preview exigem políticas de indexação diferentes: o case pode ser
  encontrável enquanto versões temporárias permanecem fora dos buscadores.

## O que ainda falta

- testar login e funcionamento real do painel administrativo;
- homologar upload, substituição e limpeza de mídia com uma conta autorizada;
- migrar e revisar os registros antes do cutover;
- homologar no painel a trava operacional de não excluir mídia referenciada;
- executar e registrar o primeiro deploy com sua URL HTTPS real;
- confirmar os cabeçalhos e respostas `200` na hospedagem;
- revisar novamente os limites do plano gratuito antes da publicação.

Os pares locais permanecem no rollback. O site em modo Supabase mostra somente
pares publicados e inteiramente públicos cadastrados no backend.

## Limitações

- não oferece orçamento, atendimento, formulário ou contratação;
- não possui telefone, e-mail, endereço, domínio ou perfil social;
- não usa analytics, autenticação própria ou APIs além do Supabase existente;
- não comprova que o painel ou o Worker foram publicados;
- não representa uma empresa nem resultados de serviços reais.

## Painel administrativo e publicação

A estrutura de banco e segurança está em [`docs/PAINEL-ADMIN-SUPABASE.md`](docs/PAINEL-ADMIN-SUPABASE.md), o painel em [`admin/`](admin/README.md) e a ativação pública em [`DEPLOY-SITE-SUPABASE.md`](DEPLOY-SITE-SUPABASE.md). Nenhum deploy ou cutover é declarado concluído neste repositório.
