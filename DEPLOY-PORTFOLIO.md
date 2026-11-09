# Publicação do portfólio no Cloudflare Pages

Este guia prepara a publicação da Prime-Clean como projeto fictício. Ele não
registra um deploy como concluído: o proprietário da conta precisa executar os
passos no painel, copiar a URL realmente criada e validar as respostas HTTP.

## Decisão de indexação

**Decisão desta etapa: permitir a indexação da publicação principal.** A equipe
escolheu essa opção em 09/11/2026 para que o case possa ser encontrado.

Por isso, o bloqueio global `X-Robots-Tag: noindex, nofollow` foi removido de
`_headers`. A CSP e os demais cabeçalhos de segurança foram preservados. O
Cloudflare Pages acrescenta `X-Robots-Tag: noindex` automaticamente aos
deployments de preview; essa proteção deve ser confirmada depois do primeiro
preview.

Se a equipe mudar de decisão antes de publicar, restaure no bloco `/*` de
`_headers`:

```text
  X-Robots-Tag: noindex, nofollow
```

Depois, faça a mudança em uma branch, execute o QA e passe por revisão.

## Configuração confirmada para este repositório

| Campo | Valor |
| --- | --- |
| Repositório | `dp-tech021/Prime-Clean` |
| Branch de produção | `main` |
| Framework preset | nenhum |
| Comando de build | vazio; use `exit 0` apenas se o painel exigir um comando |
| Diretório de saída | `.` |
| Diretório raiz | vazio, pois o site está na raiz do repositório |
| Variáveis de ambiente | nenhuma |

Não escolha um nome neste documento. O proprietário deve definir um nome
disponível no painel e registrar a URL que o Cloudflare realmente apresentar.

## Passo a passo no painel

1. Entre na conta correta do Cloudflare e abra **Workers & Pages**.
2. Selecione **Create application** > **Pages** > **Connect to Git**.
3. Escolha **GitHub**. Se o painel solicitar autorização, conceda ao aplicativo
   acesso mínimo ao repositório `dp-tech021/Prime-Clean`.
4. Selecione `dp-tech021/Prime-Clean`, depois **Begin setup**.
5. Escolha um nome de projeto disponível. Não presuma a URL antes de o painel
   confirmá-la.
6. Em **Production branch**, selecione `main`.
7. Em **Framework preset**, selecione a opção equivalente a nenhum framework.
8. Deixe **Build command** vazio. Se a interface obrigar o preenchimento, use
   `exit 0`, conforme a documentação atual do Pages.
9. Informe `.` em **Build output directory**.
10. Deixe **Root directory** vazio e não cadastre variáveis ou segredos.
11. Revise a configuração. **Save and Deploy** inicia uma publicação real; só
    selecione essa ação quando a equipe quiser publicar.
12. Após o término, copie do painel a URL HTTPS real e o commit associado. Não
    configure domínio personalizado nesta etapa.

A integração Git faz novos commits em `main` dispararem builds de produção e
usa outras branches/PRs para previews. O Cloudflare informa que um projeto
criado com integração Git não pode ser convertido depois para Direct Upload.

## Validação após a publicação

Substitua o texto abaixo pela URL HTTPS fornecida pelo painel, sem barra final.
Não use uma URL presumida.

```bash
SITE_URL="cole_a_url_https_real_aqui"
```

### HTTPS e respostas 200

O `curl` deve validar o certificado sem `-k`, e cada comando deve mostrar
`200`:

```bash
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/index.html"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/data/site.json"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/data/servicos.json"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/data/comparacoes.json"
```

### Imagens

Confira ao menos uma imagem de cada conjunto; depois abra o site e confirme
visualmente os cinco serviços e os três comparadores:

```bash
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/media/hero/hero-sala.webp"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/media/fotos-servicos/sofa.webp"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/media/comparacoes/sofa-antes.webp"
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' "$SITE_URL/media/comparacoes/sofa-depois.webp"
```

### Cabeçalhos de segurança e indexação

```bash
curl --silent --show-error --head "$SITE_URL/index.html"
```

Na produção, confira:

- status `200`;
- `Content-Security-Policy` com `default-src 'self'` e as demais diretivas;
- `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` e
  `X-Frame-Options`;
- ausência do bloqueio global `X-Robots-Tag: noindex, nofollow`.

Para uma URL real de preview, execute o mesmo `curl -I`. O resultado esperado é
`X-Robots-Tag: noindex`, acrescentado pelo Cloudflare. Previews são públicos por
padrão; habilite uma política do Cloudflare Access se o conteúdo precisar ficar
restrito durante revisão.

## Pages CMS depois do deploy

O Pages CMS é um serviço externo conectado ao GitHub e não é uma dependência
npm do site. A conta autenticada ainda precisa comprovar acesso ao repositório.
Em uma branch de teste:

1. abra o projeto no Pages CMS;
2. altere um texto demonstrativo e confirme qual branch/commit foi criado;
3. envie e substitua uma imagem WebP de teste;
4. confira o preview;
5. reverta o commit de teste e confirme que os dados voltaram ao estado inicial;
6. verifique que nenhum arquivo órfão ou dado real permaneceu em `media/`.

Esse ciclo não foi executado nesta etapa porque o ambiente não dispõe de uma
sessão autorizada do Pages CMS. Não forneça token pelo chat nem grave credenciais
no repositório.

## Limites e custo verificados

Na documentação oficial consultada em 09/11/2026, no commit
`e250a86a70fc9ef79eb9290e0d3b2b467aadfa39` de `cloudflare/cloudflare-docs`, o
plano Pages Free informa:

- 500 builds por mês e um build simultâneo;
- 20 minutos de tempo máximo por build;
- 20.000 arquivos por site;
- 25 MiB por arquivo;
- previews ilimitados, sujeitos às demais regras da plataforma.

Os limites podem mudar. Revise novamente antes de selecionar **Save and Deploy**.
Fontes oficiais:

- [integração Git](https://developers.cloudflare.com/pages/get-started/git-integration/);
- [configuração de build](https://developers.cloudflare.com/pages/configuration/build-configuration/);
- [limites](https://developers.cloudflare.com/pages/platform/limits/);
- [previews e indexação](https://developers.cloudflare.com/pages/configuration/preview-deployments/);
- [cabeçalhos](https://developers.cloudflare.com/pages/configuration/headers/).

## Checklist final

- [ ] QA local e GitHub Actions aprovados no commit que será publicado.
- [ ] Aviso **Projeto fictício para portfólio** visível em celular e desktop.
- [ ] Configuração sem framework, build vazio/`exit 0` e saída `.`.
- [ ] URL real e commit copiados do painel.
- [ ] HTTPS e cinco respostas de conteúdo com status `200`.
- [ ] Imagens de serviços e comparações carregando.
- [ ] CSP e demais cabeçalhos de segurança presentes.
- [ ] Produção sem bloqueio global de indexação.
- [ ] Preview com `X-Robots-Tag: noindex`.
- [ ] Nenhum contato, formulário, analytics ou dado real adicionado.
- [ ] Pages CMS marcado como não homologado até o ciclo manual completo.
