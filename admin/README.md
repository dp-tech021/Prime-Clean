# Painel administrativo Prime-Clean

Interface inicial do painel do projeto fictício Prime-Clean. Esta etapa entrega
login, validação de administrador e navegação responsiva. As áreas de imagens
continuam sinalizadas como indisponíveis e a landing page permanece nos JSONs.

## Backend existente e autorização

As migrations oficiais ficam exclusivamente em `../supabase/migrations/` e já
correspondem ao backend remoto descrito em
[`../docs/PAINEL-ADMIN-SUPABASE.md`](../docs/PAINEL-ADMIN-SUPABASE.md). Não há
migration, tabela, bucket ou política RLS própria dentro de `admin/`. Não
reaplique as migrations no projeto remoto.

O fluxo do navegador:

1. autentica e restaura a sessão com o SDK oficial do Supabase;
2. consulta `admin_users` com filtro pelo `user_id` da sessão;
3. aceita somente o registro do próprio usuário com `active === true`;
4. encerra a sessão e nega o painel se o registro não existir, estiver inativo
   ou a consulta falhar.

A policy `pc_admin_read_self` limita a consulta ao próprio vínculo. As policies
das tabelas e do Storage repetem a exigência de administrador ativo para cada
operação. Ocultar o dashboard complementa essa proteção, mas não substitui RLS.
O frontend não usa `user_metadata`, `auth.admin`, função `SECURITY DEFINER` ou
credencial privilegiada. Operações administrativas futuras devem revalidar a
sessão e depender novamente das policies, sem confiar apenas no login inicial.

Nunca coloque chave `secret`, `service_role`, token ou senha em `.env`, no Git
ou no navegador. A URL e a chave publicável são públicas; a segurança depende
das policies e das permissões mínimas já versionadas.

## Instalação

Pré-requisitos: Node.js 22.12 ou mais recente e npm.

```bash
cd admin
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` somente com **Project URL** e **Publishable key** de
Project Settings > API Keys. A chave `anon` legada também é aceita. O arquivo
local é ignorado pelo Git.

Versões fixadas no lockfile e verificadas em 09/11/2026:
`@supabase/supabase-js` 2.119.0 e Vite 8.3.7. Referências oficiais:

- [Supabase Auth com senha](https://supabase.com/docs/guides/auth/passwords);
- [segurança e chaves da API](https://supabase.com/docs/guides/api/api-keys);
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security);
- [guia do Vite](https://vite.dev/guide/).

## Habilitação e revogação de administradores

O backend já existe. Não recrie sua estrutura nem execute migrations remotas
para configurar o frontend.

1. Desabilite cadastro público no Supabase Dashboard.
2. Em Authentication > Users, crie ou convide manualmente a conta autorizada.
3. Depois de conferir a identidade, siga a instrução privilegiada em
   [`../docs/PAINEL-ADMIN-SUPABASE.md`](../docs/PAINEL-ADMIN-SUPABASE.md) para
   registrar o UUID em `admin_users` com `active=true`.
4. Para revogar, altere `active` para `false` e encerre as sessões da conta.

Não registre senhas na documentação e não permita que o frontend insira ou
altere `admin_users`.

## Utilização do gerenciamento de imagens

Após entrar como administrador ativo, use as quatro áreas do painel:

- **Foto principal:** selecione uma imagem existente e defina sua visibilidade,
  ou envie uma nova foto para substituir a referência. A anterior permanece na
  biblioteca até ser excluída com segurança.
- **Serviços:** cadastre título, descrição, ordem, visibilidade e foto. Ao
  editar, escolha outra foto ou faça um novo upload. Remover o serviço não apaga
  sua mídia.
- **Antes e depois:** selecione ou envie duas imagens diferentes e publique
  somente a simulação completa. `demonstrative=true` e
  `consent_confirmed=false` são fixados pelo painel.
- **Biblioteca:** consulte miniaturas, caminho, visibilidade dos metadados e
  usos conhecidos. Arquivos referenciados não podem ser excluídos.

O passo a passo sem termos técnicos está em
[`MANUAL-IMAGENS.md`](MANUAL-IMAGENS.md).

Uploads aceitam WebP, JPEG e PNG com até 5 MiB. O texto alternativo precisa ter
ao menos oito caracteres e declarar que a imagem é ilustrativa, sintética,
fictícia, simulação ou gerada por IA. O nome no Storage é normalizado e recebe
data e identificador novos para evitar cache durante substituições.

O bucket é público. Ocultar os metadados ou um registro retira o conteúdo das
consultas editoriais, mas não revoga uma URL já compartilhada. Nunca envie
fotos reais, rostos, placas ou dados pessoais.

### Exclusão e falhas parciais

Antes de excluir, o painel consulta foto principal, serviços e comparações. A
interface bloqueia mídias em uso, e a policy do Storage repete essa proteção no
servidor. Para uma mídia órfã, o painel remove primeiro o objeto pela API do
Storage e depois o registro `media_assets`.

Storage e PostgreSQL não formam uma transação única. Se o upload funcionar e o
vínculo falhar, a nova imagem aparece como órfã para nova tentativa ou exclusão.
Se o arquivo for removido e a exclusão do registro falhar, a mensagem pede
reconciliação. Não apague diretamente de `storage.objects` pelo SQL Editor.

## Testes automatizados

```bash
cd admin
npm ci
npm test
npm run build
```

Os testes cobrem autenticação e autorização, upload válido, formato e tamanho
inválidos, falha de conexão, compensação após falha no cadastro, nomes novos em
substituições, comparação com imagens iguais, exclusão protegida e remoção de
arquivo órfão. O contrato das migrations e a ausência de credenciais
privilegiadas também são verificados.

Os testes SQL transacionais estão em
[`../supabase/tests/rls_sem_credenciais.sql`](../supabase/tests/rls_sem_credenciais.sql).
Eles devem ser executados somente em ambiente local ou descartável autorizado;
todos usam `ROLLBACK`. Não foram executados automaticamente contra o projeto
remoto.

Ainda dependem de uma conta e ambiente reais controlados pela dupla:

- login e restauração de sessão de administrador ativo;
- recusa de administrador inativo e usuário comum via API direta;
- expiração/revogação de sessão;
- upload, substituição e exclusão reais no bucket público;
- reconciliação de falha entre Storage e banco;
- redirecionamentos, e-mail e comportamento de rede no ambiente hospedado.

Esses itens não são considerados aprovados pelos testes unitários.

## Build e hospedagem futura

```bash
npm run build
npm run preview
```

Para uma futura configuração no Cloudflare Pages, use `admin` como diretório
raiz, `npm ci && npm run build` como comando e `dist` como saída. Adicione as
duas variáveis públicas no painel da hospedagem. Não publique até homologar
Auth, redirects e RLS com contas controladas pela dupla.
