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
  vazios, a área informa que não há atendimento e a foto principal possui
  caminho, texto alternativo, rótulo ilustrativo e visibilidade.
- **Serviços:** `data/servicos.json`, um array JSON editável com título,
  descrição, foto, texto alternativo, indicação de imagem ilustrativa, ordem e
  visibilidade.
- **Trabalhos:** `data/comparacoes.json`, array de pares antes/depois consumido
  diretamente pelo frontend.

A foto principal fica em `media/hero/`, as fotos de serviço em
`media/fotos-servicos/` e os pares em `media/comparacoes/`. O CMS aceita WebP,
JPEG e PNG, aplica nomes seguros (`rename: safe`) e grava caminhos públicos
estáveis.

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
3. selecionar a branch que contém a configuração e confirmar as três
   bibliotecas de mídia;
4. enviar, substituir e ocultar uma foto principal sintética;
5. adicionar um serviço, trocar/remover a foto, editar `order`, ocultar e apagar;
6. criar uma simulação de teste com duas imagens sintéticas claramente marcadas,
   sem pessoas ou dados pessoais, mantendo `published: false`;
7. editar título e descrição, trocar uma foto e alterar `order`;
8. ativar `demonstrative`, ocultar, publicar durante a verificação e ocultar de novo;
9. servir o site por HTTP e confirmar fallbacks, slider, rótulos e ordem;
10. excluir os itens de teste e confirmar que saíram do site;
11. usar `scripts/auditar_midias.py` antes de remover mídias órfãs.

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

1. execute `python3 scripts/auditar_midias.py` para listar referências e órfãos;
2. remova primeiro a referência em `data/site.json`, `data/servicos.json` ou
   `data/comparacoes.json`;
3. execute `python3 scripts/auditar_midias.py --verificar-exclusao CAMINHO`;
4. em uma branch, remova somente arquivos que retornarem `OK PARA LIMPEZA`;
5. teste o site e a prévia do CMS antes de abrir PR;
6. mantenha arquivos quando houver dúvida sobre outra referência ou uso externo.

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
