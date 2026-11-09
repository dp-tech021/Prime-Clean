# QA do projeto demonstrativo

Auditoria visual original da branch `feat/portfolio-demonstracao` e automação
reproduzível adicionada em `test/qa-automatizado` em 09/11/2026.

## Gerenciamento de imagens pelo proprietário

Na branch `feat/gerenciamento-imagens-proprietario`, a foto principal foi
integrada a `data/site.json` e ao Pages CMS. A auditoria confirmou zero órfãos e
12 referências válidas. O navegador validou:

- foto principal carregada e rotulada como gerada por IA;
- fallback gráfico acessível quando a foto principal retorna 404;
- serviço sem foto preservado com fallback;
- adição, ocultação, ordem e remoção de serviços e comparações por JSON;
- comparação com imagem ausente removida sem quebrar a página;
- 360, 768 e 1280 px sem overflow ou links externos.

O teste autenticado no Pages CMS continua pendente. Não foram executados login,
upload ou commit pelo serviço hospedado.

## Preparação do case e publicação

Na branch `docs/publicacao-portfolio`, o QA automatizado passou novamente. O
teste em Chromium percorreu a página em 360, 768 e 1280 px e confirmou os dois
avisos de ficção, 11 de 11 imagens carregadas, menu móvel por teclado, ausência
de links externos, erros HTTP/JavaScript e overflow horizontal.

A equipe optou explicitamente por permitir a indexação da futura publicação de
produção. Apenas o `X-Robots-Tag: noindex, nofollow` global foi removido de
`_headers`; CSP, Permissions Policy, Referrer Policy, `nosniff` e proteção
contra frames foram preservados. O deploy e a validação dos cabeçalhos reais
continuam pendentes, conforme `DEPLOY-PORTFOLIO.md`.

## Automação reproduzível

Pré-requisitos: Python 3.10+ e Node.js. Não há dependências externas de teste.

```bash
python3 scripts/validar_conteudo.py
python3 scripts/auditar_midias.py
python3 -m unittest discover -s tests -p "test_*.py" -v
node --check app.js
```

Resultado local desta branch:

```text
OK: dados do repositório válido; 12 imagem(ns) local(is) verificada(s).
OK: 12 mídia(s) referenciada(s) existe(m); 0 arquivo(s) órfão(s).
Ran 11 tests in ...
OK
```

`node --check app.js` terminou com código 0 e sem saída. As fixtures inválidas
cobrem arquivo ausente, URL externa e texto alternativo inadequado. A fixture de
serviço sem foto passa para confirmar o contrato de fallback.

O validador usa somente a biblioteca padrão. Duplicidade de `order` e lista fora
de ordem geram aviso, pois o contrato atual permite empate e o frontend ordena
os registros. Tipo incorreto, booleano no lugar de inteiro ou valor menor que 1
geram erro.

## GitHub Actions

`.github/workflows/qa.yml` roda em pull requests e pushes para `main`, com
permissão somente de leitura. Versões verificadas diretamente nos repositórios
oficiais e fixadas por SHA:

- `actions/checkout@v7`: `3d3c42e5aac5ba805825da76410c181273ba90b1`;
- `actions/setup-python@v7`: `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0`;
- `actions/setup-node@v7`: `949feb2413d6458794dcd2491c4babbbce0c15c1`.

O workflow não foi executado no GitHub durante a preparação local. Seu status
deve ser conferido no PR; não há aprovação de CI presumida.

## Painel administrativo — autenticação

Execute separadamente no diretório `admin/`:

```bash
npm ci
npm test
npm run build
```

Os testes automatizados simulam administrador ativo e inativo, usuário sem
cadastro, falha de rede, credenciais inválidas, restauração, expiração e logout.
Também verificam que o painel segue o contrato RLS das migrations oficiais da
raiz e que não existe outra árvore de migrations em `admin/`.

O gerenciamento de imagens acrescenta casos de upload válido, MIME inválido,
arquivo maior que 5 MiB, bloqueio sem autorização, falha de conexão,
compensação de cadastro, substituição com nome novo, par repetido, exclusão
referenciada e limpeza de mídia órfã. O build continua auditado contra
credenciais privilegiadas.

Os testes SQL em `supabase/tests/rls_sem_credenciais.sql` são transacionais e
destinados a banco local ou descartável autorizado. Login real, revogação de
sessão e chamada direta à API ainda dependem de contas controladas pela dupla e
devem permanecer marcados como pendentes até execução efetiva.

Também permanecem pendentes os testes E2E com Storage real: upload, troca,
ocultação, ordenação, bloqueio por FK/policy, exclusão e reconciliação entre
arquivo e registro. Não usar o projeto remoto para dados de teste sem aprovação.

## Contexto validado

A Prime-Clean é uma marca fictícia para portfólio de dois desenvolvedores em
formação. O site não representa empresa, clientes, serviços realizados ou
canais comerciais.

## Controles de conteúdo

- aviso de ficção visível antes da primeira dobra e repetido no rodapé;
- WhatsApp e Instagram vazios em `data/site.json`;
- nenhuma lógica de navegação para contatos externos no frontend;
- CTAs limitados a âncoras internas;
- cinco serviços preservados com imagens locais, textos alternativos e rótulo
  **Imagem ilustrativa / gerada por IA**;
- três comparações inteiramente sintéticas, marcadas com `demonstrative: true`,
  `consentConfirmed: false` e aviso visual de simulação;
- frontend aceita somente comparações publicadas e demonstrativas;
- conteúdo configurável inserido com `textContent` e caminhos locais validados.

## Validações executadas

- [x] `node --check app.js`.
- [x] `python3 -m json.tool` nos três arquivos de `data/`.
- [x] `.pages.yml` analisado com PyYAML.
- [x] Servidor HTTP local em 360 px, 768 px e 1280 px.
- [x] Menu móvel por clique e teclado; fechamento com Escape e retorno de foco.
- [x] Link de salto, FAQ e comparador acessíveis por teclado.
- [x] Aviso de ficção presente no topo e no rodapé.
- [x] Todos os CTAs usam âncoras internas.
- [x] Nenhum link externo, `wa.me`, `instagram.com`, `mailto:` ou `tel:` na
  interface executada.
- [x] Cinco cartões de serviço e três comparações sintéticas carregados.
- [x] Todas as imagens referenciadas existem e carregam sem erro.
- [x] Exclusão de arquivo referenciado bloqueada pela auditoria de mídia.
- [x] Arquivo órfão listado sem exclusão automática.
- [x] Sem erro JavaScript, resposta HTTP com erro ou overflow horizontal.
- [x] Nenhuma dependência de execução adicionada.

## Pages CMS

O schema foi preservado e atualizado para linguagem demonstrativa. Os campos de
contato continuam presentes apenas para mostrar a configuração do editor. O
campo `consentConfirmed` não é prova jurídica; nas simulações ele permanece
falso e o campo separado `demonstrative` identifica o conteúdo sintético.

O login e a edição autenticada no Pages CMS não foram testados nesta etapa.

## GitHub e publicação

A conectividade Git de leitura e escrita foi validada pelo remoto configurado.
O plugin GitHub marcado pelo usuário não disponibilizou ferramentas nesta
sessão, e a credencial do `gh` não autorizou chamadas de API. Nenhum deploy ou
merge foi realizado.

## Rollback

Antes do merge, descarte a branch ou feche o PR. Depois de eventual merge,
reverta o commit desta mudança com `git revert <sha>` em uma nova branch, execute
novamente o checklist e abra outro PR. Reverter o Git não remove automaticamente
uma prévia externa, caso ela seja criada no futuro.

## Integração pública com Supabase

O adaptador em `public-content.mjs` deve passar em:

```bash
node --test tests/public-content.test.mjs
node --check app.js
node --check public-content.mjs
node --check worker/index.mjs
```

O modo `json` preserva a página atual durante a homologação. Em modo `supabase`,
falha de rede deve deixar foto, serviços e comparações indisponíveis, sem voltar
automaticamente aos dados antigos. Testes com o projeto real, a URL de preview
e uma conta anônima ainda precisam ser registrados antes do cutover.
