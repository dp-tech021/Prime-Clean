# Dependências — Prime-Clean

Este inventário descreve somente o conteúdo verificável no repositório
`dp-tech021/Prime-Clean` em 8 de novembro de 2026.

## Estado atual

O MVP é um site estático composto por `index.html`, `styles.css`, `app.js` e
arquivos JSON em `data/`. Não há `package.json`, lockfile, framework, etapa de build ou banco de
dados. O navegador executa diretamente HTML, CSS e JavaScript nativos.

## Dependências confirmadas

- Dependências npm: nenhuma.
- Stack: HTML5, CSS e JavaScript nativo.
- Frameworks de aplicação: nenhum.
- Serviços externos necessários em runtime: nenhum confirmado.
- Ferramentas opcionais: Git, editor de texto, navegador com DevTools e Python 3
  para servir os arquivos localmente.

Git, Python e Node.js são ferramentas de desenvolvimento ou validação e não
dependências de execução do site. Nenhum `npm install` é necessário.

## Manutenção

Se a stack mudar:

1. conferir os manifestos e lockfiles reais;
2. registrar aqui apenas dependências usadas pelo código, com as versões obtidas
   dos manifestos ou lockfiles;
3. manter os lockfiles correspondentes;
4. não versionar `node_modules`, tokens, senhas, credenciais, arquivos `.env`,
   dados de clientes ou cópias de serviços externos;
5. atualizar também `inventario.json` e o inventário de plugins.

Plugins e integrações são documentados em `../plugins/README.md`.
