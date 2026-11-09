# Prime-Clean — MVP atualizado (08/11/2026)

Landing page comercial responsiva, sem framework e sem banco de dados. Objetivo: apresentar serviços e captar pedidos de orçamento. **Atualização: contatos, serviços e comparações foram migrados para JSON e integrados ao frontend. A configuração do Pages CMS está versionada, mas ainda não foi testada na interface hospedada. A seção de antes/depois continua vazia até receber fotos reais autorizadas.**

## Como testar localmente

1. Extraia o ZIP ou copie os arquivos para uma pasta.
2. Abra um terminal nessa pasta, execute `python3 -m http.server 8000` (Python instalado) e visite `http://localhost:8000`.
3. Teste no celular (ou ferramentas responsivas do navegador) e clique no botão **Solicitar orçamento**.
4. Enquanto não houver WhatsApp validado, a ação abre o Instagram informado, **não** o WhatsApp. Confira com o proprietário se o perfil de destino é dele.

Nenhum `npm install` é necessário.

## Informações fornecidas

- Região: **Rio de Janeiro, RJ**, com bairros ainda a confirmar.
- Instagram informado: `@Prime_Clean` → `https://www.instagram.com/Prime_Clean/`. **Titularidade e disponibilidade não verificadas.**
- WhatsApp informado: `+55 (21) 4002-8922`. **Não configurado no site, pois não foi confirmado que recebe mensagens no WhatsApp.**
- Identidade visual: ainda não existe. Layout atual em verde, creme e tons claros é uma **proposta**, não aprovação da marca.

## Como editar o conteúdo

- `data/site.json`: Instagram informado, WhatsApp validado e área de atendimento.
- `data/servicos.json`: título, descrição, foto, texto alternativo, indicação de imagem ilustrativa, ordem e visibilidade de cada serviço.
- `data/comparacoes.json`: trabalhos com título, serviço, descrição, ordem, publicação, consentimento e duas fotos obrigatórias com textos alternativos.
- `.pages.yml`: apresenta esses arquivos e as bibliotecas de mídia no Pages CMS.

O campo `whatsapp` deve ficar vazio até a confirmação do número correto e teste de conversa. Depois, preencher com DDI+DDD+número **apenas dígitos**, por exemplo `55...`. O padrão numérico sozinho **não prova** que existe WhatsApp nesse número.

O frontend carrega os JSONs por HTTP, valida seus tipos e usa conteúdo local de segurança se a leitura falhar. As demais seções fixas continuam em `index.html`. Consulte `PLANEJAMENTO.md` e `plugins/PAGES-CMS.md`.

## Imagens ilustrativas

Os cartões de serviço usam imagens ilustrativas geradas por IA. Elas não são
fotografias de atendimentos da Prime-Clean e não podem ser apresentadas como
resultados reais ou usadas na seção **Antes e depois**:

- `media/fotos-servicos/sofa.webp`
- `media/fotos-servicos/colchao.webp`
- `media/fotos-servicos/cadeiras.webp`
- `media/fotos-servicos/poltrona.webp`
- `media/fotos-servicos/bancos-automotivos.webp`

O arquivo `media/hero/hero-sala.webp` também é uma imagem ilustrativa gerada por
IA, mantida como opção editorial e ainda não usada pelo layout.

## Checklist para publicar

- [ ] Validar titularidade do Instagram e testar link real.
- [ ] Confirmar número oficial do WhatsApp da empresa e testar diálogo em aparelho externo.
- [ ] Confirmar bairros atendidos e a disponibilidade dos cinco serviços.
- [ ] Aprovar identidade visual, fotografias reais autorizadas, textos e chamadas comerciais.
- [ ] Revisar alterações em PR e testar 360px, 768px e desktop, teclado, contraste e links.
- [ ] Publicar no Cloudflare Pages quando aprovada a versão (plano gratuito com limites; confirmar antes de implantar).
- [ ] Testar editor visual (Etapa 2) com o proprietário antes de declarar o requisito concluído.

## Colaboração

Uma branch por alteração; abrir pull request, fazer revisão cruzada e só então fazer merge. Não inserir senhas, tokens ou dados pessoais reais no código nem em ferramentas de IA.

## Referências

- WhatsApp clique para conversar: https://faq.whatsapp.com/5913398998672934/?locale=pt_BR
- Pages CMS: https://pagescms.org/docs/quick-start/
- Cloudflare Pages: https://developers.cloudflare.com/pages/platform/limits/
- GitHub Pages limita uso comercial: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Galeria de fotos e comparador

A página lê `data/comparacoes.json` e apresenta somente registros publicados, com consentimento confirmado, duas imagens locais distintas e textos alternativos. Como **não recebemos fotos reais e autorizadas**, o arquivo começa como `[]` e a página mostra um aviso. Não são mostrados resultados ilustrativos como se fossem casos reais.

O modelo de um registro de comparação é:

```js
comparisons: [{
  title: "Limpeza de sofá — demonstração autorizada",
  service: "Sofás",
  description: "Comparação do mesmo sofá antes e depois do atendimento.",
  before: "/media/comparacoes/sofa-antes.webp",
  after: "/media/comparacoes/sofa-depois.webp",
  beforeAlt: "Sofá antes do procedimento",
  afterAlt: "Mesmo sofá após o procedimento",
  order: 1,
  consentConfirmed: true,
  published: true
}]
```

Um serviço em `data/servicos.json` pode ter campo `image`, como `image: "/media/fotos-servicos/sofa.webp"`; caso não tenha, seu cartão continua com ícone. Para não publicar informações não autorizadas, os dados acima são **apenas um exemplo de estrutura**, não uma promessa nem fotos fornecidas.

O Pages CMS edita o array com `type: file`, `format: json` e `list: true`. O proprietário pode adicionar, editar, ocultar, reordenar pelo campo `order` e remover itens sem editar código. Esse fluxo ainda precisa ser testado na interface hospedada.

**Atenção:** apagar um registro não implica necessariamente apagar seu arquivo do Git, e apagar arquivos do Git não garante remoção do histórico público. Nunca inserir fotos privadas sem autorização.
