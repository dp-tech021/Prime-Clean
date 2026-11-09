# QA do projeto demonstrativo

Auditoria da branch `feat/portfolio-demonstracao`, realizada em 09/11/2026.

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
