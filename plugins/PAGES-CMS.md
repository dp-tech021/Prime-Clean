# Pages CMS — Prime-Clean

**Configuracao versionada:** a raiz do repositorio contem `.pages.yml`, com uma colecao de trabalhos e uma biblioteca de imagens. Esta configuracao ainda **nao foi testada na interface hospedada do Pages CMS** e o site ainda nao possui codigo que apresente esses registros.

## Estrutura

- `.pages.yml`: esquema de edicao do Pages CMS.
- `content/trabalhos/*.json`: um registro JSON por trabalho, criado pelo editor.
- `public/imagens/trabalhos/`: imagens enviadas pelo editor, referenciadas por caminhos `/imagens/trabalhos/...`.
- `content/trabalhos/.gitkeep` e `public/imagens/trabalhos/.gitkeep`: mantem diretorios vazios no Git; nao representam dados reais.

### Campos da colecao

`titulo`, `servico`, `descricao`, `foto_antes`, `alt_antes`, `foto_depois`, `alt_depois`, `fotos_extras` (ate 5) e `publicado` (inicialmente `false`).

A colecao permite **criar, editar e excluir registros**. Renomear o arquivo foi desabilitado para evitar quebra de referencias. A biblioteca de midia permite gerenciar arquivos separadamente. Excluir um registro **nao garante** que as imagens enviadas sejam excluidas: verifique o uso e remova imagens orfas pela biblioteca de midia.

### Responsabilidade do futuro site

Ainda sera necessario implementar a leitura dos JSONs, renderizar comparativos antes/depois, filtrar `publicado === true` e fornecer `alt` nas imagens. A pasta `public/` e apropriada para um site com convencao de arquivos publicos como Vite; se a stack escolhida usar outra convencao, ajustar o caminho antes de integrar o frontend.

## Teste manual obrigatorio

1. Acesse https://app.pagescms.org/ com a conta GitHub autorizada.
2. Verifique se a GitHub App do Pages CMS possui acesso ao repositorio `dp-tech021/Prime-Clean`. Se nao aparecer, confira a selecao de repositorios na instalacao do app.
3. Escolha `Prime-Clean`, branch `main`; confirme a colecao **Trabalhos (antes e depois)** e a biblioteca **Fotos dos trabalhos**.
4. Com imagens de teste **sem pessoas identificaveis**, crie um trabalho, preenchendo titulo, tipo, fotos e descricoes alternativas. Confirme que foram gravados um JSON em `content/trabalhos/` e imagens em `public/imagens/trabalhos/`.
5. Edite o registro e confirme novo commit no GitHub.
6. Exclua o registro de teste; confirme a exclusao do JSON. Verifique e remova as imagens de teste pela biblioteca, se nao estiverem sendo usadas por outros registros.
7. Nao marque fotos reais como publicadas sem autorizacao. Confira o comportamento de `publicado` no site quando ele existir.

**Nao concluido por este PR:** teste de login e CRUD dentro do app Pages CMS; validacao do acesso da GitHub App a este repositorio; integracao com frontend; deploy.

## Seguranca e limites

- O repositorio e **publico**: imagens enviadas ficam expostas no GitHub, **mesmo com `publicado: false`**. Este campo controla apenas a futura exibicao no site.
- Nao publique fotos sem consentimento, dados pessoais, documentos, rostos, placas ou enderecos identificaveis.
- Nao envie tokens, senhas, chaves, `.env` ou segredos para o repositorio/CMS.
- Usuarios do CMS podem gravar alteracoes via GitHub; revise permissoes e o historico de commits.
- Renomear ou excluir um arquivo de imagem pode quebrar referencias existentes; remova apenas imagens sem uso.

## Documentacao oficial (conferida em 08/11/2026)

- https://pagescms.org/docs/configuration/
- https://pagescms.org/docs/configuration/media/
- https://pagescms.org/docs/configuration/content/
- https://pagescms.org/docs/configuration/content/operations/
- https://pagescms.org/docs/configuration/fields/image/
- https://pagescms.org/docs/quick-start/

Nao ha dependencia npm do Pages CMS instalada: foi configurado o CMS hospedado, baseado em arquivos no GitHub.
