# Entrega ao Codex — Painel Administrativo Prime-Clean

## O que já está pronto e não deve ser recriado

Projeto Supabase: `prime-clean-admin`; ref `zffigzpmwcbmqfgrhrao`; API `https://zffigzpmwcbmqfgrhrao.supabase.co`; região `sa-east-1`.

Banco e Storage configurados diretamente pelo plugin Supabase. A migration versionada corresponde à **já aplicada** no projeto remoto:
`supabase/migrations/20261109164735_prime_clean_admin_backend_initial.sql`.

**Não reaplique essa migration ao projeto remoto nem recrie tabelas, policies ou bucket.** Para ambiente local novo, siga o processo oficial da CLI da versão instalada, conferindo o histórico de migrations.

Documentação: `docs/PAINEL-ADMIN-SUPABASE.md` e `docs/ADMIN-MIGRACAO-MIDIAS.md`.

## Prompt 11 (Codex) — interface administrativa e autenticação

Crie uma branch nova `feat/painel-admin-login`, partindo da `main` atual e sem escrever na `main` diretamente.

1. Construir em `admin/` uma SPA simples com **Vite + JavaScript modular**, HTML/CSS responsivo, identidade verde/creme da Prime-Clean. React não é necessário.
2. Instalar `@supabase/supabase-js` e Vite consultando o npm oficial e documentações; fixar versões resolvidas no lockfile e executar `npm ci` / `npm run build` dentro de `admin/`.
3. Variáveis de ambiente no painel: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; adicionar `.env.example` com placeholders e ignorar `.env.local`. Não colocar `service_role`, `sb_secret_`, credenciais ou tokens em frontend/logs/commits.
4. Implementar telas de login (e-mail/senha), carregamento de sessão, recuperação de estado, mensagem de erro compreensível, logout e bloqueio de navegação administrativa para quem não é administrador.
5. Validar autorização consultando `admin_users` apenas para o usuário autenticado; conferir `active=true`. A interface é um complemento, **não substitui RLS**.
6. Após login autorizado, exibir dashboard com seções **Foto principal**, **Serviços**, **Antes/depois** e **Biblioteca**; enquanto não implementadas, identificar claramente 'em construção' sem ações falsas.
7. Não permitir cadastro público via interface; documentar a necessidade de desabilitar o sign-up público no Supabase Dashboard e o cadastro/administração manual segura de usuários.
8. Evitar chamadas `auth.admin.*` no navegador. Não usar credenciais privilegiadas nem alterar as políticas para "facilitar" testes.
9. Criar testes para login inválido, visitante sem sessão, usuário logado sem `admin_users`, logout e rotas. Não declarar teste E2E aprovado sem sessão real.
10. Isolar toda a aplicação administrativa de `index.html`, `app.js`, `data/` e `media/` do site público. Não migrar imagens nesta etapa nem trocar a hospedagem da landing page.
11. Documentar deploy seguro do painel estático em HTTPS, preferencialmente host separado (Cloudflare Pages), **sem executá-lo**.
12. Abrir PR, executar QA no projeto existente, registrar testes novos e pendências. Não fazer merge automático.

## Prompt 12 (Codex) — fotos (após homologar Auth)

Usar somente as tabelas existentes `media_assets`, `site_settings`, `services`, `comparisons`. Implementar upload com progress/error, prévia, troca (nome novo), alt text que identifica IA, visibilidade, ordenação, pareamento antes/depois, confirmação de exclusão, proteção contra arquivo ainda referenciado, mensagens não técnicas e suporte a celular.

Todo upload requer sessão de **admin_users ativo** e MIME compatível com bucket público `prime-clean-media`. Limitar 5 MiB. Arquivos passam a ser públicos ao subir; usar apenas conteúdo inteiramente sintético. Remover primeiro referências, depois objeto pela API do Storage, depois registro, com recuperação se uma etapa falhar.

## Prompt 13 (Codex) — migração e publicação (após 11 e 12)

Executar plano em `docs/ADMIN-MIGRACAO-MIDIAS.md`, homologar 12 mídias e dados, validar leitura pública de registros publicados, testar em diferentes resoluções; fazer cutover via PR e manter JSON como rollback temporário.

## Critérios obrigatórios antes de entregar ao cliente

- Proprietário consegue entrar e sair sem usar GitHub.
- Usuário comum com login **não** consegue alterar nada nem por API direta.
- Visitante só vê conteúdo expressamente público.
- Admin consegue enviar, substituir, ocultar, ordenar e excluir fotos com mensagens claras.
- Nenhum contato comercial real/dado sensível em conteúdo demonstrativo.
- Painel hospeda por HTTPS, sem segredos no build; CI aprova; testes E2E reais documentados.
- A versão antiga do site continua funcional até a migração ser aceita.

**Divisão entre duas pessoas:** Dev A: interface, responsividade, acessibilidade. Dev B: integração SDK, testes de permissões e upload. Revisão cruzada em PRs.
