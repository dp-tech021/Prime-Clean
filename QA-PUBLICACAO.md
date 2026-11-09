# QA e publicação de prévia

Auditoria executada em 09/11/2026 na branch `chore/qa-publicacao`, iniciada na
`main` após o merge revisado do PR 04.

## Resultado da auditoria

- [x] Viewports 360 × 800, 390 × 844, 768 × 1024 e 1280 × 900.
- [x] Sem overflow horizontal, erro JavaScript ou resposta HTTP 4xx/5xx.
- [x] Menu aberto por teclado e fechado com Escape, com foco devolvido ao botão.
- [x] Link **Pular para o conteúdo** leva o foco ao conteúdo principal.
- [x] Foco visível em links, botões, resumos e comparador.
- [x] Contraste corrigido nos textos pequenos, chamadas editoriais e números das
  etapas. Elementos puramente decorativos foram desconsiderados.
- [x] Cinco imagens de serviço com `alt`, `loading="lazy"` e carregamento válido.
- [x] Imagens WebP consistentes em 764 × 337/338 px, total de mídia abaixo de
  310 KiB e nenhum perfil de metadados identificado pelo ImageMagick.
- [x] JSON válido; falha de rede, JSON inválido e listas vazias mantêm a página
  utilizável e não publicam comparações.
- [x] Galeria vazia e aviso visível enquanto não houver trabalho real autorizado.
- [x] WhatsApp permanece vazio e nenhum link `wa.me` é criado.
- [x] Instagram é apresentado como perfil informado, com `noopener noreferrer`;
  titularidade não confirmada.
- [x] Título, descrição, idioma, um único `h1` e hierarquia básica revisados.
- [x] URL canônica, sitemap e metadados sociais não foram inventados; dependem
  do domínio e da identidade comercial aprovados.
- [x] Nenhum analytics ou rastreador adicionado.
- [x] Site testado na raiz e no subdiretório `/Prime-Clean/`.
- [x] Cabeçalhos de segurança preparados para Cloudflare Pages em `_headers`.

O teste de contraste automatizado não consegue calcular fundos com imagem ou
gradiente. A tarja **Imagem ilustrativa** usa branco sobre uma camada verde
escura com 90% de opacidade; a inspeção visual confirmou legibilidade. O símbolo
grande da seção Sobre é decorativo e está oculto da árvore de acessibilidade.

## Etapas não executadas

- [ ] Login autenticado no Pages CMS.
- [ ] Editar e restaurar um serviço pelo painel hospedado.
- [ ] Enviar e substituir uma foto pelo painel.
- [ ] Criar, ocultar, republicar e excluir um par real antes/depois.
- [ ] Confirmar a titularidade do Instagram informado.
- [ ] Confirmar e testar um número de WhatsApp.
- [ ] Criar o projeto Cloudflare Pages na conta do proprietário.
- [ ] Testar os cabeçalhos HTTP no endereço público da prévia.

Essas etapas exigem as contas do proprietário. Nunca declarar o painel ou os
contatos aprovados antes de executá-las.

## Prévia gratuita escolhida

Usar **Cloudflare Pages** em um projeto chamado `prime-clean-preview`, conectado
ao GitHub, com `main` como branch-base do projeto de prévia e previews de PR
habilitados. Um PR criado dentro deste repositório recebe URL própria, sem
alterar o endereço principal do projeto. O arquivo `_headers` aplica `noindex`
também ao endereço-base; removê-lo somente em uma publicação comercial aprovada.

Configuração do projeto:

- framework: nenhum;
- comando de build: vazio;
- diretório de saída: `.`;
- branch de produção: `main`;
- previews: habilitados para branches e PRs;
- domínio próprio: não configurar nesta etapa;
- Cloudflare Access: recomendado se a prévia não puder ser pública.

Depois de conectar o repositório, o PR de `chore/qa-publicacao` deve gerar uma
URL como `<hash>.<projeto>.pages.dev` e um alias de branch. A Cloudflare informa
que previews recebem `X-Robots-Tag: noindex` automaticamente. Confirmar com:

```bash
curl -I https://<url-da-previa>.pages.dev
```

O plano Free documentado atualmente permite 500 builds por mês, 20.000 arquivos
por site, arquivo individual de até 25 MiB e número ilimitado de previews ativos.
Este site tem poucos arquivos, nenhuma etapa de build e cerca de 310 KiB de
mídia, portanto fica muito abaixo desses limites.

O proprietário precisa aceitar os termos apresentados na criação da conta e
revisá-los antes de ativar a integração. A página oficial de termos não ficou
acessível pela política de rede deste ambiente; não foi feita afirmação sobre
cláusulas que não puderam ser lidas.

O GitHub Pages não foi escolhido. A documentação oficial vigente diz que ele
não se destina nem permite hospedagem gratuita de site voltado a operar um
negócio ou facilitar transações comerciais.

Fontes oficiais consultadas:

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/preview-deployments/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://docs.github.com/pages/getting-started-with-github-pages/github-pages-limits

As fontes oficiais foram conferidas nos repositórios de documentação em
`cloudflare/cloudflare-docs@2a4bfc4` e `github/docs@8cd1075`.

## Aprovação antes de produção

Não conectar domínio de produção nem divulgar a URL como oficial até confirmar:

- identidade visual e dados empresariais;
- região atendida;
- perfil do Instagram e autorização para usá-lo;
- WhatsApp ativo em teste real;
- fotos reais e termos de consentimento;
- revisão comercial dos textos;
- teste completo do Pages CMS pelo proprietário.

## Riscos restantes

| Risco | Efeito | Controle atual |
| --- | --- | --- |
| Instagram sem titularidade confirmada | Cliente pode abrir perfil incorreto | Texto assume apenas “perfil informado”; validar antes de produção |
| WhatsApp sem número validado | Canal comercial indisponível | Campo vazio e nenhum link `wa.me` |
| Pages CMS não testado com a conta | Edição ou upload podem falhar | Roteiro manual obrigatório antes da aprovação |
| Repositório e preview públicos | Foto enviada pode ficar acessível | Consentimento, revisão de privacidade e Cloudflare Access |
| Histórico Git preserva mídias | Exclusão atual não apaga versões antigas | Não enviar foto privada; pedir limpeza especializada quando necessária |
| Cache de mídia | Foto substituída pode demorar a atualizar | Cache limitado a uma hora em `_headers`; preferir novo nome |

## Rollback

Se uma mudança quebrar a prévia:

1. ocultar o conteúdo pelo CMS, quando possível;
2. identificar o commit anterior funcional;
3. executar `git revert <commit-problemático>` em uma branch;
4. abrir PR de correção e repetir o checklist de navegador;
5. confirmar que o alias da prévia aponta para o novo deploy.

Para retirar uma prévia da Cloudflare, exclua o deployment no painel ou com
Wrangler. A documentação alerta que o deploy mais recente de uma branch não
pode ser apagado; nesse caso, desative previews da branch ou remova a branch
depois de preservar o histórico necessário. Reverter o repositório não apaga
deployments antigos nem o histórico Git.
