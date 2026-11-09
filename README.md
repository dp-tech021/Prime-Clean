# Prime-Clean — projeto fictício de portfólio

> **Projeto fictício para portfólio — demonstração de interface e gerenciamento
> de conteúdo; não é uma empresa em operação.**

A Prime-Clean é uma marca criada exclusivamente como estudo de portfólio por
dois desenvolvedores em formação. O repositório demonstra um site estático
responsivo, conteúdo em JSON e configuração do Pages CMS. Não há empresa,
clientes, atendimento comercial ou contatos externos associados ao projeto.

## Executar localmente

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Nenhuma dependência de execução ou etapa de build
é necessária.

## Estrutura

- `index.html`, `styles.css` e `app.js`: interface em HTML, CSS e JavaScript.
- `data/site.json`: campos institucionais mantidos para demonstrar o CMS; os
  contatos permanecem vazios.
- `data/servicos.json`: cinco cartões demonstrativos com imagens ilustrativas.
- `data/comparacoes.json`: três pares sintéticos para demonstrar o comparador.
- `.pages.yml`: schema demonstrativo para editar listas, textos e mídias.
- `media/`: imagens locais do protótipo.

Consulte `MANUAL-PROPRIETARIO.md` para o fluxo editorial demonstrativo e
`QA-PUBLICACAO.md` para a auditoria e os testes.

## Serviços e imagens

Os cinco serviços são categorias de demonstração. Suas imagens foram geradas
por IA, usam textos alternativos e aparecem com o rótulo **Imagem ilustrativa /
gerada por IA**. Elas não representam trabalhos realizados.

Arquivos preservados:

- `media/fotos-servicos/sofa.webp`
- `media/fotos-servicos/colchao.webp`
- `media/fotos-servicos/cadeiras.webp`
- `media/fotos-servicos/poltrona.webp`
- `media/fotos-servicos/bancos-automotivos.webp`

## Comparador demonstrativo

O comparador usa três pares locais inteiramente sintéticos: sofá, colchão e
cadeira. Cada cartão informa **SIMULAÇÃO**, identifica as imagens como geradas
por IA e declara que não se trata de trabalho real. Os pares representam o
mesmo objeto em dois estados gráficos e não constituem prova de resultado.

Um registro sintético usa:

```json
{
  "title": "Sofá — exemplo sintético",
  "before": "/media/comparacoes/sofa-antes.webp",
  "after": "/media/comparacoes/sofa-depois.webp",
  "demonstrative": true,
  "consentConfirmed": false,
  "published": true
}
```

O campo `consentConfirmed` foi concebido originalmente para fotos reais, mas
fica `false` em todas as simulações. Ele permanece apenas para demonstrar o
schema editorial e não constitui prova jurídica. O campo separado
`demonstrative` identifica conteúdo sintético e é obrigatório para que uma
comparação apareça neste portfólio.

## Pages CMS

O Pages CMS é apresentado como demonstração de administração de conteúdo em um
site estático baseado em Git. Os campos de WhatsApp e Instagram foram
preservados no schema para fins didáticos, mas ficam vazios e não geram links na
interface.

O painel permite demonstrar a edição de textos, ordem, visibilidade e caminhos
de mídia. Seu uso autenticado depende da instalação e das permissões da GitHub
App e deve ser descrito como teste do protótipo, não como operação comercial.

## QA reproduzível

Pré-requisitos:

- Python 3.10 ou superior;
- Node.js instalado apenas para a verificação de sintaxe;
- nenhuma biblioteca Python ou npm adicional.

Execute na raiz do repositório:

```bash
python3 scripts/validar_conteudo.py
python3 -m unittest discover -s tests -p "test_*.py" -v
node --check app.js
python3 -m http.server 8000
```

O validador confere os três JSONs, schemas básicos, campos `order`, caminhos e
existência das imagens, rotulagem das simulações e ausência de contatos externos
habilitados. Em sucesso, a primeira linha esperada é:

```text
OK: dados do repositório válido; 11 imagem(ns) local(is) verificada(s).
```

Os testes de fixtures devem terminar com `Ran 3 tests` e `OK`. `node --check`
não imprime nada quando a sintaxe está válida. O servidor HTTP permanece aberto
até receber `Ctrl+C`; visite `http://localhost:8000` para a revisão visual.

Uma falha retorna código diferente de zero e informa arquivo, índice e campo,
por exemplo:

```text
ERRO: tests/fixtures/comparacao_foto_ausente.json:before: arquivo de imagem não encontrado: media/comparacoes/inexistente.webp
```

As três fixtures ficam em `tests/fixtures/`, fora das pastas consumidas pelo
site e pelo CMS. Para observar uma falha esperada diretamente:

```bash
python3 scripts/validar_conteudo.py --fixture tests/fixtures/comparacao_url_externa.json --tipo comparacao
```

O workflow `.github/workflows/qa.yml` executa as três verificações automáticas
em pull requests e pushes para `main`.

## Limites do projeto

- não oferece orçamento, atendimento ou contratação;
- não possui telefone, e-mail, endereço, domínio ou perfil social;
- não usa analytics nem dependências de execução;
- não representa uma empresa ou serviços realizados;
- não deve ser publicado como operação comercial.
