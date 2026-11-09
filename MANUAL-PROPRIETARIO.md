# Manual do proprietário — Prime-Clean

Este manual explica como atualizar o site sem editar código. Faça alterações
com calma e confira a prévia antes de divulgar qualquer endereço.

## Antes de começar

Você precisa entrar no Pages CMS com a conta GitHub autorizada para acessar
`dp-tech021/Prime-Clean`. Entrar no Pages CMS não basta: a GitHub App também
precisa ter acesso a este repositório.

Antes de publicar, confirme:

- nome, identidade visual e textos aprovados pela empresa;
- região atendida correta;
- titularidade do perfil do Instagram;
- número de WhatsApp ativo e testado em uma conversa real;
- autorização para publicar cada foto de cliente.

Enquanto essas confirmações estiverem pendentes, mantenha a prévia sem domínio
comercial e não divulgue o endereço como site oficial.

## Alterar contatos e região

1. Abra o Pages CMS e selecione o repositório `dp-tech021/Prime-Clean`.
2. Confira se está trabalhando na branch desejada.
3. Abra **Contatos e área de atendimento**.
4. Atualize Instagram, WhatsApp ou área de atendimento.
5. Salve e espere o commit terminar.
6. Abra a prévia e confira o rodapé, os botões e o texto de contato.

Use o WhatsApp somente depois de confirmar que o número recebe mensagens. O
campo deve conter DDI, DDD e número, apenas com dígitos. O site usa o Instagram
informado como canal alternativo enquanto o WhatsApp estiver vazio.

## Alterar um serviço

1. Abra **Serviços** no Pages CMS.
2. Escolha um item existente ou adicione um item à lista.
3. Preencha título, descrição, texto alternativo e ordem.
4. Envie uma foto em WebP, JPEG ou PNG.
5. Marque **Imagem ilustrativa** quando a imagem não representar um serviço real.
6. Use **Exibir no site** para mostrar ou ocultar o serviço.
7. Salve e confira a prévia em celular e computador.

O texto alternativo deve explicar o conteúdo útil da imagem em uma frase curta.
Não repita apenas o nome do arquivo.

## Publicar um antes e depois

Use apenas duas fotos reais, autorizadas e do mesmo estofado.

1. Abra **Trabalhos (antes e depois)**.
2. Adicione um item à lista.
3. Preencha título, categoria ou serviço e descrição.
4. Envie a foto **antes** e a foto **depois**.
5. Escreva um texto alternativo diferente para cada foto.
6. Informe a ordem em que o trabalho deve aparecer.
7. Confirme que existe autorização de publicação e ative **Consentimento
   confirmado**.
8. Ative **Exibir no site** somente após revisar o par completo.
9. Salve e teste o controle de comparação na prévia.

Um registro incompleto, oculto, sem consentimento ou com arquivo inexistente não
aparece no site. Nunca use imagens geradas por IA ou banco de imagens para
simular resultados.

## Privacidade das fotos

Antes do envio:

- obtenha autorização clara para publicação;
- remova rostos, placas, documentos, endereços e objetos com dados pessoais;
- remova localização, EXIF e outros metadados quando existirem;
- confirme que as duas fotos mostram o mesmo item;
- evite nomes de clientes nos títulos e nomes dos arquivos.

O repositório é público. Uma mídia enviada pode ficar acessível mesmo com o item
oculto. Excluir um registro não apaga automaticamente o arquivo de mídia e não
remove versões antigas do histórico Git.

## Ocultar, excluir e limpar mídias

- Para tirar um conteúdo do site rapidamente, desative **Exibir no site** e
  salve.
- Para excluir, remova o item da lista e salve. Depois confirme na prévia que ele
  desapareceu.
- Acesse a biblioteca de mídia e remova o arquivo somente após confirmar que
  nenhum serviço ou comparação ainda o utiliza.
- A exclusão atual não apaga cópias presentes no histórico Git.

Quando houver dúvida, apenas oculte o item e peça uma revisão técnica.

## Backup antes de uma alteração grande

1. Na página do repositório no GitHub, anote o commit atual da `main`.
2. Use **Code → Download ZIP** para guardar uma cópia local do site.
3. Guarde separadamente os termos de consentimento das fotos; não coloque esses
   documentos no repositório público.
4. Faça a mudança em uma branch e preserve a `main` até a prévia ser aprovada.

O ZIP é uma cópia de segurança prática. O histórico Git continua sendo a fonte
principal para recuperar versões do site.

## Recuperar uma versão

Cada salvamento do Pages CMS cria um commit. Se uma atualização der problema:

1. oculte o conteúdo problemático, se o painel ainda estiver funcionando;
2. localize o commit anterior na aba **Commits** do GitHub;
3. crie uma branch de recuperação a partir da `main`;
4. reverta o commit problemático com `git revert <commit>` ou restaure os
   arquivos a partir do commit anterior;
5. teste a branch e abra um PR para revisão.

Peça ajuda técnica se não estiver confortável com Git. Não apague nem reescreva
o histórico compartilhado da `main`.

## Conferência depois de salvar

- a página abre sem aviso de erro;
- o menu funciona no celular e fecha com Escape no teclado;
- títulos, acentos e ordem estão corretos;
- imagens carregam sem distorção e têm texto alternativo;
- conteúdos ocultos não aparecem;
- a galeria não mostra pares incompletos;
- Instagram abre o perfil informado;
- WhatsApp só aparece depois do teste do número;
- não há rosto, placa, endereço ou dado pessoal nas fotos.

## Limites desta configuração

O site é estático e não tem banco de dados. O Pages CMS salva mudanças como
commits no GitHub. A hospedagem pode manter cache por alguns minutos, e uma
alteração pode demorar a aparecer. Não há analytics instalado.

O acesso autenticado ao Pages CMS e o ciclo real de upload ainda precisam ser
validados pelo proprietário. Não considere o painel aprovado antes de executar
o roteiro registrado em `QA-PUBLICACAO.md`.
