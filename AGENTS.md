# Diretrizes para Codex e colaboradores

- Este repositório contém a Prime-Clean, marca fictícia criada exclusivamente como projeto de portfólio.
- Priorize responsividade, acessibilidade, clareza comercial e baixo custo.
- Mantenha HTML, CSS e JavaScript puro enquanto não houver necessidade comprovada de framework.
- Após o cutover, serviços, comparações e mídias publicados vêm do Supabase; os JSONs permanecem apenas como rollback manual temporário.
- Não apresente a marca como empresa em operação e não adicione depoimentos, preços, contatos, endereços ou certificações.
- Para exibir textos configuráveis, use `textContent` e não `innerHTML`.
- Nenhuma mudança diretamente na `main`: branch, PR, revisão cruzada, testes e merge.
- Teste teclado, menu mobile, ausência de navegação externa e 360px de largura antes de cada PR.

- Imagens: use apenas ilustrações locais autorizadas e identifique conteúdo gerado por IA. Comparações devem ser sintéticas, do mesmo objeto e marcadas como simulação.
- O Pages CMS e `.pages.yml` são legado de rollback. O painel em `admin/` é a interface editorial vigente para o conteúdo no Supabase.
