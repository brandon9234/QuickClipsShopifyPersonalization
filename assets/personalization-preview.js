(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_STYLE = 'Style 1';
  const STYLE_VALUES = ['Style 1', 'Style 2', 'Style 3'];
  const DEFAULT_LAST_NAME_MAX = 30;
  const DEFAULT_DATE_MAX = 10;
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = ['is-style-1', 'is-style-2', 'is-style-3'];
  const STYLE_FONT_PRESETS = {
    'Style 1': {
      nameFamily: '"Brush Script MT", "Segoe Script", cursive',
      dateFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
      nameSize: 62,
      dateSize: 40,
      boxWidth: 70,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
    },
    'Style 2': {
      nameFamily: 'Georgia, "Times New Roman", serif',
      dateFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
      nameSize: 58,
      dateSize: 38,
      boxWidth: 68,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
    },
    'Style 3': {
      nameFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
      dateFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
      nameSize: 54,
      dateSize: 36,
      boxWidth: 66,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
    },
  };

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const styleInputs = Array.from(modal.querySelectorAll('[data-personalization-input="style"]'));
  const lastNameInput = modal.querySelector('[data-personalization-input="lastName"]');
  const lastNameCount = modal.querySelector('[data-personalization-count="lastName"]');
  const dateInput = modal.querySelector('[data-personalization-input="date"]');
  const dateCount = modal.querySelector('[data-personalization-count="date"]');
  const clipSurface = modal.querySelector('[data-personalization-clip-surface]');
  const stageImageUrl = String(clipSurface?.dataset.personalizationStageImageUrl || '').trim();
  const stylePreviewImage = modal.querySelector('[data-personalization-style-preview-image]');
  const deterministicOverlay = modal.querySelector('[data-personalization-deterministic-overlay]');
  const deterministicLastName = modal.querySelector('[data-personalization-deterministic-last-name]');
  const deterministicDate = modal.querySelector('[data-personalization-deterministic-date]');
  const pickedPanel = modal.querySelector('[data-personalization-picked-panel]');
  const productName = modal.querySelector('[data-personalization-product-name]');
  const errorElement = modal.querySelector('[data-personalization-error]');
  const generateButton = modal.querySelector('[data-personalization-generate]');
  const generateButtonLabel = modal.querySelector('[data-personalization-generate-label]');
  const saveButton = modal.querySelector('[data-personalization-save]');
  const cancelButton = modal.querySelector('[data-personalization-cancel]');

  if (
    styleInputs.length === 0 ||
    !lastNameInput ||
    !lastNameCount ||
    !dateInput ||
    !dateCount ||
    !clipSurface ||
    !stylePreviewImage ||
    !deterministicOverlay ||
    !deterministicLastName ||
    !deterministicDate ||
    !pickedPanel ||
    !productName ||
    !errorElement ||
    !generateButton ||
    !saveButton ||
    !cancelButton
  ) {
    return;
  }

  const stateByScope = new Map();
  const styleImagePayloadCache = new Map();

  let activeScope = '';
  let activeLastNameMax = DEFAULT_LAST_NAME_MAX;
  let activeDateMax = DEFAULT_DATE_MAX;
  let isGenerating = false;
  let generationErrorMessage = '';
  let generatedImageData = '';
  const defaultGenerateButtonText = generateButtonLabel
    ? String(generateButtonLabel.textContent || '').trim() || 'Generate'
    : String(generateButton.textContent || '').trim() || 'Generate';

  function parseMaxLength(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
  }

  function parseBoundedNumber(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  }

  function normalizeStyle(value) {
    if (!value) return DEFAULT_STYLE;
    if (STYLE_VALUES.includes(value)) return value;
    return DEFAULT_STYLE;
  }

  function getStylePreset(styleValue) {
    const normalizedStyle = normalizeStyle(styleValue);
    return STYLE_FONT_PRESETS[normalizedStyle] || STYLE_FONT_PRESETS[DEFAULT_STYLE];
  }

  function selectorEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
  }

  function getApiUrls() {
    const urls = [];
    function addUrl(value) {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (!urls.includes(trimmed)) {
        urls.push(trimmed);
      }
    }

    const globalConfig = window.QuickClipsPersonalization;
    if (globalConfig && typeof globalConfig.apiUrl === 'string' && globalConfig.apiUrl.trim()) {
      addUrl(globalConfig.apiUrl);
    }

    if (globalConfig && Array.isArray(globalConfig.apiUrls)) {
      globalConfig.apiUrls.forEach(addUrl);
    }

    const modalConfig = modal.dataset.personalizationApiUrl;
    if (typeof modalConfig === 'string' && modalConfig.trim()) {
      addUrl(modalConfig);
    }

    const hasExplicitUrls = urls.length > 0;
    const pageProtocol = String(window.location.protocol || '').toLowerCase();
    const pageHost = String(window.location.hostname || '').toLowerCase();
    const isLocalHost = pageHost === 'localhost' || pageHost === '127.0.0.1' || pageHost === '::1';
    const allowHttpLocalhost = isLocalHost || pageProtocol === 'http:' || pageProtocol === 'file:';

    if (allowHttpLocalhost) {
      addUrl('http://localhost:8788/api/personalization-preview');
      addUrl('http://localhost:8788/preview');
      addUrl('http://localhost:8788/apps/quickclips-personalization/preview');
      if (!hasExplicitUrls) {
        return urls;
      }
    }

    if (hasExplicitUrls) {
      return urls;
    }

    addUrl('/preview');
    addUrl('/api/personalization-preview');
    addUrl(DEFAULT_API_PATH);

    return urls;
  }

  async function requestPreview(payload) {
    const urls = getApiUrls();
    const failures = [];

    for (const apiUrl of urls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorMessage =
            typeof json.error === 'string' && json.error ? json.error : `Request failed with status ${response.status}.`;
          failures.push(`${apiUrl}: ${errorMessage}`);
          continue;
        }

        return { apiUrl, json };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Request failed.';
        failures.push(`${apiUrl}: ${errorMessage}`);
      }
    }

    if (!failures.length) {
      throw new Error('No API endpoint configured for Gemini preview.');
    }

    throw new Error(failures.join(' | '));
  }

  function createDefaultState() {
    return {
      style: DEFAULT_STYLE,
      lastName: '',
      date: '',
      geminiSummary: '',
      generatedImage: '',
      previewOpened: true,
      maxLastName: DEFAULT_LAST_NAME_MAX,
      maxDate: DEFAULT_DATE_MAX,
    };
  }

  function getScopeState(scope) {
    if (!scope) return null;
    return stateByScope.get(scope) || null;
  }

  function setScopeState(scope, nextState) {
    if (!scope) return;
    const currentState = getScopeState(scope) || createDefaultState();

    stateByScope.set(scope, {
      style: normalizeStyle(nextState.style || currentState.style),
      lastName: String(nextState.lastName ?? currentState.lastName ?? '').trim(),
      date: String(nextState.date ?? currentState.date ?? '').trim(),
      geminiSummary: String(nextState.geminiSummary ?? currentState.geminiSummary ?? '').trim(),
      generatedImage: String(nextState.generatedImage ?? currentState.generatedImage ?? '').trim(),
      previewOpened: Boolean(nextState.previewOpened ?? currentState.previewOpened),
      maxLastName: parseMaxLength(nextState.maxLastName ?? currentState.maxLastName, DEFAULT_LAST_NAME_MAX),
      maxDate: parseMaxLength(nextState.maxDate ?? currentState.maxDate, DEFAULT_DATE_MAX),
    });
  }

  function setError(message) {
    if (!message) {
      errorElement.setAttribute('hidden', '');
      errorElement.textContent = '';
      return;
    }

    errorElement.removeAttribute('hidden');
    errorElement.textContent = message;
  }

  function setGenerationError(message) {
    generationErrorMessage = String(message || '').trim();
  }

  function setGenerateButtonLoading(loading) {
    const isLoading = Boolean(loading);
    generateButton.classList.toggle('is-loading', isLoading);
    generateButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');

    if (generateButtonLabel) {
      generateButtonLabel.textContent = isLoading ? 'Generating' : defaultGenerateButtonText;
      return;
    }

    generateButton.textContent = isLoading ? 'Generating...' : defaultGenerateButtonText;
  }

  function getSelectedStyle() {
    const checkedInput = styleInputs.find((input) => input.checked);
    return normalizeStyle(checkedInput ? checkedInput.value : DEFAULT_STYLE);
  }

  function setSelectedStyle(styleValue) {
    const normalizedStyle = normalizeStyle(styleValue);
    styleInputs.forEach((input) => {
      input.checked = input.value === normalizedStyle;
    });
  }

  function getClipStyleClass(styleValue) {
    switch (styleValue) {
      case 'Style 2':
        return 'is-style-2';
      case 'Style 3':
        return 'is-style-3';
      default:
        return 'is-style-1';
    }
  }

  function getStyleImageUrl(styleValue) {
    if (stageImageUrl) {
      return stageImageUrl;
    }

    const normalizedStyle = normalizeStyle(styleValue);
    const matchingInput = styleInputs.find((input) => normalizeStyle(input.value) === normalizedStyle);
    if (!matchingInput) return '';

    const option = matchingInput.closest('.personalization-preview-modal__style-option');
    if (!option) return '';

    const image = option.querySelector('.personalization-preview-modal__style-option-image');
    if (!image) return '';

    return image.currentSrc || image.getAttribute('src') || '';
  }

  function setWorkspaceStyleImage(styleValue) {
    const styleImageUrl = getStyleImageUrl(styleValue);
    if (!styleImageUrl) {
      clipSurface.style.setProperty('--quickclip-style-image', 'none');
      stylePreviewImage.setAttribute('hidden', '');
      stylePreviewImage.removeAttribute('src');
      return;
    }

    clipSurface.style.setProperty('--quickclip-style-image', `url("${styleImageUrl.replace(/"/g, '\\"')}")`);
    stylePreviewImage.src = styleImageUrl;
    stylePreviewImage.removeAttribute('hidden');
  }

  function setGeneratedImage(dataUrl) {
    generatedImageData = String(dataUrl || '').trim();
  }

  function getGeneratedImageData() {
    return generatedImageData;
  }

  function resolveGeneratedImageDataUrl(responseJson) {
    const directDataUrl =
      responseJson && typeof responseJson.generatedImageDataUrl === 'string'
        ? responseJson.generatedImageDataUrl.trim()
        : '';
    if (directDataUrl.startsWith('data:image/')) {
      return directDataUrl;
    }

    const generatedImage =
      responseJson && responseJson.generatedImage && typeof responseJson.generatedImage === 'object'
        ? responseJson.generatedImage
        : null;
    if (!generatedImage) return '';

    const mimeType =
      typeof generatedImage.mimeType === 'string' ? generatedImage.mimeType.trim().toLowerCase() : '';
    const data = typeof generatedImage.data === 'string' ? generatedImage.data.trim().replace(/\s+/g, '') : '';
    if (!mimeType.startsWith('image/') || !data) return '';

    return `data:${mimeType};base64,${data}`;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Image conversion failed.'));
      };
      reader.onerror = () => reject(new Error('Image conversion failed.'));
      reader.readAsDataURL(blob);
    });
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not load style image for context generation.'));
      image.src = source;
    });
  }

  async function getStyleImagePayload(styleValue) {
    const normalizedStyle = normalizeStyle(styleValue);
    if (styleImagePayloadCache.has(normalizedStyle)) {
      return styleImagePayloadCache.get(normalizedStyle) || null;
    }

    const styleImageUrl = getStyleImageUrl(normalizedStyle);
    if (!styleImageUrl) return null;

    try {
      const response = await fetch(styleImageUrl, { cache: 'force-cache' });
      if (!response.ok) return null;

      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      if (!base64Data) return null;

      const payload = {
        mimeType: blob.type || 'image/jpeg',
        data: base64Data,
        url: styleImageUrl,
        dataUrl,
      };
      styleImagePayloadCache.set(normalizedStyle, payload);
      return payload;
    } catch (error) {
      return null;
    }
  }

  function drawFittedText(ctx, text, options) {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) return;

    let fontSize = options.fontSize;
    while (fontSize > options.minSize) {
      ctx.font = `${options.fontWeight || '600'} ${fontSize}px ${options.fontFamily}`;
      if (ctx.measureText(trimmedText).width <= options.maxWidth) break;
      fontSize -= 1;
    }

    ctx.font = `${options.fontWeight || '600'} ${fontSize}px ${options.fontFamily}`;
    ctx.fillText(trimmedText, options.x, options.y);
  }

  async function buildDeterministicContextImagePayload(styleValue, styleImagePayload, lastNameValue, dateValue) {
    if (!styleImagePayload || !styleImagePayload.dataUrl) return null;

    const stylePreset = getStylePreset(styleValue);
    const image = await loadImage(styleImagePayload.dataUrl);

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.52;
    const rotation = (stylePreset.rotation * Math.PI) / 180;
    const maxTextWidth = width * 0.45;
    const lineGap = Math.max(28, Math.round(height * 0.065));

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = stylePreset.color;

    drawFittedText(ctx, lastNameValue, {
      x: 0,
      y: -lineGap / 2,
      maxWidth: maxTextWidth,
      minSize: 22,
      fontSize: Math.max(28, Math.round((width / 1000) * stylePreset.nameSize)),
      fontFamily: stylePreset.nameFamily,
      fontWeight: '600',
    });

    drawFittedText(ctx, dateValue, {
      x: 0,
      y: lineGap / 2,
      maxWidth: maxTextWidth,
      minSize: 18,
      fontSize: Math.max(22, Math.round((width / 1000) * stylePreset.dateSize)),
      fontFamily: stylePreset.dateFamily,
      fontWeight: stylePreset.dateWeight || '600',
    });

    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    const data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
    if (!data) return null;

    return {
      mimeType: 'image/png',
      data,
      url: 'context://deterministic-stage',
      dataUrl,
    };
  }

  function getGeneratedSummary() {
    return '';
  }

  function getValidationError(options = {}) {
    const requireAll = Boolean(options.requireAll);
    const lastNameValue = lastNameInput.value.trim();
    const dateValue = dateInput.value.trim();

    if (lastNameValue.length > activeLastNameMax) {
      return `Last name must be ${activeLastNameMax} characters or fewer.`;
    }
    if (dateValue.length > activeDateMax) {
      return `Date must be ${activeDateMax} characters or fewer.`;
    }

    if (requireAll) {
      if (!lastNameValue) return 'Last name is required before generating a preview.';
      if (!dateValue) return 'Date is required before generating a preview.';
    }

    return '';
  }

  function setPickedPanelVisible(visible) {
    pickedPanel.toggleAttribute('hidden', !visible);
  }

  function renderDeterministicOverlay() {
    const existingGeneratedImage = getGeneratedImageData();
    if (existingGeneratedImage) {
      deterministicOverlay.setAttribute('hidden', '');
      return;
    }

    const selectedStyle = getSelectedStyle();
    const stylePreset = getStylePreset(selectedStyle);
    const surfaceWidth = Math.max(320, clipSurface.clientWidth || 0);
    const scale = Math.min(1, Math.max(0.55, surfaceWidth / 620));
    const nameSize = parseBoundedNumber(Math.round(stylePreset.nameSize * scale), stylePreset.nameSize, 24, 92);
    const dateSize = parseBoundedNumber(Math.round(stylePreset.dateSize * scale), stylePreset.dateSize, 18, 72);

    deterministicOverlay.removeAttribute('hidden');
    deterministicOverlay.style.setProperty('--deterministic-rotation', `${stylePreset.rotation}deg`);
    deterministicOverlay.style.setProperty('--deterministic-width', `${stylePreset.boxWidth}%`);

    deterministicLastName.textContent = lastNameInput.value.trim() || ' ';
    deterministicDate.textContent = dateInput.value.trim() || ' ';

    deterministicLastName.style.setProperty('font-family', stylePreset.nameFamily);
    deterministicLastName.style.setProperty('font-size', `${nameSize}px`);
    deterministicLastName.style.setProperty('color', stylePreset.color);

    deterministicDate.style.setProperty('font-family', stylePreset.dateFamily);
    deterministicDate.style.setProperty('font-size', `${dateSize}px`);
    deterministicDate.style.setProperty('font-weight', stylePreset.dateWeight || '600');
    deterministicDate.style.setProperty('color', stylePreset.color);
  }

  function renderClipStyle() {
    const selectedStyle = getSelectedStyle();
    const styleClass = getClipStyleClass(selectedStyle);
    clipSurface.classList.remove(...CLIP_STYLE_CLASSES);
    clipSurface.classList.add(styleClass);

    const existingGeneratedImage = getGeneratedImageData();
    if (existingGeneratedImage) {
      clipSurface.style.setProperty('--quickclip-style-image', 'none');
      stylePreviewImage.src = existingGeneratedImage;
      stylePreviewImage.removeAttribute('hidden');
      renderDeterministicOverlay();
      return;
    }

    setWorkspaceStyleImage(selectedStyle);
    renderDeterministicOverlay();
  }

  function renderEditorState() {
    lastNameCount.textContent = `${lastNameInput.value.length}/${activeLastNameMax}`;
    dateCount.textContent = `${dateInput.value.length}/${activeDateMax}`;

    clipSurface.classList.toggle('is-generating', isGenerating);
    setPickedPanelVisible(true);
    renderClipStyle();

    const validationError = getValidationError();
    const hasError = Boolean(validationError);
    if (!isGenerating) {
      if (validationError) {
        setError(validationError);
      } else if (generationErrorMessage) {
        setError(generationErrorMessage);
      } else {
        setError('');
      }
    }

    setGenerateButtonLoading(isGenerating);
    generateButton.disabled = isGenerating || hasError;
    saveButton.disabled = isGenerating || hasError;
  }

  function applyStateToContext(context, state) {
    const primaryProperty = context.querySelector('[data-personalization-property="primary"]');
    const secondaryProperty = context.querySelector('[data-personalization-property="secondary"]');
    const styleProperty = context.querySelector('[data-personalization-property="style"]');
    const name1Property = context.querySelector('[data-personalization-property="name1"]');
    const name2Property = context.querySelector('[data-personalization-property="name2"]');
    const dateProperty = context.querySelector('[data-personalization-property="date"]');
    const modeProperty = context.querySelector('[data-personalization-property="mode"]');
    const deterministicTextProperty = context.querySelector('[data-personalization-property="deterministic_text"]');
    const deterministicFontProperty = context.querySelector('[data-personalization-property="deterministic_font"]');
    const deterministicSizeProperty = context.querySelector('[data-personalization-property="deterministic_size"]');
    const deterministicBoxWidthProperty = context.querySelector('[data-personalization-property="deterministic_box_width"]');
    const geminiSummaryProperty = context.querySelector('[data-personalization-property="gemini_summary"]');
    const scopeProperty = context.querySelector('[data-personalization-property="scope"]');
    const stylePreset = getStylePreset(state.style || DEFAULT_STYLE);

    if (primaryProperty) primaryProperty.value = state.lastName || '';
    if (secondaryProperty) secondaryProperty.value = '';
    if (styleProperty) styleProperty.value = state.style || DEFAULT_STYLE;
    if (name1Property) name1Property.value = state.lastName || '';
    if (name2Property) name2Property.value = '';
    if (dateProperty) dateProperty.value = state.date || '';
    if (modeProperty) modeProperty.value = 'deterministic';
    if (deterministicTextProperty) {
      deterministicTextProperty.value = `${state.lastName || ''}${state.date ? ` | ${state.date}` : ''}`.trim();
    }
    if (deterministicFontProperty) deterministicFontProperty.value = state.style || DEFAULT_STYLE;
    if (deterministicSizeProperty) deterministicSizeProperty.value = String(stylePreset.nameSize);
    if (deterministicBoxWidthProperty) deterministicBoxWidthProperty.value = String(stylePreset.boxWidth);
    if (geminiSummaryProperty) geminiSummaryProperty.value = state.geminiSummary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
  }

  function isConfiguredState(state) {
    if (!state) return false;
    return Boolean(state.lastName || state.date || state.geminiSummary || state.generatedImage);
  }

  function updateTriggerLabels(scope) {
    if (!scope) return;

    const state = getScopeState(scope);
    const escapedScope = selectorEscape(scope);
    const triggers = document.querySelectorAll(
      `[data-personalization-trigger][data-personalization-scope="${escapedScope}"]`
    );

    triggers.forEach((trigger) => {
      const labelNode = trigger.querySelector('[data-personalization-trigger-label]');
      if (!labelNode) return;

      const defaultLabel = trigger.dataset.personalizationDefaultLabel || 'Customize Now';
      if (isConfiguredState(state)) {
        labelNode.textContent = 'Edit Customization';
        trigger.classList.add('is-configured');
      } else {
        labelNode.textContent = defaultLabel;
        trigger.classList.remove('is-configured');
      }
    });
  }

  function syncScope(scope) {
    if (!scope) return;

    const state = getScopeState(scope) || createDefaultState();
    const escapedScope = selectorEscape(scope);
    const contexts = document.querySelectorAll(
      `[data-personalization-context][data-personalization-scope="${escapedScope}"]`
    );
    contexts.forEach((context) => applyStateToContext(context, state));
    updateTriggerLabels(scope);
  }

  function resolveContextScope(context) {
    const quickAddModal = context.closest('quick-add-modal[data-personalization-scope]');
    if (quickAddModal && quickAddModal.dataset.personalizationScope) {
      context.dataset.personalizationScope = quickAddModal.dataset.personalizationScope;
      if (quickAddModal.dataset.personalizationProductId) {
        context.dataset.personalizationProductId = quickAddModal.dataset.personalizationProductId;
      }
    }

    return context.dataset.personalizationScope || '';
  }

  function inheritScopeForFormTriggers(form, scope) {
    if (!form || !scope) return;
    form.querySelectorAll('[data-personalization-trigger]').forEach((trigger) => {
      trigger.dataset.personalizationScope = scope;
    });
  }

  function hydrateContext(context) {
    const scope = resolveContextScope(context);
    if (!scope) return;

    const form = context.closest('form');
    inheritScopeForFormTriggers(form, scope);

    const existingState = getScopeState(scope);
    if (!existingState) {
      setScopeState(scope, {
        style:
          (context.querySelector('[data-personalization-property="style"]') || {}).value || DEFAULT_STYLE,
        lastName:
          (context.querySelector('[data-personalization-property="name1"]') || {}).value ||
          (context.querySelector('[data-personalization-property="primary"]') || {}).value ||
          '',
        date: (context.querySelector('[data-personalization-property="date"]') || {}).value || '',
        geminiSummary: (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '',
        generatedImage: '',
        maxLastName: DEFAULT_LAST_NAME_MAX,
        maxDate: DEFAULT_DATE_MAX,
      });
    }

    syncScope(scope);
  }

  function hydrateContexts(root) {
    root.querySelectorAll('[data-personalization-context]').forEach((context) => {
      hydrateContext(context);
    });
  }

  function openEditor(trigger) {
    activeScope = trigger.dataset.personalizationScope || '';
    if (!activeScope) return;

    const existingState = getScopeState(activeScope) || createDefaultState();
    activeLastNameMax = parseMaxLength(
      trigger.dataset.personalizationPrimaryMax,
      existingState.maxLastName || DEFAULT_LAST_NAME_MAX
    );
    activeDateMax = parseMaxLength(trigger.dataset.personalizationDateMax, existingState.maxDate || DEFAULT_DATE_MAX);

    lastNameInput.maxLength = activeLastNameMax;
    dateInput.maxLength = activeDateMax;

    const productTitle = trigger.dataset.personalizationProductTitle || '';
    productName.textContent = productTitle;
    productName.toggleAttribute('hidden', !productTitle);

    setSelectedStyle(existingState.style || DEFAULT_STYLE);
    lastNameInput.value = existingState.lastName || '';
    dateInput.value = existingState.date || '';
    setGeneratedImage(existingState.generatedImage || '');
    setPickedPanelVisible(true);
    setGenerationError('');
    isGenerating = false;
    renderEditorState();

    if (typeof modal.show === 'function') {
      modal.show(trigger);
    } else {
      modal.setAttribute('open', '');
    }
  }

  function closeEditor() {
    if (typeof modal.hide === 'function') {
      modal.hide();
    } else {
      modal.removeAttribute('open');
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-personalization-trigger]');
    if (!trigger) return;

    event.preventDefault();
    openEditor(trigger);
  });

  styleInputs.forEach((input) => {
    input.addEventListener('change', () => {
      setGeneratedImage('');
      setGenerationError('');
      renderEditorState();
    });
  });
  lastNameInput.addEventListener('input', () => {
    setGenerationError('');
    renderEditorState();
  });
  dateInput.addEventListener('input', () => {
    setGenerationError('');
    renderEditorState();
  });

  function commitActiveState(closeModal) {
    if (!activeScope) return false;

    const error = getValidationError();
    if (error) {
      setError(error);
      return false;
    }

    setScopeState(activeScope, {
      style: getSelectedStyle(),
      lastName: lastNameInput.value.trim(),
      date: dateInput.value.trim(),
      geminiSummary: getGeneratedSummary(),
      generatedImage: getGeneratedImageData(),
      previewOpened: true,
      maxLastName: activeLastNameMax,
      maxDate: activeDateMax,
    });

    syncScope(activeScope);

    if (closeModal) {
      closeEditor();
    }

    return true;
  }

  async function generatePreview() {
    if (!activeScope || isGenerating) return;

    const blockingError = getValidationError({ requireAll: true });
    if (blockingError) {
      setError(blockingError);
      return;
    }

    const previousGeneratedImage = getGeneratedImageData();
    setPickedPanelVisible(true);
    isGenerating = true;
    setGenerationError('');
    setError('');
    renderEditorState();

    const selectedStyle = getSelectedStyle();
    const payload = {
      style: selectedStyle,
      lastName: lastNameInput.value.trim(),
      date: dateInput.value.trim(),
    };

    try {
      const styleImagePayload = await getStyleImagePayload(selectedStyle);
      if (!styleImagePayload) {
        throw new Error('Style image is required for preview generation.');
      }

      const contextImagePayload = await buildDeterministicContextImagePayload(
        selectedStyle,
        styleImagePayload,
        payload.lastName,
        payload.date
      );

      if (!contextImagePayload) {
        throw new Error('Could not build deterministic context image.');
      }

      payload.styleImage = {
        mimeType: styleImagePayload.mimeType,
        data: styleImagePayload.data,
        url: styleImagePayload.url,
      };
      payload.contextImage = {
        mimeType: contextImagePayload.mimeType,
        data: contextImagePayload.data,
        url: contextImagePayload.url,
      };

      const { json } = await requestPreview(payload);
      const generatedImageData = resolveGeneratedImageDataUrl(json);
      if (!generatedImageData) {
        throw new Error('Gemini did not return an edited preview image.');
      }

      setGeneratedImage(generatedImageData);
      setGenerationError('');

      setScopeState(activeScope, {
        style: payload.style,
        lastName: payload.lastName,
        date: payload.date,
        geminiSummary: '',
        generatedImage: generatedImageData,
        previewOpened: true,
        maxLastName: activeLastNameMax,
        maxDate: activeDateMax,
      });
      syncScope(activeScope);
    } catch (error) {
      setGeneratedImage(previousGeneratedImage);
      const errorMessage = error instanceof Error ? error.message : 'Could not generate preview.';
      const normalizedErrorMessage = errorMessage.toLowerCase();
      const singleFailure = !normalizedErrorMessage.includes(' | ');
      const appProxyNotFound =
        singleFailure &&
        normalizedErrorMessage.includes('/apps/quickclips-personalization/preview') &&
        normalizedErrorMessage.includes('status 404');
      if (normalizedErrorMessage.includes('failed to fetch')) {
        setGenerationError(
          'Could not reach the Gemini preview service. Verify the API URL and that the preview server is running.'
        );
      } else if (appProxyNotFound) {
        setGenerationError(
          'Shopify app proxy route /apps/quickclips-personalization/preview returned 404. Configure the proxy target or set window.QuickClipsPersonalization.apiUrl to your preview server.'
        );
      } else if (normalizedErrorMessage.includes('status 404')) {
        const isShopifyHostedPreview = /\.myshopify\.com$/i.test(window.location.hostname || '');
        if (isShopifyHostedPreview) {
          setGenerationError(
            'Preview API route was not found on this Shopify-hosted preview. Open the local theme preview URL (for example http://127.0.0.1:9292), keep scripts/start-gemini-preview-server.ps1 running, or configure the Shopify app proxy.'
          );
        } else {
          setGenerationError(
            'Preview API route was not found. Start the local server with scripts/start-gemini-preview-server.ps1 or configure window.QuickClipsPersonalization.apiUrl.'
          );
        }
      } else {
        setGenerationError(errorMessage);
      }
      setError(generationErrorMessage);
    } finally {
      isGenerating = false;
      renderEditorState();
    }
  }

  generateButton.addEventListener('click', () => {
    generatePreview();
  });

  saveButton.addEventListener('click', () => {
    commitActiveState(true);
  });

  cancelButton.addEventListener('click', () => {
    closeEditor();
  });

  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.type !== 'add-to-cart-form') return;

      const context = form.querySelector('[data-personalization-context]');
      if (!context) return;

      const scope = resolveContextScope(context);
      if (!scope) return;

      const state = getScopeState(scope);
      if (!state) return;
      applyStateToContext(context, state);
    },
    true
  );

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        if (node.matches('[data-personalization-context]')) {
          hydrateContext(node);
        }

        if (node.querySelector('[data-personalization-context]')) {
          hydrateContexts(node);
        }
      });
    });
  });

  hydrateContexts(document);
  observer.observe(document.body, { childList: true, subtree: true });
})();

