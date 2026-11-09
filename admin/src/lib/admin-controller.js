import { AdminDataError, validateAltText, validateImage } from './media-service.js';

const $ = (selector) => document.querySelector(selector);
const element = (tag, options = {}) => {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  return node;
};

export function createAdminController(service, { onUnauthorized } = {}) {
  let state = { settings: null, assets: [], services: [], comparisons: [] };
  const status = $('#dashboard-status');

  function announce(message, error = false) {
    status.textContent = message;
    status.classList.toggle('error', error);
    status.focus?.({ preventScroll: true });
  }

  async function run(action, success) {
    status.textContent = 'Processando…';
    try {
      await action();
      await refresh();
      announce(success);
      return true;
    } catch (error) {
      const message = error instanceof AdminDataError ? error.message : 'Não foi possível concluir a operação. Tente novamente.';
      try { await refresh(); } catch { /* mantém a mensagem original e a tela íntegra */ }
      announce(message, true);
      if (/sessão|autorizada/i.test(message)) onUnauthorized?.();
      return false;
    }
  }

  function assetById(id) { return state.assets.find((asset) => asset.id === id); }
  function references(assetId) {
    return [
      ...(state.settings?.hero_asset_id === assetId ? ['Foto principal'] : []),
      ...state.services.filter((item) => item.image_asset_id === assetId).map((item) => `Serviço: ${item.title}`),
      ...state.comparisons.filter((item) => item.before_asset_id === assetId || item.after_asset_id === assetId).map((item) => `Comparação: ${item.title}`)
    ];
  }

  function imageFor(asset, className = '') {
    const image = element('img', { className });
    image.src = service.publicUrl(asset);
    image.alt = asset.alt_text;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.hidden = true;
      const fallback = element('span', { className: 'image-fallback', text: 'Imagem indisponível' });
      image.parentElement?.append(fallback);
    }, { once: true });
    return image;
  }

  function fillMediaSelects() {
    document.querySelectorAll('[data-media-select]').forEach((select) => {
      const current = select.value;
      select.replaceChildren();
      const empty = element('option', { text: select.dataset.emptyLabel || 'Selecione' });
      empty.value = '';
      select.append(empty);
      state.assets.forEach((asset) => {
        const option = element('option', { text: `${asset.alt_text} · ${asset.public_visible ? 'visível' : 'oculta'}` });
        option.value = asset.id;
        select.append(option);
      });
      if ([...select.options].some((option) => option.value === current)) select.value = current;
    });
  }

  function renderHero() {
    const form = $('#hero-form');
    form.elements.assetId.value = state.settings?.hero_asset_id || '';
    form.elements.visible.checked = Boolean(state.settings?.hero_visible);
    const asset = assetById(form.elements.assetId.value);
    const preview = $('#hero-preview');
    const caption = $('#hero-caption');
    if (asset) {
      preview.src = service.publicUrl(asset);
      preview.alt = asset.alt_text;
      preview.hidden = false;
      caption.textContent = `${asset.alt_text} · ${state.settings.hero_visible ? 'publicada' : 'oculta'}`;
    } else {
      preview.removeAttribute('src');
      preview.alt = '';
      preview.hidden = true;
      caption.textContent = 'Nenhuma foto selecionada.';
    }
  }

  function actionButton(label, action, secondary = false) {
    const button = element('button', { text: label, className: secondary ? 'secondary' : '' });
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }

  function renderServices() {
    const list = $('#service-list');
    list.replaceChildren();
    if (!state.services.length) list.append(element('p', { text: 'Nenhum serviço cadastrado no backend.' }));
    state.services.forEach((item) => {
      const card = element('article', { className: 'record-card' });
      const asset = assetById(item.image_asset_id);
      if (asset) card.append(imageFor(asset, 'record-thumb'));
      const content = element('div');
      content.append(element('h3', { text: item.title }), element('p', { text: item.description }), element('p', { className: 'meta', text: `Ordem ${item.sort_order} · ${item.visible ? 'Publicado' : 'Oculto'} · ${asset ? 'Com foto' : 'Sem foto'}` }));
      const actions = element('div', { className: 'button-row' });
      actions.append(actionButton('Editar', () => editService(item), true), actionButton('Remover', async () => {
        if (confirm(`Remover o serviço “${item.title}”? A foto continuará na biblioteca.`)) await run(() => service.deleteService(item.id), 'Serviço removido.');
      }));
      content.append(actions);
      card.append(content);
      list.append(card);
    });
  }

  function editService(item) {
    const form = $('#service-form');
    form.elements.id.value = item.id;
    form.elements.title.value = item.title;
    form.elements.description.value = item.description;
    form.elements.order.value = item.sort_order;
    form.elements.visible.checked = item.visible;
    form.elements.assetId.value = item.image_asset_id || '';
    $('#service-cancel').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.title.focus();
  }

  function resetService() {
    const form = $('#service-form');
    form.reset();
    form.elements.id.value = '';
    form.elements.order.value = Math.max(1, state.services.length + 1);
    $('#service-cancel').hidden = true;
  }

  function renderComparisons() {
    const list = $('#comparison-list');
    list.replaceChildren();
    if (!state.comparisons.length) list.append(element('p', { text: 'Nenhuma comparação cadastrada no backend.' }));
    state.comparisons.forEach((item) => {
      const card = element('article', { className: 'record-card comparison-card' });
      const pair = element('div', { className: 'comparison-thumbs' });
      const before = assetById(item.before_asset_id);
      const after = assetById(item.after_asset_id);
      if (before) pair.append(imageFor(before, 'record-thumb'));
      if (after) pair.append(imageFor(after, 'record-thumb'));
      card.append(pair);
      const content = element('div');
      content.append(element('h3', { text: item.title }), element('p', { text: item.description || item.service_name }), element('p', { className: 'meta', text: `${item.service_name} · Ordem ${item.sort_order} · ${item.published ? 'Publicada' : 'Oculta'} · Simulação gráfica` }));
      const actions = element('div', { className: 'button-row' });
      actions.append(actionButton('Editar', () => editComparison(item), true), actionButton('Remover', async () => {
        if (confirm(`Remover a comparação “${item.title}”? As duas imagens continuarão na biblioteca.`)) await run(() => service.deleteComparison(item.id), 'Comparação removida.');
      }));
      content.append(actions);
      card.append(content);
      list.append(card);
    });
  }

  function editComparison(item) {
    const form = $('#comparison-form');
    form.elements.id.value = item.id;
    form.elements.title.value = item.title;
    form.elements.serviceName.value = item.service_name;
    form.elements.description.value = item.description;
    form.elements.order.value = item.sort_order;
    form.elements.published.checked = item.published;
    form.elements.beforeId.value = item.before_asset_id;
    form.elements.afterId.value = item.after_asset_id;
    $('#comparison-cancel').hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.title.focus();
  }

  function resetComparison() {
    const form = $('#comparison-form');
    form.reset();
    form.elements.id.value = '';
    form.elements.order.value = Math.max(1, state.comparisons.length + 1);
    $('#comparison-cancel').hidden = true;
  }

  function renderLibrary() {
    const list = $('#media-list');
    list.replaceChildren();
    if (!state.assets.length) list.append(element('p', { text: 'A biblioteca está vazia.' }));
    state.assets.forEach((asset) => {
      const card = element('article', { className: 'media-card' });
      card.append(imageFor(asset));
      const uses = references(asset.id);
      const usage = element('p', { text: uses.length ? `Em uso: ${uses.join(', ')}` : 'Arquivo órfão: pode ser excluído após conferência.' });
      usage.id = `usage-${asset.id}`;
      card.append(element('h3', { text: asset.alt_text }), element('p', { className: 'meta', text: asset.storage_path }), usage, element('p', { className: 'meta', text: asset.public_visible ? 'Metadados públicos' : 'Metadados ocultos; a URL do arquivo continua pública' }));
      const actions = element('div', { className: 'button-row' });
      actions.append(actionButton(asset.public_visible ? 'Ocultar metadados' : 'Publicar metadados', () => run(() => service.updateAssetVisibility(asset.id, !asset.public_visible), 'Visibilidade atualizada.'), true));
      const remove = actionButton('Excluir arquivo', async () => {
        if (uses.length) { announce(`Exclusão bloqueada. Em uso por: ${uses.join(', ')}.`, true); return; }
        if (confirm(`Excluir definitivamente “${asset.alt_text}”? O histórico do Storage não é uma lixeira.`)) await run(() => service.deleteAsset(asset), 'Imagem excluída da biblioteca.');
      });
      if (uses.length) remove.setAttribute('aria-describedby', `usage-${asset.id}`);
      actions.append(remove);
      card.append(actions);
      list.append(card);
    });
  }

  function render() {
    fillMediaSelects();
    renderHero();
    renderServices();
    renderComparisons();
    renderLibrary();
  }

  async function refresh() {
    state = await service.loadAll();
    render();
  }

  async function optionalUpload(form, names, prefix) {
    const file = form.elements[names.file].files[0];
    if (!file) return form.elements[names.asset].value;
    const asset = await service.uploadAsset({ file, altText: form.elements[names.alt].value, prefix, publicVisible: true });
    return asset.id;
  }

  function bind() {
    $('#hero-preview').addEventListener('error', (event) => {
      event.currentTarget.hidden = true;
      $('#hero-caption').textContent = 'Imagem indisponível. O cadastro foi mantido para correção.';
    });
    $('#hero-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      run(() => service.saveHero({ assetId: form.elements.assetId.value, visible: form.elements.visible.checked }), 'Foto principal atualizada.');
    });
    $('#hero-asset').addEventListener('change', () => {
      const asset = assetById($('#hero-asset').value);
      const preview = $('#hero-preview');
      preview.hidden = !asset;
      if (asset) { preview.src = service.publicUrl(asset); preview.alt = asset.alt_text; $('#hero-caption').textContent = asset.alt_text; }
    });
    $('#hero-upload-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      run(async () => {
        const asset = await service.uploadAsset({ file: form.elements.file.files[0], altText: form.elements.altText.value, prefix: 'hero', publicVisible: true });
        try { await service.saveHero({ assetId: asset.id, visible: true }); }
        catch { throw new AdminDataError('A imagem foi enviada, mas não pôde ser vinculada. Ela permanece como arquivo órfão na biblioteca para nova tentativa ou exclusão.'); }
        form.reset();
      }, 'Nova foto principal enviada e publicada. A imagem anterior permanece na biblioteca.');
    });
    $('#service-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      run(async () => {
        const uploaded = Boolean(form.elements.file.files[0]);
        const assetId = await optionalUpload(form, { file: 'file', alt: 'altText', asset: 'assetId' }, 'services');
        try { await service.saveService({ id: form.elements.id.value, title: form.elements.title.value, description: form.elements.description.value, order: form.elements.order.value, visible: form.elements.visible.checked, assetId }); }
        catch (error) {
          if (uploaded) throw new AdminDataError(`O serviço não foi salvo e a nova imagem ficou órfã na biblioteca. ${error.message}`);
          throw error;
        }
        resetService();
      }, 'Serviço salvo. Imagens substituídas permanecem na biblioteca para exclusão segura.');
    });
    $('#service-cancel').addEventListener('click', resetService);
    $('#comparison-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      run(async () => {
        const uploaded = Boolean(form.elements.beforeFile.files[0] || form.elements.afterFile.files[0]);
        for (const [fileName, altName] of [['beforeFile', 'beforeAlt'], ['afterFile', 'afterAlt']]) {
          const file = form.elements[fileName].files[0];
          if (file) { validateImage(file); validateAltText(form.elements[altName].value); }
        }
        let beforeId;
        let afterId;
        try {
          beforeId = await optionalUpload(form, { file: 'beforeFile', alt: 'beforeAlt', asset: 'beforeId' }, 'comparisons');
          afterId = await optionalUpload(form, { file: 'afterFile', alt: 'afterAlt', asset: 'afterId' }, 'comparisons');
        } catch (error) {
          if (beforeId && form.elements.beforeFile.files[0]) throw new AdminDataError(`O primeiro arquivo foi enviado e ficou órfão porque o segundo falhou. ${error.message}`);
          throw error;
        }
        try { await service.saveComparison({ id: form.elements.id.value, title: form.elements.title.value, serviceName: form.elements.serviceName.value, description: form.elements.description.value, order: form.elements.order.value, published: form.elements.published.checked, beforeId, afterId }); }
        catch (error) {
          if (uploaded) throw new AdminDataError(`A comparação não foi salva. Imagens novas permanecem como arquivos órfãos na biblioteca. ${error.message}`);
          throw error;
        }
        resetComparison();
      }, 'Comparação salva como simulação gráfica.');
    });
    $('#comparison-cancel').addEventListener('click', resetComparison);
    $('#library-upload-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      run(async () => {
        await service.uploadAsset({ file: form.elements.file.files[0], altText: form.elements.altText.value, prefix: form.elements.prefix.value, publicVisible: form.elements.publicVisible.checked });
        form.reset(); form.elements.publicVisible.checked = true;
      }, 'Imagem enviada para a biblioteca.');
    });
    $('#refresh-button').addEventListener('click', () => run(async () => {}, 'Dados atualizados.'));
  }

  bind();
  return { refresh };
}
