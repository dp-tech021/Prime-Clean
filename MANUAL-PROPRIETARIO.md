# Manual legado — Pages CMS e rollback da Prime-Clean

> O fluxo editorial vigente está no painel próprio descrito em
> [`admin/MANUAL-IMAGENS.md`](admin/MANUAL-IMAGENS.md). Este documento permanece
> somente para recuperar ou revisar os JSONs antigos durante o período de
> rollback. Depois do cutover, não edite Pages CMS e Supabase em paralelo.

> **Projeto fictício para portfólio — demonstração de interface e gerenciamento
> de conteúdo; não é uma empresa em operação.**

Este manual descreve como explorar o Pages CMS como ferramenta didática. A
Prime-Clean não presta serviços, não recebe pedidos e não possui contatos
comerciais.

## Acessar o painel demonstrativo

1. Entre no Pages CMS com uma conta GitHub autorizada.
2. Abra o repositório `dp-tech021/Prime-Clean`.
3. Selecione uma branch de teste, nunca a `main` diretamente.
4. Confira os editores de campos institucionais, serviços demonstrativos e
   comparações demonstrativas.

O login no CMS não concede acesso sozinho. A GitHub App também precisa estar
autorizada para o repositório.

## Campos institucionais

`data/site.json` preserva `whatsapp`, `instagram` e `area` para demonstrar um
schema já existente. Neste portfólio:

- `whatsapp` deve permanecer vazio;
- `instagram` deve permanecer vazio;
- `area` deve informar que não existe área de atendimento.

A interface ignora contatos externos e não cria links comerciais, mesmo que
esses campos sejam alterados por engano.

## Gerenciar a foto principal

1. Abra **Campos institucionais (demonstração)**.
2. Em **Foto principal ilustrativa**, selecione ou envie WebP, JPEG ou PNG.
3. Preencha uma descrição objetiva e declare que a imagem é ilustrativa ou
   gerada por IA.
4. Mantenha **Foto principal ilustrativa ou gerada por IA** ativado.
5. Ative **Exibir foto principal**, salve e revise a prévia.

Para substituir, selecione outra imagem e salve. Para ocultar sem excluir,
desative **Exibir foto principal**; a ilustração gráfica acessível reaparece.
Para remover a referência, primeiro oculte, depois limpe a foto e o texto
alternativo. Não apague o arquivo da biblioteca antes da auditoria de órfãos.

## Editar um serviço demonstrativo

1. Abra **Serviços demonstrativos**.
2. Escolha um cartão ou use **Add an item** para adicionar outro.
3. Edite título, descrição, foto, ordem ou visibilidade.
4. Quando houver foto, descreva-a e declare que é ilustrativa/gerada por IA.
5. Deixe **Imagem ilustrativa ou gerada por IA** ativado.
6. Use números menores em **Ordem** para mostrar primeiro. Arrastar o item no
   editor não substitui a atualização desse número.
7. Desative **Exibir no site** para ocultar sem apagar.
8. Para remover somente a foto, limpe `image` e `imageAlt`: o cartão continuará
   com um fallback gráfico. Use a lixeira do item para remover o cartão inteiro.
9. Salve e confira a branch em servidor local ou prévia.

As imagens existentes são sintéticas. Elas não podem ser descritas como
fotografias de trabalhos ou clientes.

## Editar uma comparação sintética

1. Abra **Comparações demonstrativas**.
2. Abra um par ou use **Add an item** para criar outro.
3. Use somente um par inteiramente sintético do mesmo objeto em dois estados.
4. Preencha título, categoria, descrição, duas fotos e textos alternativos.
5. Mantenha **Simulação gerada por IA** ativado.
6. Mantenha `consentConfirmed` desativado.
7. Ajuste **Ordem**; números menores aparecem primeiro.
8. Use **Exibir na demonstração** somente após revisar as duas imagens. Desative
   para ocultar sem apagar.
9. Substitua cada foto pelo seletor correspondente. Para remover o par, use a
   lixeira do item; não deixe somente uma das imagens.
10. Salve e teste o controle por mouse, toque e teclado.

`consentConfirmed` existe por compatibilidade com o schema original. Em dados
sintéticos, ele não representa nem comprova consentimento jurídico. O campo
separado `demonstrative` identifica a simulação e é exigido pelo frontend.

## Mídias

- use WebP, JPEG ou PNG local;
- não baixe imagens de terceiros sem licença;
- não inclua pessoas, placas, documentos, endereços ou dados pessoais;
- identifique conteúdo gerado por IA no texto alternativo e na descrição;
- confirme que um par comparativo mostra o mesmo objeto.

Excluir um item da lista não remove automaticamente sua mídia nem versões
antigas do histórico Git. Embora este projeto use apenas arquivos sintéticos,
revise referências antes de apagar qualquer arquivo.

### Limpeza segura de arquivos órfãos

Na raiz do repositório, execute:

```bash
python3 scripts/auditar_midias.py
python3 scripts/auditar_midias.py --verificar-exclusao CAMINHO_DA_IMAGEM
```

O primeiro comando lista órfãos sem apagar nada. O segundo retorna
`BLOQUEADO` e código `2` se algum JSON ainda usa o arquivo. Remova a referência
primeiro, salve e só exclua a mídia quando receber `OK PARA LIMPEZA`.

Depois da exclusão, execute:

```bash
python3 scripts/validar_conteudo.py
python3 scripts/auditar_midias.py
python3 -m unittest discover -s tests -p "test_*.py" -v
node --check app.js
```

O GitHub Actions repete essas verificações e deve impedir o merge de referência
quebrada. Ele não recupera automaticamente um arquivo apagado.

## Checklist de homologação no Pages CMS

Execute em uma branch descartável e anote o commit criado em cada etapa:

- [ ] autenticar com GitHub e confirmar que a GitHub App acessa somente o
  repositório autorizado;
- [ ] abrir a branch e verificar as três bibliotecas: foto principal, serviços
  e comparações;
- [ ] enviar uma imagem sintética de teste com nome seguro;
- [ ] selecionar a imagem como foto principal, preencher o `alt` e salvar;
- [ ] substituir a foto principal e depois ocultá-la;
- [ ] adicionar um serviço, trocar/remover sua foto, reordenar por `order`,
  ocultar e remover o item;
- [ ] adicionar um par completo, substituir `before` e `after`, reordenar,
  ocultar, publicar temporariamente e remover o item;
- [ ] abrir a prévia e confirmar avisos fictícios, fallbacks e ausência de 404;
- [ ] confirmar no GitHub os commits e arquivos alterados pelo CMS;
- [ ] executar a auditoria, remover somente mídias de teste confirmadas como
  órfãs e repetir o QA;
- [ ] reverter os dados de teste e confirmar a prévia limpa.

Esta homologação ainda está pendente. Configuração válida e testes locais não
comprovam autenticação, upload ou publicação na instalação hospedada.

## Backup e recuperação

Antes de uma alteração ampla:

1. anote o commit atual da `main`;
2. crie uma branch;
3. opcionalmente, use **Code → Download ZIP** no GitHub;
4. salve pelo CMS e revise o commit criado.

Para desfazer uma alteração, crie uma branch de recuperação e use
`git revert <commit>`. Teste novamente e abra um PR. Não reescreva o histórico
compartilhado da `main`.

## Checklist da prévia

- o aviso de projeto fictício aparece no topo e no rodapé;
- nenhum botão abre telefone, e-mail, mapa, WhatsApp ou rede social;
- os cinco serviços aparecem com aviso de imagem gerada por IA;
- a foto principal aparece com aviso de imagem gerada por IA, ou o fallback
  gráfico aparece quando ela está oculta/ausente;
- todas as comparações visíveis mostram o rótulo **SIMULAÇÃO**;
- menu, FAQ e comparador funcionam por teclado;
- conteúdos ocultos não aparecem;
- não há erro de imagem ou overflow horizontal.
- nenhuma mídia referenciada aparece como candidata à limpeza.

## Limites

O site é estático, não tem banco de dados e não possui formulário funcional. O
Pages CMS cria commits no GitHub e serve apenas como demonstração de um fluxo de
administração de conteúdo. Nenhuma alteração deve transformar o protótipo em
uma empresa aparente ou adicionar contatos de terceiros.
