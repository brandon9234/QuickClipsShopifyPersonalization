(() => {
  const WRAPPER_SELECTOR = '#engraving-fields-wrapper';
  const MOUNT_FLAG = 'engravingPreviewMounted';
  const STYLE_KEYS = ['style-1', 'style-2', 'style-3', 'custom'];
  const STYLE_META = {
    'style-1': { label: 'Style 1', matcher: /style\s*1/i },
    'style-2': { label: 'Style 2', matcher: /style\s*2/i },
    'style-3': { label: 'Style 3', matcher: /style\s*3/i },
    custom: { label: 'Custom', matcher: /style\s*4|your own design|custom/i },
  };
  const DEFAULT_PREVIEW_IMAGE_FILE = 'quickclips-engraving-blank.png';
  let instanceCounter = 0;

  function sanitize(line, maxLength = 40) {
    return String(line || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  function getPreviewImageUrl() {
    const runtimeUrl = typeof window !== 'undefined' ? window.QUICKCLIPS_ENGRAVING_PREVIEW_IMAGE_URL : '';
    const normalizedRuntime = String(runtimeUrl || '').trim();
    if (normalizedRuntime) return normalizedRuntime;

    const rootPath =
      typeof window !== 'undefined' && window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root
        : '/';
    return `${rootPath}assets/${DEFAULT_PREVIEW_IMAGE_FILE}?cb=${Date.now()}`;
  }

  function toIsoDate(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return raw;

    const usMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!usMatch) return '';

    const month = usMatch[1].padStart(2, '0');
    const day = usMatch[2].padStart(2, '0');
    const year = usMatch[3];
    return `${year}-${month}-${day}`;
  }

  function toDisplayDate(value) {
    const iso = toIsoDate(value);
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${month}-${day}-${year}`;
  }

  function isCustomEngravingSelected(root) {
    if (root.classList.contains('active')) return true;
    const form = root.closest('form') || document;
    const selected = form.querySelector('.product-form__input input[type="radio"]:checked');
    return selected ? /custom engraving/i.test(selected.value || '') : false;
  }

  function findStyleOption(styleSelect, styleKey) {
    if (!styleSelect) return null;
    const matcher = STYLE_META[styleKey].matcher;
    return Array.from(styleSelect.options).find((option) => {
      const sample = `${option.textContent || ''} ${option.value || ''}`;
      return matcher.test(sample);
    });
  }

  function getStyleFromSelect(styleSelect) {
    if (!styleSelect) return 'style-1';
    const selected = styleSelect.options[styleSelect.selectedIndex];
    const sample = `${selected?.textContent || ''} ${selected?.value || ''}`;
    if (STYLE_META.custom.matcher.test(sample)) return 'custom';
    if (STYLE_META['style-3'].matcher.test(sample)) return 'style-3';
    if (STYLE_META['style-2'].matcher.test(sample)) return 'style-2';
    return 'style-1';
  }

  function syncStyleSelect(state) {
    if (!state.styleSelect) return;
    const option = findStyleOption(state.styleSelect, state.activeStyle);
    if (!option || state.styleSelect.value === option.value) return;
    state.styleSelect.value = option.value;
    state.styleSelect.dispatchEvent(new Event('input', { bubbles: true }));
    state.styleSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncInputsFromTextarea(state) {
    const raw = String(state.textarea.value || '').trim();
    if (!raw) return;

    const customPrefix = /^custom request:\s*/i;
    if (customPrefix.test(raw)) {
      state.customInput.value = raw.replace(customPrefix, '');
      return;
    }

    const lines = raw.split(/\r?\n/);
    state.nameInput.value = sanitize(lines[0] || '', 30);
    state.dateInput.value = toIsoDate(lines.slice(1).join(' '));
  }

  function writeToTextarea(state) {
    let payload = '';
    if (state.activeStyle === 'custom') {
      const message = sanitize(state.customInput.value, 350);
      payload = message ? `Custom Request: ${message}` : '';
    } else {
      const line1 = sanitize(state.nameInput.value, 30);
      const line2 = toDisplayDate(state.dateInput.value);
      payload = [line1, line2].filter(Boolean).join('\n');
    }

    if (state.textarea.value !== payload) {
      state.textarea.value = payload;
      state.textarea.dispatchEvent(new Event('input', { bubbles: true }));
      state.textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return payload;
  }

  function updateButtons(state) {
    STYLE_KEYS.forEach((styleKey) => {
      const button = state.styleButtons[styleKey];
      if (!button) return;
      const isActive = state.activeStyle === styleKey;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function updatePreview(state) {
    const isEnabled = isCustomEngravingSelected(state.root);
    state.panel.hidden = !isEnabled;
    if (!isEnabled) return;

    updateButtons(state);
    const isCustomStyle = state.activeStyle === 'custom';
    state.standardFields.hidden = isCustomStyle;
    state.customField.hidden = !isCustomStyle;
    state.canvas.hidden = isCustomStyle;

    writeToTextarea(state);
    syncStyleSelect(state);

    if (isCustomStyle) return;

    const line1 = sanitize(state.nameInput.value, 30);
    const line2 = toDisplayDate(state.dateInput.value);
    state.line1Preview.textContent = line1 || 'Your text here';
    state.line2Preview.textContent = line2;
    state.line2Preview.style.display = line2 ? 'block' : 'none';

    state.canvas.classList.remove('style-1', 'style-2', 'style-3', 'style-4');
    state.canvas.classList.add(state.activeStyle === 'custom' ? 'style-4' : state.activeStyle);
  }

  function buildPanel(instanceId) {
    const nameId = `${instanceId}-name`;
    const dateId = `${instanceId}-date`;
    const customId = `${instanceId}-custom`;
    const panel = document.createElement('fieldset');
    panel.className = 'product-form__input engraving-preview-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <legend class="form__label">Custom engraving options</legend>
      <div class="engraving-style-bar" role="tablist" aria-label="Engraving style selector">
        <button type="button" class="engraving-style-btn" data-engraving-style-btn="style-1" aria-pressed="false">${STYLE_META['style-1'].label}</button>
        <button type="button" class="engraving-style-btn" data-engraving-style-btn="style-2" aria-pressed="false">${STYLE_META['style-2'].label}</button>
        <button type="button" class="engraving-style-btn" data-engraving-style-btn="style-3" aria-pressed="false">${STYLE_META['style-3'].label}</button>
        <button type="button" class="engraving-style-btn" data-engraving-style-btn="custom" aria-pressed="false">${STYLE_META.custom.label}</button>
      </div>

      <div class="engraving-preview-grid" data-engraving-standard-fields>
        <label class="form__label" for="${nameId}">First and Last Name</label>
        <input id="${nameId}" data-engraving-field="name" type="text" autocomplete="name" maxlength="30" placeholder="Ex: Robert + Caleigh">
        <label class="form__label" for="${dateId}">Date</label>
        <input id="${dateId}" data-engraving-field="date" type="date" autocomplete="off">
        <div class="engraving-preview-canvas style-1" data-engraving-canvas aria-live="polite">
          <img class="engraving-preview-image" alt="" hidden>
          <div class="engraving-preview-text">
            <span class="engraving-preview-text-line engraving-preview-text-line--1" data-preview-line="1">Your text here</span>
            <span class="engraving-preview-text-line engraving-preview-text-line--2" data-preview-line="2" style="display:none;"></span>
          </div>
        </div>
      </div>

      <div class="engraving-custom-chat" data-engraving-custom-field hidden>
        <label class="form__label" for="${customId}">Tell us your custom engraving idea</label>
        <textarea id="${customId}" data-engraving-field="custom" rows="4" maxlength="350" placeholder="Ex: Please engrave our own logo centered on the plate and include 02-20-2026 below it."></textarea>
      </div>
    `;
    return panel;
  }

  function mount(wrapper) {
    if (wrapper.dataset[MOUNT_FLAG] === 'true') return;

    const textarea = wrapper.querySelector('.custom-text-input');
    if (!textarea) return;

    const styleSelect = wrapper.querySelector('[data-engraving-style-select]');
    const styleFieldset = styleSelect ? styleSelect.closest('fieldset') : null;
    if (styleFieldset) styleFieldset.style.display = 'none';

    const textFieldset = textarea.closest('fieldset');
    if (textFieldset) textFieldset.style.display = 'none';

    const panel = buildPanel(`engraving-preview-${++instanceCounter}`);
    if (textFieldset && textFieldset.parentNode) {
      textFieldset.insertAdjacentElement('afterend', panel);
    } else {
      wrapper.prepend(panel);
    }

    const canvas = panel.querySelector('[data-engraving-canvas]');
    const previewImage = panel.querySelector('.engraving-preview-image');
    const previewImageUrl = getPreviewImageUrl();
    if (previewImageUrl) {
      previewImage.src = previewImageUrl;
      previewImage.hidden = false;
      canvas.classList.add('has-image');
      previewImage.addEventListener('error', () => {
        previewImage.hidden = true;
        canvas.classList.remove('has-image');
      });
    }

    const styleButtons = {};
    STYLE_KEYS.forEach((styleKey) => {
      styleButtons[styleKey] = panel.querySelector(`[data-engraving-style-btn="${styleKey}"]`);
    });

    const state = {
      root: wrapper,
      panel,
      textarea,
      styleSelect,
      styleButtons,
      activeStyle: getStyleFromSelect(styleSelect),
      standardFields: panel.querySelector('[data-engraving-standard-fields]'),
      customField: panel.querySelector('[data-engraving-custom-field]'),
      customInput: panel.querySelector('[data-engraving-field="custom"]'),
      nameInput: panel.querySelector('[data-engraving-field="name"]'),
      dateInput: panel.querySelector('[data-engraving-field="date"]'),
      canvas,
      line1Preview: panel.querySelector('[data-preview-line="1"]'),
      line2Preview: panel.querySelector('[data-preview-line="2"]'),
    };

    syncInputsFromTextarea(state);

    const refresh = () => updatePreview(state);

    STYLE_KEYS.forEach((styleKey) => {
      const button = state.styleButtons[styleKey];
      if (!button) return;
      button.addEventListener('click', () => {
        state.activeStyle = styleKey;
        refresh();
      });
    });

    state.nameInput.addEventListener('input', refresh);
    state.dateInput.addEventListener('input', refresh);
    state.dateInput.addEventListener('change', refresh);
    state.customInput.addEventListener('input', refresh);

    state.textarea.addEventListener('input', () => {
      if (![state.nameInput, state.dateInput, state.customInput].includes(document.activeElement)) {
        syncInputsFromTextarea(state);
      }
      refresh();
    });

    if (styleSelect) {
      styleSelect.addEventListener('change', () => {
        state.activeStyle = getStyleFromSelect(styleSelect);
        refresh();
      });
    }

    const classWatcher = new MutationObserver(refresh);
    classWatcher.observe(wrapper, { attributes: true, attributeFilter: ['class'] });

    const form = wrapper.closest('form') || document;
    form.addEventListener('change', (event) => {
      const target = event.target;
      if (target && target.matches('.product-form__input input[type="radio"], .product-form__input button, select')) {
        window.setTimeout(refresh, 0);
      }
    });

    document.addEventListener('variant:change', () => window.setTimeout(refresh, 0));

    wrapper.dataset[MOUNT_FLAG] = 'true';
    refresh();
  }

  function mountAll(scope = document) {
    scope.querySelectorAll(WRAPPER_SELECTOR).forEach(mount);
  }

  function watchForInjectedMarkup() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches && node.matches(WRAPPER_SELECTOR)) {
            mount(node);
            continue;
          }
          if (node.querySelector) mountAll(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountAll();
      watchForInjectedMarkup();
    });
  } else {
    mountAll();
    watchForInjectedMarkup();
  }

  document.addEventListener('shopify:section:load', (event) => {
    if (event.target) mountAll(event.target);
  });
})();

