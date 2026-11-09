# Pages CMS — configuração pendente

Segundo o proprietário, o Pages CMS já foi conectado à sua conta GitHub. O
repositório `dp-tech021/Prime-Clean`, porém, ainda não possui `.pages.yml` na
raiz. Assim, a integração efetiva do CMS com o conteúdo deste projeto permanece
pendente e será tratada no Prompt 03.

## O que deverá ser confirmado no Prompt 03

1. quais arquivos de conteúdo e mídia realmente existem no site;
2. se o GitHub App do Pages CMS tem acesso a este repositório específico;
3. quais coleções e campos devem ser expostos para edição;
4. onde as mídias serão armazenadas;
5. em qual branch e por qual fluxo o CMS gravará alterações;
6. se criar, editar e excluir um registro produz os arquivos esperados no Git;
7. como imagens órfãs serão revisadas e removidas.

O `.pages.yml` deverá ficar na raiz do repositório e refletir os arquivos reais.
Esta etapa não deve criar coleções apontando para caminhos inexistentes.

## Segurança e governança

- Não versionar tokens OAuth, chaves privadas, senhas ou segredos do GitHub.
- Conceder acesso de edição apenas a pessoas autorizadas e revisar o alcance das
  permissões do GitHub App.
- Publicar imagens somente com autorização e sem expor dados pessoais sem
  necessidade.
- Revisar mudanças estruturais por PR.

Documentação oficial de referência:

- configuração: https://pagescms.org/docs/configuration/
- início rápido: https://pagescms.org/docs/quick-start/
- mídia: https://pagescms.org/docs/configuration/media/
- conteúdo: https://pagescms.org/docs/configuration/content/

Nenhuma dependência npm ou versão do Pages CMS é declarada: o serviço hospedado
é externo ao projeto e ainda não está configurado neste repositório.
