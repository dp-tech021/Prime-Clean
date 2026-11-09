# Plugins e integracoes — Prime-Clean

O repositorio utiliza GitHub para versionamento e possui configuracao de edicao de conteudo para o Pages CMS. Os arquivos em `plugins/` sao **documentacao**, nao plugins executaveis.

| Integracao | Finalidade | Estado no repositorio | Pacote npm? |
| --- | --- | --- | --- |
| [Pages CMS](https://pagescms.org/) | Editar registros de trabalhos e imagens | `.pages.yml` configurado; uso na interface precisa de teste manual | Nao |
| [GitHub](https://github.com/dp-tech021/Prime-Clean) | Historico de arquivos, commits e PRs | Repositorio acessivel | Nao |

Veja [PAGES-CMS.md](./PAGES-CMS.md) para caminhos, campos, seguranca e testes de uso.

## Manutencao

Documente apenas dependencias e integracoes verificadas. Nunca armazene tokens, credenciais, dados reais de clientes ou copias de servicos externos nesta pasta. O site ainda nao consome automaticamente os JSONs gerenciados pelo CMS.
