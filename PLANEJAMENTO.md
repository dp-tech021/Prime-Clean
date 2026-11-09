# Planejamento Prime-Clean — atualização: fotos e antes/depois (08/11/2026)

## Requisito adicional aprovado para o planejamento

O proprietário deve conseguir **adicionar, visualizar, substituir/editar informações, ocultar e remover** fotografias sem abrir o código; também precisa cadastrar resultados com um par obrigatório de fotos do mesmo item **ANTES / DEPOIS**, e exibir comparações interativas na página pública.

**Editar foto** nesta etapa significa substituir a imagem, alterar legenda, categoria, textos alternativos e ordem. Recorte/edição de pixels no próprio navegador NÃO está incluído; pode ser avaliado depois se for essencial.

## Estado de implementação

- [x] Página inicial, cinco serviços, contato e layout responsivo do MVP.
- [x] Adicionada seção pública "Antes e depois"; comparador por deslizamento com controle de teclado e toque (implementação local).
- [x] Contatos e serviços migrados para `data/site.json` e `data/servicos.json`, consumidos pelo frontend.
- [x] Galeria só exibe registros com fotos `before` e `after` válidas; sem fotos reais, exibe aviso de ausência. **Nenhum trabalho fictício foi apresentado como real.**
- [ ] Não há ainda fotos reais autorizadas.
- [x] O schema do Pages CMS está versionado em `.pages.yml` para trabalhos e imagens.
- [ ] O uso hospedado do CMS e suas operações com arquivos ainda precisam de validação com o proprietário.
- [ ] Testes com CMS e proprietário e deploy: pendentes.

## Decisão técnica

Manter HTML/CSS/JavaScript e utilizar CMS baseado em Git. **Preferência: Pages CMS**, com `.pages.yml` e arquivos JSON no repositório. Documentação oficial comprova campos de imagem/upload, listagem e ações de criar/renomear/excluir conteúdos; ainda é necessário **validar em uso real** o comportamento ao excluir uma foto física que já esteja referenciada. Isso não pode ser presumido.

**Alternativa:** Sveltia CMS dispõe de biblioteca de mídia que documenta substituição, exclusão e atualização de referências a imagens, mas para GitHub pode exigir configuração adicional de OAuth e observar branches protegidas. Avaliar se Pages CMS não cumprir o teste de remoção segura.

### Modelo de dados proposto para a próxima etapa

- `data/site.json`: contatos e região.
- `data/servicos.json`: lista ordenada de serviços com título, descrição, imagem, texto alternativo e visibilidade.
- `data/comparacoes.json`: modelo futuro para pares; cada item deverá conter `title`, `service`, `description`, `before`, `after`, `beforeAlt`, `afterAlt`, `published`. A galeria permanece vazia até essa integração e a disponibilidade de fotos reais autorizadas.
- `media/`: arquivos jpg/png/webp/avif enviados pelo CMS. Usar nomes únicos e otimização.

Não buscar diretórios via JS em produção: hospedagem estática não expõe listagem de arquivos de forma confiável. Preferir índice explícito em JSON ou um pequeno build automático.

## Experiência do proprietário (critérios obrigatórios)

1. Entrar no CMS com autenticação própria e permissões restritas ao repositório Prime-Clean.
2. Adicionar uma nova foto de serviço com pré-visualização; substituir imagem e editar informações; ocultar da página pública; remover registro.
3. Criar trabalho de "Antes / Depois" fornecendo as duas fotos, nome, categoria e textos; alterar imagens e descrições; visualizar no site; excluir/ocultar.
4. Ao excluir foto em uso, evitar links quebrados. Testar se a mídia física é mantida (órfão) ou removida e, se preciso, implementar revisão/limpeza segura; nunca fazer exclusão indiscriminada.
5. A publicação ocorre de modo previsível após salvar (e deploy, se houver); opção de desfazer pelo histórico do Git.
6. Testar no celular e desktop; editor deve funcionar para alguém sem familiaridade com Git.

## Regras de qualidade e privacidade

- Publicar somente fotografias reais de trabalhos autorizadas pelo cliente. Retirar placas legíveis, rostos, documentos, endereços e metadados EXIF/GPS antes do upload.
- Para comparar honestamente, usar o **mesmo estofado**, enquadramento e iluminação semelhantes. Não retocar para simular resultado ou usar imagens ilustrativas como provas.
- Um par incompleto não pode ser publicado; alt text diferente para antes e depois.
- Referência inicial de tamanho de arquivo: reduzir para ~1600px na maior dimensão e, quando possível, ~300–500 KB por foto; verificar a qualidade caso a foto precise de detalhe. São **metas internas sugeridas**, não limites do CMS.
- Fotos em repositório Git público podem continuar acessíveis no histórico mesmo após exclusão. **Não enviar fotos privadas ou não autorizadas.**
- Não armazenar segredos no repositório/IA. WhatsApp `+55 (21) 4002-8922` informado, mas não confirmado como conta ativa; manter sem ativar até confirmação. Região: Rio de Janeiro; Instagram `@Prime_Clean` ainda necessita validação.

## Ações da dupla

- **Dev A:** estrutura de dados, schema do CMS, gestão de mídia e testes de criação/edição/remoção e referências.
- **Dev B:** comparador responsivo, acessibilidade (range teclado/toque), alternativas quando imagens faltarem, otimização e documentação com capturas.
- Revisão cruzada em PR antes do merge na `main`.

## Marcos

- Etapa 2A: CMS de textos e serviços + fotos de serviço (MVP de edição).
- Etapa 2B: CRUD de trabalhos antes/depois + comparador integrado ao CMS + remoção segura.
- Etapa 3: validar com proprietário, publicar em hospedagem gratuita, ajustar SEO, analytics apenas se consentimento/base legal e necessidade.

## Fontes oficiais verificadas em 08/11/2026

- Pages CMS: https://pagescms.org/docs/configuration/fields/image/
- Pages CMS (listas): https://pagescms.org/docs/configuration/content/list/
- Pages CMS (mídia): https://pagescms.org/docs/configuration/media/
- Pages CMS (operações): https://pagescms.org/docs/configuration/content/operations/
- Sveltia CMS Asset Library: https://sveltiacms.app/en/docs/ui/asset-library
- Sveltia CMS GitHub: https://sveltiacms.app/en/docs/backends/github
