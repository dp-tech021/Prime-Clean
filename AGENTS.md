# Diretrizes para Codex e colaboradores

- Este repositório é exclusivo para a Prime-Clean.
- Priorize responsividade, acessibilidade, clareza comercial e baixo custo.
- Mantenha HTML, CSS e JavaScript puro enquanto não houver necessidade comprovada de framework.
- Os dados editáveis ficam em `content.js`.
- Nunca invente depoimentos, preços, garantias, telefone, região atendida ou certificações.
- Para exibir textos configuráveis, use `textContent` e não `innerHTML`.
- Nenhuma mudança diretamente na `main`: branch, PR, revisão cruzada, testes e merge.
- Teste teclado, menu mobile, WhatsApp e 360px de largura antes de cada PR.

- Fotos: não inventar antes/depois, usar somente trabalhos reais autorizados. Excluir metadados EXIF, rostos/placas; verificar referências ao excluir mídia.
- O schema do Pages CMS está em `.pages.yml`; uso hospedado e integração com o frontend ainda precisam de validação. Ver `plugins/PAGES-CMS.md`.
