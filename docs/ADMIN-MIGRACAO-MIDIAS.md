# Plano de migração de fotos — Prime-Clean

**Não fazer cutover automático.** A publicação https://dp-tech021.github.io/Prime-Clean/ continua usando `data/site.json`, `data/servicos.json` e `data/comparacoes.json`.

## Inventário da versão atual

O GitHub contém **12 imagens referenciadas**:

| Área atual | Arquivo local | Futuro prefixo no Storage |
| --- | --- | --- |
| Principal | `media/hero/hero-sala.webp` | `hero/` |
| Serviço sofá | `media/fotos-servicos/sofa.webp` | `services/` |
| Serviço colchão | `media/fotos-servicos/colchao.webp` | `services/` |
| Serviço cadeiras | `media/fotos-servicos/cadeiras.webp` | `services/` |
| Serviço poltrona | `media/fotos-servicos/poltrona.webp` | `services/` |
| Serviço automotivo | `media/fotos-servicos/bancos-automotivos.webp` | `services/` |
| Antes sofá | `media/comparacoes/sofa-antes.webp` | `comparisons/` |
| Depois sofá | `media/comparacoes/sofa-depois.webp` | `comparisons/` |
| Antes colchão | `media/comparacoes/colchao-antes.webp` | `comparisons/` |
| Depois colchão | `media/comparacoes/colchao-depois.webp` | `comparisons/` |
| Antes cadeira | `media/comparacoes/cadeira-antes.webp` | `comparisons/` |
| Depois cadeira | `media/comparacoes/cadeira-depois.webp` | `comparisons/` |

Inventário obtido de `data/*.json` na `main` em 09/11/2026; não pressupõe que os arquivos já foram enviados ao Supabase.

## Mapeamento de campos

| JSON | Banco |
| --- | --- |
| `site.area` | `site_settings.area` |
| `site.heroImage` e `heroImageAlt` | arquivo no Storage + `media_assets` + `site_settings.hero_asset_id` |
| `site.heroImageVisible` | `site_settings.hero_visible` |
| `servicos[*].title` | `services.title` |
| `servicos[*].description` | `services.description` |
| `servicos[*].image` e `imageAlt` | `services.image_asset_id` → `media_assets.alt_text` |
| `servicos[*].order` | `services.sort_order` |
| `servicos[*].visible` | `services.visible` |
| `comparacoes[*].before` / `after` | `comparisons.before_asset_id` / `after_asset_id` |
| `comparacoes[*].beforeAlt` / `afterAlt` | `media_assets.alt_text` de cada foto |
| `comparacoes[*].service` | `comparisons.service_name` |
| `comparacoes[*].order` | `comparisons.sort_order` |
| `comparacoes[*].published` | `comparisons.published` |

Campos de simulação `demonstrative=true`, `illustrative=true` e `consent_confirmed=false` são obrigatórios no portfólio. Não migrar `whatsapp` ou `instagram` como contato comercial. Não colocar fotos reais/de clientes no bucket público.

## Procedimento para a dupla após o painel estar funcional

1. Registrar/autorizar pelo menos um administrador; testar as políticas reais.
2. Obter os 12 arquivos originais do GitHub; validar formato, tamanho, licença e rótulos.
3. Enviar cada arquivo pelo **SDK de Storage autenticado**, com nome novo seguro em `hero/`, `services/` ou `comparisons/`. Limite por arquivo: 5 MiB.
4. Após upload bem-sucedido, criar uma linha em `media_assets` para cada arquivo. Usar `bucket_id='prime-clean-media'`, `storage_path`, `mime_type`, `alt_text`, `public_visible=true` quando aprovado.
5. Criar cinco `services` com referências e ordem; criar três `comparisons` apontando para imagens distintas; preencher `site_settings.hero_asset_id` e ativar a foto principal.
6. Comparar conteúdo e contagens com os JSON antigos. Testar imagens públicas (HTTP 200), slider, visibilidade, fallback e teclado.
7. Só então, em PR separado, alterar o site público para ler o Supabase; manter JSON como rollback de emergência até homologação.
8. Após o cutover e revisão, tornar Pages CMS **somente legado** para evitar duas fontes de edição. Não apagar dados ou arquivos antigos enquanto houver possibilidade de rollback.

**Importante:** `media_assets.public_visible=false` oculta metadados pela API, mas não torna privadas URLs já publicadas no bucket público. Nomes novos evitam conteúdo antigo em cache após troca.

A migração ainda não foi executada; este arquivo é uma especificação verificável para a etapa posterior.
