// Dados fornecidos para o protótipo. Revise as URLs e canais antes da publicação.
// O telefone +55 (21) 4002-8922 foi informado como WhatsApp, mas NÃO foi confirmado
// como uma conta ativa. Por isso a configuração whatsapp fica vazia por segurança.
// Só preencha whatsapp depois de confirmar o número com o proprietário e testar a conversa.
window.PRIME_CLEAN = {
  whatsapp: "", // Ex.: 55219XXXXXXXX após validação; apenas DDI + DDD + número, sem sinais.
  instagram: "https://www.instagram.com/Prime_Clean/", // Perfil informado; validar se pertence à empresa.
  area: "Rio de Janeiro, RJ — disponibilidade por bairro sob consulta",
  // Opcional: cada serviço pode usar `image: "media/fotos-servicos/sofa.webp"`.
  services: [
    {title:"Limpeza de sofás", icon:"🛋️", image:"media/fotos-servicos/sofa.webp", text:"Higienização e cuidado para o sofá que reúne seus melhores momentos."},
    {title:"Higienização de colchões", icon:"🛏️", image:"media/fotos-servicos/colchao.webp", text:"Cuidados de limpeza para o colchão e o ambiente de descanso."},
    {title:"Limpeza de cadeiras", icon:"🪑", image:"media/fotos-servicos/cadeiras.webp", text:"Higienização de cadeiras estofadas para casa ou escritório."},
    {title:"Limpeza de poltronas", icon:"✨", image:"media/fotos-servicos/poltrona.webp", text:"Cuidado dedicado às poltronas do seu ambiente."},
    {title:"Bancos automotivos", icon:"🚗", image:"media/fotos-servicos/bancos-automotivos.webp", text:"Higienização de bancos estofados e cuidado com o interior do veículo."}
  ],
  // Uma comparação reúne fotos do MESMO item: mesmo ângulo, condição e enquadramento.
  // Campos: title, service, description, before, after, beforeAlt, afterAlt.
  // O proprietário editará os registros por um CMS, após concluir a Etapa 2.
  // Nenhuma foto fictícia foi publicada como resultado real.
  comparisons: []
};
