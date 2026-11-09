# Painel administrativo Prime-Clean

Estrutura inicial do painel do projeto fictício Prime-Clean. Esta etapa entrega
login, verificação de autorização no banco e navegação responsiva. O painel não
altera o conteúdo da landing page e as áreas de imagens estão marcadas como
indisponíveis até a próxima etapa.

## Segurança e arquitetura

O navegador autentica e mantém a sessão com o SDK oficial do Supabase. Depois
do login, ele chama `public.is_admin()`. A tela administrativa só é exibida se
a função confirmar o UUID em `public.admin_users`; qualquer erro falha de modo
fechado e encerra a sessão. Uma conta autenticada, por si só, não recebe acesso.

A migração habilita RLS, permite que um administrador leia somente o próprio
cadastro e não concede `insert`, `update` ou `delete` aos papéis do navegador.
A lista de administradores só deve ser mantida por uma pessoa autorizada no
Dashboard do Supabase ou por um fluxo de servidor futuro com credencial elevada.

Nunca coloque uma chave `secret`, `service_role`, token ou senha em `.env`, no
Git ou no navegador. A URL e a chave publicável são identificadores públicos;
a segurança depende de RLS e de permissões mínimas no banco.

## Pré-requisitos e instalação

- Node.js 22.12 ou mais recente;
- npm;
- Docker, apenas para executar o banco Supabase local e os testes pgTAP.

```bash
cd admin
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com **Project URL** e **Publishable key** obtidas em
Project Settings > API Keys. A chave `anon` legada também é aceita. O arquivo
local é ignorado pelo Git.

Foram verificadas em 09/11/2026 as versões fixadas no `package-lock.json`:
`@supabase/supabase-js` 2.119.0, Vite 8.3.7 e Supabase CLI 3.1.0. O Vite exige
Node 20.19+ ou 22.12+; este projeto escolhe a linha 22.12+ porque o SDK atual
também exige Node 22. As referências oficiais são:

- [Supabase Auth com senha](https://supabase.com/docs/guides/auth/passwords);
- [segurança e chaves da API](https://supabase.com/docs/guides/api/api-keys);
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security);
- [testes de banco](https://supabase.com/docs/guides/local-development/testing/pgtap-extended);
- [guia do Vite](https://vite.dev/guide/).

## Configuração do projeto Supabase

1. Crie ou selecione um projeto Supabase administrado pela dupla.
2. Em Authentication, desabilite cadastro público por e-mail. O frontend não
   oferece cadastro, mas a configuração do servidor também precisa bloqueá-lo.
3. Aplique `supabase/migrations/202611090001_create_admin_users.sql` com o fluxo
   de migrações do Supabase (`supabase link` e `supabase db push`) ou revise e
   execute o arquivo no SQL Editor.
4. Em Authentication > Users, adicione manualmente o usuário administrador e
   confirme o e-mail pelo fluxo permitido pela equipe. Não registre senhas em
   documentação.
5. Copie o UUID desse usuário. No Table Editor, adicione-o ao campo `user_id`
   de `public.admin_users`. Essa operação ocorre no Dashboard com privilégio de
   mantenedor; o frontend não tem permissão para se promover.
6. Para revogar o acesso, remova a linha correspondente no Dashboard e encerre
   as sessões do usuário em Authentication.

O Supabase pode exigir configuração de SMTP para entrega confiável de e-mails
em produção. Este painel usa somente login com e-mail e senha e não oferece
recuperação ou cadastro nesta etapa.

## Testes reproduzíveis

```bash
cd admin
npm ci
npm test
npm run build
```

`npm test` cobre validação das variáveis públicas, rejeição de chaves elevadas,
login autorizado, credenciais inválidas, usuário comum, erro na consulta de
autorização, restauração e logout. O build também procura padrões de segredo no
artefato `dist/`.

Para validar RLS e permissões com um banco descartável local:

```bash
cd admin
npm run db:start
npm run db:reset
npm run test:db
npm run db:stop
```

O teste pgTAP comprova que anônimos não consultam a tabela nem a função, contas
comuns não se promovem, administradores veem somente o próprio registro e nem
mesmo eles alteram a lista pelo cliente. Docker precisa estar ativo.

Com um projeto real configurado, execute manualmente:

- login válido como administrador e acesso ao painel;
- login válido como usuário fora de `admin_users` e recusa do painel;
- senha inválida e mensagem sem detalhes internos;
- recarregamento da página com sessão válida;
- logout e impossibilidade de retornar ao painel sem novo login;
- chamada direta à API como usuário comum para confirmar RLS.

Esses testes remotos dependem de projeto, usuários e credenciais públicas não
fornecidos ao repositório. Não são considerados concluídos apenas pelos testes
locais.

## Build e hospedagem futura

```bash
npm run build
npm run preview
```

Para uma futura configuração no Cloudflare Pages, use `admin` como diretório
raiz, `npm ci && npm run build` como comando e `dist` como saída. Adicione as
duas variáveis públicas no painel da hospedagem. Não publique este painel até
revisar o projeto Supabase, os redirects e a política de acesso da equipe.
