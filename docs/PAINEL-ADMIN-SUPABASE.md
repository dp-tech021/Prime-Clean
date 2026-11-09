# Prime-Clean Admin — backend real (Supabase)

> **Projeto fictício de portfólio.** O backend foi criado sem alterar a publicação existente em GitHub Pages. Não adicionar fotos reais, dados pessoais ou contatos comerciais.

## Estado verificado em 09/11/2026

- Organização: **D&P Develop**, projeto: **prime-clean-admin**, região: São Paulo (`sa-east-1`).
- Dashboard: https://supabase.com/dashboard/project/zffigzpmwcbmqfgrhrao
- URL pública da API: `https://zffigzpmwcbmqfgrhrao.supabase.co`.
- Migrations **aplicadas**: `20261109164735_prime_clean_admin_backend_initial` e `20261109165520_prime_clean_storage_delete_guard`.
- Cinco tabelas com RLS ativo; um registro inicial em `site_settings`, sem foto principal publicada; zero contas administrativas criadas.
- Bucket `prime-clean-media` **público**, limite de **5 MiB por arquivo**, MIME `image/webp`, `image/jpeg`, `image/png`.
- A integração pública possui ativação controlada: `json` durante homologação e `supabase` após o cutover. Os 12 arquivos locais permanecem apenas para rollback manual temporário.

## Contrato de dados

| Tabela | Papel e campos principais |
| --- | --- |
| `admin_users` | `user_id` (FK para `auth.users.id`), `active`; **somente SQL privilegiado** concede ou revoga acesso |
| `media_assets` | `id`, `bucket_id`, `storage_path`, `mime_type`, `alt_text`, `illustrative`, `public_visible` |
| `site_settings` | único registro `id=1`, `area`, `hero_asset_id` (opcional), `hero_visible` |
| `services` | `title`, `description`, `image_asset_id` (opcional), `sort_order`, `visible` |
| `comparisons` | `title`, `service_name`, `description`, `before_asset_id`, `after_asset_id`, `sort_order`, `published`, `demonstrative`, `consent_confirmed` |

IDs de mídia e de registros são UUIDs gerados pelo PostgreSQL. Referências de foto têm FK com `ON DELETE RESTRICT`, para impedir exclusão da linha de mídia enquanto referenciada. Em comparações, as duas imagens são obrigatórias e diferentes. A configuração só permite mostrar a foto principal quando uma imagem está associada.

`sort_order` substitui o campo JSON `order`; `public_visible` pertence ao registro da mídia, enquanto `visible`/`published` pertencem aos serviços e comparações. A interface deve confirmar que a mídia está publicada antes de usar sua URL.

## Permissões

- `anon` e contas autenticadas: leitura de **serviços visíveis**, **comparações publicadas** e **metadados de mídia marcados public_visible**; `site_settings` tem somente conteúdo demonstrativo público.
- Usuários autenticados: podem consultar a **própria** entrada em `admin_users`; não podem se tornar administradores pela API.
- Apenas quem tem linha `active=true` em `admin_users` pode alterar dados e objetos no bucket por meio das políticas RLS.
- Cadastro administrativo não tem `INSERT/UPDATE/DELETE` concedidos aos papéis `anon`/`authenticated`.
- O bucket é **público**: conhecer a URL permite baixar a imagem mesmo que o registro seja depois ocultado. **Não usar esse bucket para conteúdo privado**. Ocultar no painel não revoga URLs compartilhadas.
- O bucket não concede upload público. Políticas de `storage.objects` permitem ações ao administrador ativo; para substituir arquivo por upsert, o SDK precisará de `SELECT` + `INSERT` + `UPDATE`. Preferir nome novo por upload para evitar cache.
- `public_visible` regula a leitura do *registro*, não a disponibilidade da URL pública do arquivo.

## Habilitação inicial do administrador (AÇÃO MANUAL SEGURA)

1. A dupla acessa **Supabase Dashboard → Authentication → Users**.
2. Criar ou convidar o proprietário por caminho administrativo autorizado; **não usar cadastro público aberto no portfólio**. Verificar no painel a opção de desativar registro de novos usuários e as configurações de e-mail/redirect.
3. Quando o usuário existir, copiar o **UUID de `auth.users.id`** (não a senha nem o token). Não enviar senha, refresh token ou chave secreta por chat.
4. **Depois de confirmar que é a conta correta**, no SQL Editor do próprio projeto, executar (substituir o UUID abaixo):

```sql
insert into public.admin_users (user_id, active)
values ('COLE_AQUI_O_UUID_REAL', true);
```

5. Testar login real, logout, acesso negado para outra conta, upload e exclusão em fotos fictícias.
6. Revogar acesso quando necessário: um administrador da conta Supabase desativa a entrada `admin_users.active`; para desligamento imediato, também revogar as sessões de autenticação conforme recursos oficiais.

**Não executar esse INSERT com UUID de exemplo.** Não há administrador criado até o primeiro usuário ser autorizado pela dupla.

## Interface / implantação (para o Codex)

- Aplicação administrativa em `admin/` com Vite + JavaScript e `@supabase/supabase-js`; somente o frontend fica no navegador.
- Variáveis públicas no ambiente **do frontend**: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. A URL está acima; obter a chave **publishable** válida no painel Supabase. A chave publicável não substitui políticas RLS.
- Nunca expor `service_role` ou chaves `sb_secret_...` em arquivos, prompts, GitHub Pages ou bundle.
- A página `/admin/` oculta elementos para quem não fez login, mas **somente RLS** autoriza operações.
- Sem migrar o site antes da homologação; consultar `docs/ADMIN-CODEX-HANDOFF.md` e `docs/ADMIN-MIGRACAO-MIDIAS.md`.

## Fluxo de exclusão

1. Remover referência do serviço, configuração principal ou comparação e salvar.
2. Verificar no banco que nenhuma linha usa o `media_assets.id`.
3. Apagar o arquivo com Supabase Storage **API** (nunca só `DELETE FROM storage.objects` no SQL). A segunda migration **nega DELETE no Storage quando a mídia ainda estiver ligada a qualquer conteúdo**, mesmo que o administrador erre a ordem.
4. Excluir registro `media_assets` apenas quando o arquivo foi excluído e não tem referências; tratar erros e permitir reconciliação.
5. Se falhar entre DB e Storage, registrar a inconsistência e oferecer retentativa; operações não são transacionais entre esses dois serviços.

## Testes confirmados e limites

- RLS ligado nas cinco tabelas; políticas de tabelas e Storage verificadas no catálogo. A proteção de exclusão referenciada foi aplicada, mas ainda não testada por upload/delete real.
- Transação com dados temporários: `anon` enxergou só serviço visível, e não recebeu `INSERT` em `services` ou `admin_users`.
- Transação autenticada com UUID fictício não cadastrado: só enxergou serviço visível e não conseguiu modificá-lo. Transações revertidas.
- Security Advisor do Supabase: **sem lints na consulta feita** (não substitui auditoria de segurança).
- **Não testados:** autenticação real, conta administrativa real, upload/delete real pelo navegador, navegador/UX, redirecionamentos, e-mail e hospedagem do admin, migração das 12 imagens.
- A quantidade atual de serviços e comparações deve ser conferida novamente antes do cutover; não presuma os valores registrados durante a configuração inicial.

Fontes: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control), [Buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [Auth](https://supabase.com/docs/guides/auth), [API security](https://supabase.com/docs/guides/api/securing-your-api).
