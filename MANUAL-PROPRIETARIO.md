# Manual da demonstração — Prime-Clean

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

## Editar um serviço demonstrativo

1. Abra **Serviços demonstrativos**.
2. Escolha um dos cinco cartões.
3. Edite título, descrição, ordem ou visibilidade.
4. Mantenha um texto alternativo que descreva a imagem.
5. Deixe **Imagem ilustrativa ou gerada por IA** ativado.
6. Salve e confira a branch em servidor local ou prévia.

As imagens existentes são sintéticas. Elas não podem ser descritas como
fotografias de trabalhos ou clientes.

## Editar uma comparação sintética

1. Abra **Comparações demonstrativas**.
2. Use somente um par inteiramente sintético do mesmo objeto em dois estados.
3. Preencha título, categoria, descrição e textos alternativos.
4. Mantenha **Simulação gerada por IA** ativado.
5. Mantenha `consentConfirmed` desativado.
6. Use **Exibir na demonstração** somente após revisar as duas imagens.
7. Salve e teste o controle por mouse, toque e teclado.

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
- todas as comparações visíveis mostram o rótulo **SIMULAÇÃO**;
- menu, FAQ e comparador funcionam por teclado;
- conteúdos ocultos não aparecem;
- não há erro de imagem ou overflow horizontal.

## Limites

O site é estático, não tem banco de dados e não possui formulário funcional. O
Pages CMS cria commits no GitHub e serve apenas como demonstração de um fluxo de
administração de conteúdo. Nenhuma alteração deve transformar o protótipo em
uma empresa aparente ou adicionar contatos de terceiros.
