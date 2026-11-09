# Pages CMS — Prime-Clean

> A Prime-Clean é uma marca fictícia de portfólio. Esta integração demonstra
> administração de conteúdo baseada em Git; não gerencia uma empresa real.

O repositório contém `.pages.yml` na raiz. O frontend lê contatos, serviços e
comparações de `data/site.json`, `data/servicos.json` e
`data/comparacoes.json` por HTTP. A configuração hospedada ainda
precisa ser aberta e testada pelo proprietário no Pages CMS.

Fazer login com GitHub não concede acesso ao repositório por si só. O início
rápido oficial também exige instalar a GitHub App na conta ou organização que
possui o repositório e autorizar o repositório desejado.

## Conteúdo editável

- **Campos institucionais:** `data/site.json`; Instagram e WhatsApp permanecem
  vazios e a área informa que não há atendimento.
- **Serviços:** `data/servicos.json`, um array JSON editável com título,
  descrição, foto, texto alternativo, indicação de imagem ilustrativa, ordem e
  visibilidade.
- **Trabalhos:** `data/comparacoes.json`, array de pares antes/depois consumido
  diretamente pelo frontend.

As fotos de serviço ficam em `media/fotos-servicos/`. O CMS aceita WebP, JPEG e
PNG, aplica nomes seguros (`rename: safe`) e grava caminhos públicos estáveis em
`/media/fotos-servicos/`. Fotos de comparações ficam em `media/comparacoes/`,
também com nomes seguros e caminhos públicos em `/media/comparacoes/`.

## Por que um único arquivo de comparações

`data/comparacoes.json` usa `type: file`, `format: json` e `list: true`, a forma
documentada para um array no topo. O editor permite manter os itens no próprio
arquivo; o campo `order` controla a ordem pública. Isso evita uma coleção de
arquivos individuais, que exigiria um índice gerado para o JavaScript descobrir
os registros em uma hospedagem estática.

Cada comparação exige título, serviço, imagem antes, imagem depois e textos
alternativos. O frontend deste portfólio mostra apenas registros publicados com
`demonstrative: true`, imagens locais distintas e campos completos. O campo
`consentConfirmed` permanece no schema, mas fica falso nas simulações e não
constitui prova jurídica de consentimento.

## Permissões

A documentação oficial da GitHub App lista estas permissões:

- endereço de e-mail da conta: leitura;
- administração do repositório: leitura e escrita;
- Actions: leitura e escrita;
- checks e status de commit: leitura;
- conteúdo do repositório: leitura e escrita;
- metadados do repositório: leitura.

Ela também usa eventos de instalação, repositório, push, exclusão, checks,
status e execução de workflows. Na instalação hospedada, limite o acesso ao
repositório `dp-tech021/Prime-Clean` em vez de conceder acesso a todos os
repositórios. Não copie tokens, chaves privadas ou segredos para este projeto.

## Teste manual obrigatório com o proprietário

Este fluxo ainda não foi executado nesta tarefa:

1. entrar em https://app.pagescms.org/ com a conta autorizada;
2. confirmar que a GitHub App está instalada e consegue abrir
   `dp-tech021/Prime-Clean`;
3. selecionar a branch que contém a configuração e confirmar o editor
   **Comparações demonstrativas** e a mídia **Fotos de antes e depois**;
4. criar uma simulação de teste com duas imagens sintéticas claramente marcadas,
   sem pessoas ou dados pessoais, mantendo `published: false`;
5. editar título e descrição, trocar uma foto e alterar `order`;
6. ativar `demonstrative`, ocultar, publicar durante a verificação e ocultar de novo;
7. servir o site por HTTP e confirmar slider, rótulos e ordem;
8. excluir o item de teste e confirmar que ele saiu do site;
9. revisar e remover manualmente as mídias de teste que ficaram órfãs.

Nunca considere o CMS validado apenas porque `.pages.yml` é YAML válido. O teste
acima confirma acesso, schema, gravação no Git e integração com a página.

## Recuperar uma alteração

As edições do CMS viram commits no GitHub. Para desfazer com histórico claro:

1. encontre o commit da edição na aba **Commits** ou com `git log`;
2. crie uma branch de correção a partir da `main` atual;
3. use `git revert <sha-do-commit>` para criar a reversão, ou restaure somente
   um arquivo com `git restore --source=<sha-anterior> -- caminho`;
4. teste o site e abra PR para revisão.

Não reescreva o histórico compartilhado da `main`. Uma imagem excluída pode ser
recuperada restaurando seu caminho a partir de um commit anterior, desde que o
histórico ainda esteja disponível.

## Limpar mídias órfãs

Excluir ou substituir um serviço não garante a remoção do arquivo antigo.

1. liste os caminhos usados em `data/servicos.json` e
   `data/comparacoes.json`;
2. compare com os arquivos das duas bibliotecas de mídia;
3. em uma branch, remova apenas arquivos sem referência confirmada;
4. teste o site e a prévia do CMS antes de abrir PR;
5. mantenha arquivos quando houver dúvida sobre outra referência ou uso externo.

O repositório é público: remover um arquivo da versão atual não o elimina do
histórico Git. Nunca envie fotografias privadas, rostos, placas, endereços,
documentos ou metadados sensíveis.

## Documentação oficial

- https://pagescms.org/docs/quick-start/
- https://pagescms.org/docs/configuration/
- https://pagescms.org/docs/configuration/media/
- https://pagescms.org/docs/configuration/content/list/
- https://pagescms.org/docs/configuration/fields/image/
- https://pagescms.org/docs/guides/installing/github-app/

Não há pacote npm do Pages CMS instalado no site.
