# Diretrizes para Codex e colaboradores

- Este repositório contém a Prime-Clean, marca fictícia criada exclusivamente como projeto de portfólio.
- Priorize responsividade, acessibilidade, clareza comercial e baixo custo.
- Mantenha HTML, CSS e JavaScript puro enquanto não houver necessidade comprovada de framework.
- Contatos, serviços e comparações editáveis ficam em `data/site.json`, `data/servicos.json` e `data/comparacoes.json`.
- Não apresente a marca como empresa em operação e não adicione depoimentos, preços, contatos, endereços ou certificações.
- Para exibir textos configuráveis, use `textContent` e não `innerHTML`.
- Nenhuma mudança diretamente na `main`: branch, PR, revisão cruzada, testes e merge.
- Teste teclado, menu mobile, ausência de navegação externa e 360px de largura antes de cada PR.

- Imagens: use apenas ilustrações locais autorizadas e identifique conteúdo gerado por IA. Comparações devem ser sintéticas, do mesmo objeto e marcadas como simulação.
- O schema do Pages CMS está em `.pages.yml`; o frontend consome os três JSONs, mas o uso hospedado ainda precisa de validação. Ver `plugins/PAGES-CMS.md`.
