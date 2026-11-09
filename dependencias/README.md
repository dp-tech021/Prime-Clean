# Dependências — Prime-Clean

Este inventário descreve somente o conteúdo verificável no repositório
`dp-tech021/Prime-Clean` em 8 de novembro de 2026.

## Estado atual

A `main` está no commit inicial e contém apenas o `README.md` do projeto. Não há
código executável, `package.json`, lockfile, manifesto de outra linguagem ou
configuração de serviço. Portanto, nenhuma biblioteca, pacote ou versão de
runtime pode ser confirmada ou deve ser instalada neste momento.

O ZIP usado para criar este inventário mencionava um MVP local chamado
`Prime-Clean-Fotos-v2`, mas os arquivos desse MVP não estão no repositório nem no
anexo. Suas dependências não foram tratadas como dependências confirmadas.

## Dependências confirmadas

- Dependências npm: nenhuma.
- Frameworks de aplicação: nenhum confirmado.
- Serviços externos necessários em runtime: nenhum confirmado.
- Ferramentas opcionais para manter o repositório: Git e um editor de texto.

Git é uma ferramenta de desenvolvimento e não uma dependência de execução do
site. Python, Node.js e navegadores também não são listados como dependências do
projeto enquanto não houver código ou documentação do projeto que os exija.

## Manutenção

Quando o código do site entrar no repositório:

1. conferir os manifestos e lockfiles reais;
2. registrar aqui apenas dependências usadas pelo código, com as versões obtidas
   dos manifestos ou lockfiles;
3. manter os lockfiles correspondentes;
4. não versionar `node_modules`, tokens, senhas, credenciais, arquivos `.env`,
   dados de clientes ou cópias de serviços externos;
5. atualizar também `inventario.json` e o inventário de plugins.

Plugins e integrações são documentados em `../plugins/README.md`.
