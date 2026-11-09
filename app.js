(() => {
  'use strict';
  const c = window.PRIME_CLEAN || {};
  const phone = typeof c.whatsapp === 'string' ? c.whatsapp.trim() : '';
  // Sintaxe válida não garante conta de WhatsApp ativa: validar manualmente antes de preencher.
  const validPhone = /^\d{12,15}$/.test(phone);
  const instagram = typeof c.instagram === 'string' ? c.instagram.trim() : '';
  const validInstagram = /^https:\/\/www\.instagram\.com\/[A-Za-z0-9._]+\/?$/.test(instagram);

  // Somente arquivos locais no repositório. Não permitir links arbitrários ou caminhos ../.
  function safeLocalImage(value) {
    if (typeof value !== 'string' || value.includes('..')) return '';
    return /^(?:\.\/|\/)?media\/[a-zA-Z0-9_\/.-]+\.(?:jpe?g|png|webp|avif)$/i.test(value) ? value : '';
  }

  const url = service => 'https://wa.me/' + phone + '?text=' + encodeURIComponent(
    service ? 'Olá! Gostaria de um orçamento para ' + service + '.' : 'Olá! Gostaria de um orçamento com a Prime-Clean.'
  );

  function setLink(a, service) {
    if (validPhone) {
      a.href = url(service);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      return;
    }
    if (validInstagram) {
      a.href = instagram;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = 'Abrir perfil informado no Instagram (titularidade e WhatsApp pendentes de validação)';
      a.setAttribute('aria-label', 'Abrir perfil informado no Instagram' + (service ? ' sobre: ' + service : ''));
      if (a.id === 'floating') {
        a.textContent = 'Instagram ↗';
        a.classList.add('instagram-fallback');
      }
      return;
    }
    a.href = '#contato';
    a.removeAttribute('target');
    a.removeAttribute('rel');
    a.title = 'Contato ainda não configurado';
    a.setAttribute('aria-label', 'Contato ainda não configurado');
  }

  document.querySelectorAll('.whatsapp').forEach(a => setLink(a, ''));
  const grid = document.getElementById('services');
  if (grid) (Array.isArray(c.services) ? c.services : []).forEach(s => {
    if (!s || typeof s.title !== 'string' || typeof s.text !== 'string') return;
    const card = document.createElement('article');
    card.className = 'service';
    const art = document.createElement('div');
    art.className = 'service-art';
    art.textContent = typeof s.icon === 'string' ? s.icon : '✦';
    art.setAttribute('aria-hidden', 'true');
    const serviceImage = safeLocalImage(s.image);
    if (serviceImage) {
      const photo = document.createElement('img');
      photo.src = serviceImage;
      photo.alt = 'Imagem ilustrativa gerada por IA para ' + s.title;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      photo.addEventListener('error', () => photo.remove());
      art.append(photo);
      const note = document.createElement('span');
      note.className = 'service-image-note';
      note.textContent = 'Imagem ilustrativa';
      art.append(note);
      art.removeAttribute('aria-hidden');
    }
    const body = document.createElement('div');
    body.className = 'service-body';
    const h = document.createElement('h3'); h.textContent = s.title;
    const p = document.createElement('p'); p.textContent = s.text;
    const a = document.createElement('a'); a.textContent = 'Consultar orçamento ↗';
    setLink(a, s.title);
    body.append(h, p, a); card.append(art, body); grid.append(card);
  });

  // Comparador acessível: range funciona por toque, arraste, mouse e teclado.
  const comparisonGrid = document.getElementById('comparisons');
  const empty = document.getElementById('results-empty');
  if (comparisonGrid) {
    const records = Array.isArray(c.comparisons) ? c.comparisons : [];
    records.forEach((entry, index) => {
      if (!entry || entry.published !== true || typeof entry.title !== 'string' || !entry.title.trim()) return;
      const before = safeLocalImage(entry.before);
      const after = safeLocalImage(entry.after);
      if (!before || !after) return; // Pares incompletos não são divulgados.
      const card = document.createElement('article'); card.className = 'compare-card';
      const frame = document.createElement('div'); frame.className = 'compare-frame';
      const afterImage = document.createElement('img'); afterImage.src = after;
      afterImage.alt = typeof entry.afterAlt === 'string' && entry.afterAlt.trim() ? entry.afterAlt : 'Depois da limpeza: ' + entry.title;
      afterImage.loading = 'lazy'; afterImage.decoding = 'async'; afterImage.className = 'compare-after';
      const beforeImage = document.createElement('img'); beforeImage.src = before;
      beforeImage.alt = typeof entry.beforeAlt === 'string' && entry.beforeAlt.trim() ? entry.beforeAlt : 'Antes da limpeza: ' + entry.title;
      beforeImage.loading = 'lazy'; beforeImage.decoding = 'async'; beforeImage.className = 'compare-before';
      const tagBefore = document.createElement('span'); tagBefore.className = 'compare-tag before-tag'; tagBefore.textContent = 'ANTES';
      const tagAfter = document.createElement('span'); tagAfter.className = 'compare-tag after-tag'; tagAfter.textContent = 'DEPOIS';
      const handle = document.createElement('span'); handle.className = 'compare-handle'; handle.setAttribute('aria-hidden', 'true'); handle.textContent = '↔';
      const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '50'; slider.step = '1';
      slider.className = 'compare-slider'; slider.setAttribute('aria-label', 'Comparar antes e depois: ' + entry.title);
      function update() {
        frame.style.setProperty('--reveal', slider.value + '%');
        handle.style.left = slider.value + '%';
        slider.setAttribute('aria-valuetext', slider.value + '% de imagem antes à esquerda');
      }
      slider.addEventListener('input', update);
      frame.append(afterImage, beforeImage, tagBefore, tagAfter, handle, slider);
      update();
      const info = document.createElement('div'); info.className = 'compare-info';
      const h = document.createElement('h3'); h.textContent = entry.title;
      const category = document.createElement('p'); category.className = 'compare-category';
      category.textContent = typeof entry.service === 'string' ? entry.service : '';
      const description = document.createElement('p');
      description.textContent = typeof entry.description === 'string' ? entry.description : '';
      info.append(h, category, description); card.append(frame, info); comparisonGrid.append(card);
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

  const insta = document.getElementById('instagram');
  if (insta && validInstagram) {
    insta.href = instagram;
    insta.hidden = false;
    insta.target = '_blank';
    insta.rel = 'noopener noreferrer';
  }
  // Evita mostrar links duplicados ou prometer WhatsApp quando não há número ativo.
  const footerWhatsapp = document.querySelector('.footer .whatsapp');
  if (footerWhatsapp && !validPhone) footerWhatsapp.hidden = true;
  const floating = document.getElementById('floating');
  if (floating && !validPhone && !validInstagram) floating.hidden = true;
  const contactStatus = document.getElementById('contact-status');
  if (contactStatus) contactStatus.textContent = validPhone
    ? 'Atendimento via WhatsApp disponível para consulta de orçamento.'
    : validInstagram
      ? 'Perfil informado no Instagram disponível como canal alternativo; titularidade e WhatsApp aguardam validação.'
      : 'Os contatos comerciais ainda não foram configurados.';

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
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  if (!validPhone) console.warn('Prime-Clean: WhatsApp pendente de validação. Não publicar um número não confirmado.');
})();
