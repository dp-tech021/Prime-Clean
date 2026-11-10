(async () => {
  'use strict';
  const { loadPublicConfig, loadSupabaseContent, safePublicImageUrl } = await import('./public-content.mjs');
  const fallbackSite = {
    area: 'Projeto demonstrativo — sem área de atendimento'
  };
  const fallbackServices = [
    { title: 'Limpeza de sofás', description: 'Categoria demonstrativa para apresentar um cartão de serviço de sofás.', image: '/media/fotos-servicos/sofa.webp', imageAlt: 'Imagem ilustrativa gerada por IA de um sofá em uma sala', illustrative: true, order: 1, visible: true },
    { title: 'Higienização de colchões', description: 'Categoria demonstrativa para apresentar um cartão de colchões.', image: '/media/fotos-servicos/colchao.webp', imageAlt: 'Imagem ilustrativa gerada por IA de um colchão', illustrative: true, order: 2, visible: true },
    { title: 'Limpeza de cadeiras', description: 'Categoria demonstrativa para apresentar cartões de cadeiras estofadas.', image: '/media/fotos-servicos/cadeiras.webp', imageAlt: 'Imagem ilustrativa gerada por IA de cadeiras estofadas', illustrative: true, order: 3, visible: true },
    { title: 'Limpeza de poltronas', description: 'Categoria demonstrativa para apresentar um cartão de poltronas.', image: '/media/fotos-servicos/poltrona.webp', imageAlt: 'Imagem ilustrativa gerada por IA de uma poltrona', illustrative: true, order: 4, visible: true },
    { title: 'Bancos automotivos', description: 'Categoria demonstrativa para apresentar um cartão de bancos automotivos.', image: '/media/fotos-servicos/bancos-automotivos.webp', imageAlt: 'Imagem ilustrativa gerada por IA de bancos automotivos', illustrative: true, order: 5, visible: true }
  ];

  // Somente arquivos locais no repositório. Não permitir links arbitrários ou caminhos ../.
  function safeLocalImage(value) {
    if (typeof value !== 'string' || value.includes('..')) return '';
    if (!/^(?:\.\/|\/)?media\/[a-zA-Z0-9_\/.-]+\.(?:jpe?g|png|webp|avif)$/i.test(value)) return '';
    // Caminho relativo funciona na raiz e em prévias publicadas sob subdiretório.
    return value.replace(/^(?:\.\/|\/)/, '');
  }

  function safeImage(value) {
    return safeLocalImage(value) || safePublicImageUrl(value);
  }

  async function loadJson(path) {
    try {
      const response = await fetch(path, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`Prime-Clean: não foi possível carregar ${path}; usando conteúdo local de segurança.`, error);
      return null;
    }
  }

  function normalizeServices(value, fallback) {
    if (!Array.isArray(value)) return fallback;
    const services = value.flatMap((service, index) => {
      if (!service || typeof service !== 'object' || Array.isArray(service)) return [];
      if (typeof service.title !== 'string' || !service.title.trim()) return [];
      if (typeof service.description !== 'string' || !service.description.trim()) return [];
      return [{
        title: service.title.trim(),
        description: service.description.trim(),
        image: safeImage(service.image),
        imageAlt: typeof service.imageAlt === 'string' ? service.imageAlt.trim() : '',
        illustrative: service.illustrative !== false,
        order: Number.isFinite(service.order) ? service.order : index + 1,
        visible: service.visible !== false
      }];
    });
    return value.length > 0 && services.length === 0 ? fallback : services;
  }

  function normalizeComparisons(value) {
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
      const demonstrative = entry.demonstrative === true;
      // Este portfólio publica somente cenas sintéticas marcadas como demonstração.
      if (entry.published !== true || !demonstrative) return [];
      if (typeof entry.title !== 'string' || !entry.title.trim()) return [];
      if (typeof entry.service !== 'string' || !entry.service.trim()) return [];
      const before = safeImage(entry.before);
      const after = safeImage(entry.after);
      const canonicalBefore = before.replace(/^(?:\.\/|\/)/, '');
      const canonicalAfter = after.replace(/^(?:\.\/|\/)/, '');
      if (!before || !after || canonicalBefore === canonicalAfter) return [];
      if (typeof entry.beforeAlt !== 'string' || !entry.beforeAlt.trim()) return [];
      if (typeof entry.afterAlt !== 'string' || !entry.afterAlt.trim()) return [];
      return [{
        title: entry.title.trim(),
        service: entry.service.trim(),
        description: typeof entry.description === 'string' ? entry.description.trim() : '',
        before,
        after,
        beforeAlt: entry.beforeAlt.trim(),
        afterAlt: entry.afterAlt.trim(),
        order: Number.isFinite(entry.order) ? entry.order : index + 1,
        published: true,
        demonstrative
      }];
    }).sort((a, b) => a.order - b.order);
  }

  let c;
  let contentStatus = 'Conteúdo local de rollback ativo.';
  try {
    const config = await loadPublicConfig();
    if (config.mode === 'supabase') {
      const remote = await loadSupabaseContent(config);
      c = { ...remote.site, services: remote.services, comparisons: remote.comparisons };
      contentStatus = 'Conteúdo demonstrativo atualizado pelo painel administrativo.';
    } else {
      const [siteData, servicesData, comparisonsData] = await Promise.all([
        loadJson('data/site.json'), loadJson('data/servicos.json'), loadJson('data/comparacoes.json')
      ]);
      const site = siteData && typeof siteData === 'object' && !Array.isArray(siteData) ? siteData : {};
      c = {
        area: typeof site.area === 'string' && site.area.trim() ? site.area.trim() : fallbackSite.area,
        heroImage: safeLocalImage(site.heroImage),
        heroImageAlt: typeof site.heroImageAlt === 'string' ? site.heroImageAlt.trim() : '',
        heroImageIllustrative: site.heroImageIllustrative === true,
        heroImageVisible: site.heroImageVisible === true,
        services: normalizeServices(servicesData, fallbackServices).filter(service => service.visible).sort((a, b) => a.order - b.order),
        comparisons: normalizeComparisons(comparisonsData)
      };
    }
  } catch (error) {
    console.warn('Prime-Clean: a fonte pública está indisponível; nenhum conteúdo editorial anterior será republicado.', error);
    c = { area: fallbackSite.area, heroImage: '', heroImageAlt: '', heroImageIllustrative: false, heroImageVisible: false, services: [], comparisons: [] };
    contentStatus = 'Conteúdo demonstrativo temporariamente indisponível. Tente novamente mais tarde.';
  }
  const heroVisual = document.getElementById('hero-visual');
  const heroImage = document.getElementById('hero-image');
  const heroImageNote = document.getElementById('hero-image-note');
  if (heroVisual && heroImage && heroImageNote && c.heroImageVisible && c.heroImage && c.heroImageAlt && c.heroImageIllustrative) {
    const fallbackLabel = heroVisual.getAttribute('aria-label') || 'Ilustração gráfica de um sofá';
    function restoreHeroFallback() {
      heroImage.hidden = true;
      heroImage.removeAttribute('src');
      heroImage.alt = '';
      heroImageNote.hidden = true;
      heroVisual.classList.remove('has-photo');
      heroVisual.setAttribute('role', 'img');
      heroVisual.setAttribute('aria-label', fallbackLabel);
    }
    heroImage.addEventListener('load', () => {
      heroImage.hidden = false;
      heroImageNote.hidden = false;
      heroVisual.classList.add('has-photo');
      heroVisual.removeAttribute('role');
      heroVisual.removeAttribute('aria-label');
    }, { once: true });
    heroImage.addEventListener('error', restoreHeroFallback, { once: true });
    heroImage.alt = c.heroImageAlt;
    heroImage.decoding = 'async';
    heroImage.fetchPriority = 'high';
    heroImage.src = c.heroImage;
  }
  const grid = document.getElementById('services');
  if (grid) c.services.forEach(s => {
    const card = document.createElement('article');
    card.className = 'service';
    const art = document.createElement('div');
    art.className = 'service-art';
    art.textContent = '✦';
    art.setAttribute('aria-hidden', 'true');
    const serviceImage = safeImage(s.image);
    if (serviceImage) {
      const photo = document.createElement('img');
      let note = null;
      photo.src = serviceImage;
      photo.alt = s.imageAlt || 'Imagem do serviço: ' + s.title;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      photo.addEventListener('error', () => {
        photo.remove();
        if (note) note.remove();
        art.setAttribute('aria-hidden', 'true');
      });
      art.append(photo);
      if (s.illustrative) {
        note = document.createElement('span');
        note.className = 'service-image-note';
        note.textContent = 'Imagem ilustrativa / gerada por IA';
        art.append(note);
      }
      art.removeAttribute('aria-hidden');
    }
    const body = document.createElement('div');
    body.className = 'service-body';
    const h = document.createElement('h3'); h.textContent = s.title;
    const p = document.createElement('p'); p.textContent = s.description;
    const a = document.createElement('a');
    a.textContent = 'Entender o projeto ↓';
    a.href = '#sobre';
    body.append(h, p, a); card.append(art, body); grid.append(card);
  });
  if (grid && c.services.length === 0) {
    const message = document.createElement('p');
    message.className = 'results-empty';
    message.textContent = 'Os cartões demonstrativos estão temporariamente indisponíveis.';
    grid.append(message);
  }

  // Comparador acessível: range funciona por toque, arraste, mouse e teclado.
  const comparisonGrid = document.getElementById('comparisons');
  const empty = document.getElementById('results-empty');
  if (comparisonGrid) {
    const records = Array.isArray(c.comparisons) ? c.comparisons : [];
    records.forEach(entry => {
      if (!entry || entry.published !== true || typeof entry.title !== 'string' || !entry.title.trim()) return;
      const before = safeImage(entry.before);
      const after = safeImage(entry.after);
      if (!before || !after) return; // Pares incompletos não são divulgados.
      const card = document.createElement('article'); card.className = 'compare-card';
      const frame = document.createElement('div'); frame.className = 'compare-frame';
      const afterImage = document.createElement('img'); afterImage.src = after;
      afterImage.alt = typeof entry.afterAlt === 'string' && entry.afterAlt.trim() ? entry.afterAlt : 'Estado depois na comparação demonstrativa: ' + entry.title;
      afterImage.loading = 'lazy'; afterImage.decoding = 'async'; afterImage.className = 'compare-after';
      const beforeImage = document.createElement('img'); beforeImage.src = before;
      beforeImage.alt = typeof entry.beforeAlt === 'string' && entry.beforeAlt.trim() ? entry.beforeAlt : 'Estado antes na comparação demonstrativa: ' + entry.title;
      beforeImage.loading = 'lazy'; beforeImage.decoding = 'async'; beforeImage.className = 'compare-before';
      const tagBefore = document.createElement('span'); tagBefore.className = 'compare-tag before-tag'; tagBefore.textContent = 'ANTES';
      const tagAfter = document.createElement('span'); tagAfter.className = 'compare-tag after-tag'; tagAfter.textContent = 'DEPOIS';
      const handle = document.createElement('span'); handle.className = 'compare-handle'; handle.setAttribute('aria-hidden', 'true'); handle.textContent = '↔';
      const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '50'; slider.step = '1';
      slider.className = 'compare-slider'; slider.setAttribute('aria-label', 'Comparar antes e depois' + (entry.demonstrative ? ' (simulação)' : '') + ': ' + entry.title);
      function update() {
        frame.style.setProperty('--reveal', slider.value + '%');
        handle.style.left = slider.value + '%';
        slider.setAttribute('aria-valuetext', slider.value + '% de imagem antes à esquerda');
      }
      slider.addEventListener('input', update);
      frame.append(afterImage, beforeImage, tagBefore, tagAfter, handle, slider);
      update();
      const info = document.createElement('div'); info.className = 'compare-info';
      const label = document.createElement('p'); label.className = 'compare-disclaimer';
      label.textContent = 'SIMULAÇÃO • imagens geradas por IA — não é um trabalho real';
      const h = document.createElement('h3'); h.textContent = entry.title;
      const category = document.createElement('p'); category.className = 'compare-category';
      category.textContent = typeof entry.service === 'string' ? entry.service : '';
      const description = document.createElement('p');
      description.textContent = typeof entry.description === 'string' ? entry.description : '';
      info.append(label, h, category, description); card.append(frame, info); comparisonGrid.append(card);
      let failed = false;
      function fail() {
        if (failed) return;
        failed = true;
        card.remove();
        if (empty && comparisonGrid.children.length === 0) empty.hidden = false;
      }
      beforeImage.addEventListener('error', fail);
      afterImage.addEventListener('error', fail);
    });
    if (empty) empty.hidden = comparisonGrid.children.length > 0;
  }

  const projectStatus = document.getElementById('project-status');
  if (projectStatus) projectStatus.textContent = contentStatus;

  const area = document.getElementById('area');
  if (area && typeof c.area === 'string') area.textContent = c.area;
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const toggle = document.querySelector('.toggle');
  const nav = document.getElementById('menu');
  if (toggle && nav) {
    function close() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
      toggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        close();
        toggle.focus();
      }
    });
  }
})().catch(error => {
  console.error('Prime-Clean: falha ao iniciar a página.', error);
});
