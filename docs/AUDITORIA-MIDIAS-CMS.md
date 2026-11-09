# Auditoria do gerenciamento de imagens no Pages CMS

Auditoria realizada em 09/11/2026 sobre `.pages.yml`, `data/site.json`,
`data/servicos.json`, `data/comparacoes.json` e o frontend estático.

## Resultado por área

| Área | Adicionar/substituir foto | Ocultar | Reordenar | Remover |
| --- | --- | --- | --- | --- |
| Foto principal | Campo `heroImage` e biblioteca `destaque` | `heroImageVisible` | não se aplica | limpar o campo após ocultar; o fallback gráfico permanece |
| Serviços | campo `image` em cada item; itens podem ser adicionados | `visible` | campo `order` | remover a imagem mantém o cartão com fallback; lixeira remove o item |
| Antes/depois | campos obrigatórios `before` e `after`; itens podem ser adicionados | `published` | campo `order` | lixeira remove o par inteiro |

`data/servicos.json` e `data/comparacoes.json` usam `type: file`, `format: json`
e `list: true`. No Pages CMS 2.1.8, o editor de listas usa controles de
adicionar, remover e arrastar itens. O editor de imagem oferece upload, seleção,
substituição e remoção. O bloco `operations` das comparações protege o arquivo
JSON inteiro; ele não desativa as operações dos itens internos. Os três arquivos
de dados têm criação, renomeação e exclusão do arquivo desativadas para evitar
que o editor apague a fonte de conteúdo completa.

A posição arrastada no editor altera a sequência do array, mas o site ordena
pelo valor numérico `order`. Por isso, o proprietário deve atualizar `order`:
números menores aparecem primeiro. Essa regra está descrita nos campos do CMS.

## Contratos dos JSONs

### `data/site.json`

A foto principal agora usa `heroImage`, `heroImageAlt`,
`heroImageIllustrative` e `heroImageVisible`. O caminho deve ser local, o texto
alternativo deve declarar o caráter ilustrativo/gerado por IA e o indicador
ilustrativo deve permanecer ativo. Se a foto for ocultada, a ilustração CSS
acessível volta a aparecer.

### `data/servicos.json`

Uma foto é opcional. Quando existe, caminho local, texto alternativo e
`illustrative: true` são validados. Limpar `image` e `imageAlt` mantém o cartão
visível com um fallback gráfico. `visible: false` oculta o cartão inteiro.

### `data/comparacoes.json`

Cada registro exige duas imagens locais, distintas e textos alternativos. O site
só mostra registros `published: true` e `demonstrative: true`. Se um arquivo
falhar no navegador, o cartão incompleto é removido sem quebrar a página.

## Exclusão segura e órfãos

O Pages CMS não oferece, nessa configuração, uma trava referencial antes de
apagar diretamente um arquivo da biblioteca de mídia. A proteção do projeto tem
três camadas:

1. `scripts/auditar_midias.py --verificar-exclusao CAMINHO` bloqueia um caminho
   ainda usado por qualquer JSON;
2. `scripts/validar_conteudo.py` e o GitHub Actions falham quando uma referência
   aponta para arquivo ausente ou caminho externo/inseguro;
3. o frontend usa fallback para foto principal/serviço e remove comparações
   incompletas caso uma falha chegue a uma prévia.

A auditoria é somente leitura. Ela nunca apaga arquivos:

```bash
python3 scripts/auditar_midias.py
python3 scripts/auditar_midias.py --verificar-exclusao media/hero/hero-sala.webp
```

O segundo comando retorna código `2` enquanto o arquivo estiver referenciado.
Para limpar um órfão:

1. crie uma branch e remova/substitua primeiro a referência no CMS;
2. execute o validador e a auditoria;
3. confirme que o caminho aparece como `ÓRFÃ`;
4. execute `--verificar-exclusao` e exija `OK PARA LIMPEZA`;
5. só então remova o arquivo no CMS ou no Git;
6. execute novamente os testes e revise o diff antes do PR.

Não apague automaticamente todos os órfãos: um upload pode estar aguardando uso
em outro commit. Excluir o arquivo atual também não o remove do histórico Git.

## Evidência e limite da auditoria

A configuração foi confrontada com o código oficial do Pages CMS 2.1.8, commit
`6f4e860a35d934406580287e7042e5e111e207a1`. Os JSONs modificados em memória
foram testados no Chromium para adição, ocultação, ordem, remoção e 404.

O login, upload e commit na instalação hospedada do Pages CMS não foram
executados: não havia sessão autorizada disponível. O checklist manual no
`MANUAL-PROPRIETARIO.md` deve ser homologado pela dupla antes de considerar o
fluxo aprovado.
