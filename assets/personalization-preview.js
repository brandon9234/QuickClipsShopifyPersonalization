(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_STYLE = 'Style 1';
  const STYLE_VALUES = ['Style 1', 'Style 2', 'Style 3'];
  const DEFAULT_NAME1_MAX = 30;
  const DEFAULT_NAME2_MAX = 30;
  const DEFAULT_DATE_MAX = 32;
  const DEFAULT_GENERATED_MESSAGE = 'Fill out the fields and click Generate to create your QuickClip preview.';
  const GENERATING_MESSAGE = 'Generating QuickClip preview...';
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = ['is-style-1', 'is-style-2', 'is-style-3'];

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const styleInputs = Array.from(modal.querySelectorAll('[data-personalization-input="style"]'));
  const name1Input = modal.querySelector('[data-personalization-input="name1"]');
  const name2Input = modal.querySelector('[data-personalization-input="name2"]');
  const dateInput = modal.querySelector('[data-personalization-input="date"]');
  const name1Count = modal.querySelector('[data-personalization-count="name1"]');
  const name2Count = modal.querySelector('[data-personalization-count="name2"]');
  const previewName1 = modal.querySelector('[data-personalization-preview="name1"]');
  const previewName2 = modal.querySelector('[data-personalization-preview="name2"]');
  const previewDate = modal.querySelector('[data-personalization-preview="date"]');
  const clipSurface = modal.querySelector('[data-personalization-clip-surface]');
  const pickedPanel = modal.querySelector('[data-personalization-picked-panel]');
  const generatedImage = modal.querySelector('[data-personalization-generated-image]');
  const generatedOutput = modal.querySelector('[data-personalization-generated-output]');
  const productName = modal.querySelector('[data-personalization-product-name]');
  const errorElement = modal.querySelector('[data-personalization-error]');
  const generateButton = modal.querySelector('[data-personalization-generate]');
  const saveButton = modal.querySelector('[data-personalization-save]');
  const cancelButton = modal.querySelector('[data-personalization-cancel]');

  if (
    styleInputs.length === 0 ||
    !name1Input ||
    !name2Input ||
    !dateInput ||
    !name1Count ||
    !name2Count ||
    !previewName1 ||
    !previewName2 ||
    !previewDate ||
    !clipSurface ||
    !pickedPanel ||
    !generatedImage ||
    !generatedOutput ||
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
  let activeName1Max = DEFAULT_NAME1_MAX;
  let activeName2Max = DEFAULT_NAME2_MAX;
  let isGenerating = false;

  function parseMaxLength(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
  }

  function normalizeStyle(value) {
    if (!value) return DEFAULT_STYLE;
    if (STYLE_VALUES.includes(value)) return value;
    return DEFAULT_STYLE;
  }

  function selectorEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
  }

  function getApiUrl() {
    const globalConfig = window.QuickClipsPersonalization;
    if (globalConfig && typeof globalConfig.apiUrl === 'string' && globalConfig.apiUrl.trim()) {
      return globalConfig.apiUrl.trim();
    }

    const modalConfig = modal.dataset.personalizationApiUrl;
    if (typeof modalConfig === 'string' && modalConfig.trim()) {
      return modalConfig.trim();
    }

    return DEFAULT_API_PATH;
  }

  function createDefaultState() {
    return {
      style: DEFAULT_STYLE,
      name1: '',
      name2: '',
      date: '',
      geminiSummary: '',
      generatedImage: '',
      previewOpened: true,
      maxName1: DEFAULT_NAME1_MAX,
      maxName2: DEFAULT_NAME2_MAX,
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
      name1: String(nextState.name1 ?? currentState.name1 ?? '').trim(),
      name2: String(nextState.name2 ?? currentState.name2 ?? '').trim(),
      date: String(nextState.date ?? currentState.date ?? '').trim(),
      geminiSummary: String(nextState.geminiSummary ?? currentState.geminiSummary ?? '').trim(),
      generatedImage: String(nextState.generatedImage ?? currentState.generatedImage ?? '').trim(),
      previewOpened: Boolean(nextState.previewOpened ?? currentState.previewOpened),
      maxName1: parseMaxLength(nextState.maxName1 ?? currentState.maxName1, DEFAULT_NAME1_MAX),
      maxName2: parseMaxLength(nextState.maxName2 ?? currentState.maxName2, DEFAULT_NAME2_MAX),
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
      return;
    }

    clipSurface.style.setProperty('--quickclip-style-image', `url("${styleImageUrl.replace(/"/g, '\\"')}")`);
  }

  function setGeneratedImage(dataUrl) {
    if (!dataUrl) {
      generatedImage.setAttribute('hidden', '');
      generatedImage.removeAttribute('src');
      return;
    }

    generatedImage.src = dataUrl;
    generatedImage.removeAttribute('hidden');
  }

  function getGeneratedImageData() {
    return generatedImage.getAttribute('src') || '';
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

  function loadImageElement(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not load style image.'));
      image.src = source;
    });
  }

  function drawRoundedRectPath(context, x, y, width, height, radius) {
    const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.lineTo(x + width - safeRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    context.lineTo(x + width, y + height - safeRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    context.lineTo(x + safeRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    context.lineTo(x, y + safeRadius);
    context.quadraticCurveTo(x, y, x + safeRadius, y);
    context.closePath();
  }

  function drawCoverImage(context, image, width, height) {
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function truncateText(text, maxLength) {
    const normalized = String(text || '').trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1)}…`;
  }

  async function renderGeneratedQuickClipImage(styleValue, preview) {
    try {
      const normalizedStyle = normalizeStyle(styleValue);
      const styleImage = await getStyleImagePayload(normalizedStyle);
      const styleSource = styleImage ? styleImage.dataUrl : getStyleImageUrl(normalizedStyle);
      if (!styleSource) return '';

      const image = await loadImageElement(styleSource);
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 900;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) return '';

      drawCoverImage(context, image, width, height);

      context.fillStyle = 'rgba(245, 245, 245, 0.26)';
      context.fillRect(0, 0, width, height);

      const plateX = width * 0.14;
      const plateY = height * 0.23;
      const plateWidth = width * 0.72;
      const plateHeight = height * 0.54;

      if (normalizedStyle === 'Style 3') {
        const plateGradient = context.createLinearGradient(plateX, plateY, plateX + plateWidth, plateY + plateHeight);
        plateGradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        plateGradient.addColorStop(1, 'rgba(243, 243, 243, 0.88)');
        drawRoundedRectPath(context, plateX, plateY, plateWidth, plateHeight, 120);
        context.fillStyle = plateGradient;
        context.fill();
        context.strokeStyle = 'rgba(55, 55, 55, 0.42)';
        context.lineWidth = 4;
        context.stroke();
      } else {
        drawRoundedRectPath(
          context,
          plateX,
          plateY,
          plateWidth,
          plateHeight,
          normalizedStyle === 'Style 2' ? 18 : 28
        );
        context.fillStyle = 'rgba(255, 255, 255, 0.94)';
        context.fill();
        context.strokeStyle = 'rgba(55, 55, 55, 0.44)';
        context.lineWidth = 4;
        if (normalizedStyle === 'Style 2') {
          context.setLineDash([18, 12]);
        }
        context.stroke();
        context.setLineDash([]);
      }

      const headline = truncateText(preview.headline || name1Input.value, 60) || 'Name 1';
      const subline = truncateText(preview.subline || name2Input.value, 90) || 'Name 2';
      const dateLine = truncateText(preview.dateLine || dateInput.value, 60) || 'Date';

      context.textAlign = 'center';
      context.fillStyle = '#243647';
      context.font = normalizedStyle === 'Style 3' ? '600 68px Georgia, serif' : '600 66px Arial, sans-serif';
      context.fillText(headline, width / 2, plateY + plateHeight * 0.42);

      context.fillStyle = '#30485f';
      context.font = normalizedStyle === 'Style 3' ? '500 48px Georgia, serif' : '500 44px Arial, sans-serif';
      context.fillText(subline, width / 2, plateY + plateHeight * 0.62);

      context.fillStyle = '#55616e';
      context.font = '400 36px Arial, sans-serif';
      context.fillText(dateLine, width / 2, plateY + plateHeight * 0.79);

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      return '';
    }
  }

  function getGeneratedSummary() {
    const currentOutput = generatedOutput.textContent ? generatedOutput.textContent.trim() : '';
    if (!currentOutput || currentOutput === DEFAULT_GENERATED_MESSAGE || currentOutput === GENERATING_MESSAGE) {
      return '';
    }
    return currentOutput;
  }

  function getValidationError(options = {}) {
    const requireAll = Boolean(options.requireAll);
    const name1Value = name1Input.value.trim();
    const name2Value = name2Input.value.trim();
    const dateValue = dateInput.value.trim();

    if (name1Value.length > activeName1Max) {
      return `Name 1 must be ${activeName1Max} characters or fewer.`;
    }

    if (name2Value.length > activeName2Max) {
      return `Name 2 must be ${activeName2Max} characters or fewer.`;
    }

    if (dateValue.length > DEFAULT_DATE_MAX) {
      return `Date must be ${DEFAULT_DATE_MAX} characters or fewer.`;
    }

    if (requireAll) {
      if (!name1Value) return 'Name 1 is required before generating a preview.';
      if (!name2Value) return 'Name 2 is required before generating a preview.';
      if (!dateValue) return 'Date is required before generating a preview.';
    }

    return '';
  }

  function setPickedPanelVisible(visible) {
    pickedPanel.toggleAttribute('hidden', !visible);
  }

  function renderClipStyle() {
    const selectedStyle = getSelectedStyle();
    const styleClass = getClipStyleClass(selectedStyle);
    clipSurface.classList.remove(...CLIP_STYLE_CLASSES);
    clipSurface.classList.add(styleClass);
    setWorkspaceStyleImage(selectedStyle);
  }

  function renderPreviewText() {
    previewName1.textContent = name1Input.value.trim() || 'Name 1';
    previewName2.textContent = name2Input.value.trim() || 'Name 2';
    previewDate.textContent = dateInput.value.trim() || 'Date';
  }

  function renderEditorState() {
    name1Count.textContent = `${name1Input.value.length}/${activeName1Max}`;
    name2Count.textContent = `${name2Input.value.length}/${activeName2Max}`;

    setPickedPanelVisible(true);
    renderClipStyle();
    renderPreviewText();

    const hasError = Boolean(getValidationError());
    if (!isGenerating) {
      setError(hasError ? getValidationError() : '');
    }

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
    const geminiSummaryProperty = context.querySelector('[data-personalization-property="gemini_summary"]');
    const scopeProperty = context.querySelector('[data-personalization-property="scope"]');

    if (primaryProperty) primaryProperty.value = state.name1 || '';
    if (secondaryProperty) secondaryProperty.value = state.name2 || '';
    if (styleProperty) styleProperty.value = state.style || DEFAULT_STYLE;
    if (name1Property) name1Property.value = state.name1 || '';
    if (name2Property) name2Property.value = state.name2 || '';
    if (dateProperty) dateProperty.value = state.date || '';
    if (geminiSummaryProperty) geminiSummaryProperty.value = state.geminiSummary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
  }

  function isConfiguredState(state) {
    if (!state) return false;
    return Boolean(state.name1 || state.name2 || state.date || state.geminiSummary);
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
        name1:
          (context.querySelector('[data-personalization-property="name1"]') || {}).value ||
          (context.querySelector('[data-personalization-property="primary"]') || {}).value ||
          '',
        name2:
          (context.querySelector('[data-personalization-property="name2"]') || {}).value ||
          (context.querySelector('[data-personalization-property="secondary"]') || {}).value ||
          '',
        date: (context.querySelector('[data-personalization-property="date"]') || {}).value || '',
        geminiSummary: (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '',
        generatedImage: '',
        maxName1: DEFAULT_NAME1_MAX,
        maxName2: DEFAULT_NAME2_MAX,
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
    activeName1Max = parseMaxLength(
      trigger.dataset.personalizationPrimaryMax,
      existingState.maxName1 || DEFAULT_NAME1_MAX
    );
    activeName2Max = parseMaxLength(
      trigger.dataset.personalizationSecondaryMax,
      existingState.maxName2 || DEFAULT_NAME2_MAX
    );

    name1Input.maxLength = activeName1Max;
    name2Input.maxLength = activeName2Max;
    dateInput.maxLength = DEFAULT_DATE_MAX;

    const productTitle = trigger.dataset.personalizationProductTitle || '';
    productName.textContent = productTitle;
    productName.toggleAttribute('hidden', !productTitle);

    setSelectedStyle(existingState.style || DEFAULT_STYLE);
    name1Input.value = existingState.name1 || '';
    name2Input.value = existingState.name2 || '';
    dateInput.value = existingState.date || '';
    setGeneratedImage(existingState.generatedImage || '');
    generatedOutput.textContent = existingState.geminiSummary || DEFAULT_GENERATED_MESSAGE;
    setPickedPanelVisible(true);
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
    input.addEventListener('change', renderEditorState);
  });
  name1Input.addEventListener('input', renderEditorState);
  name2Input.addEventListener('input', renderEditorState);
  dateInput.addEventListener('input', renderEditorState);

  function commitActiveState(closeModal) {
    if (!activeScope) return false;

    const error = getValidationError();
    if (error) {
      setError(error);
      return false;
    }

    setScopeState(activeScope, {
      style: getSelectedStyle(),
      name1: name1Input.value.trim(),
      name2: name2Input.value.trim(),
      date: dateInput.value.trim(),
      geminiSummary: getGeneratedSummary(),
      generatedImage: getGeneratedImageData(),
      previewOpened: true,
      maxName1: activeName1Max,
      maxName2: activeName2Max,
    });

    syncScope(activeScope);

    if (closeModal) {
      closeEditor();
    }

    return true;
  }

  function buildGeminiSummary(preview) {
    const parts = [];
    if (preview.headline) parts.push(`Headline: ${preview.headline}`);
    if (preview.subline) parts.push(`Subline: ${preview.subline}`);
    if (preview.dateLine) parts.push(`Date: ${preview.dateLine}`);
    if (preview.styleNotes) parts.push(`Style notes: ${preview.styleNotes}`);
    return parts.join('\n').trim();
  }

  async function generatePreview() {
    if (!activeScope || isGenerating) return;

    const blockingError = getValidationError({ requireAll: true });
    if (blockingError) {
      setError(blockingError);
      return;
    }

    const previousSummary = getGeneratedSummary();
    const previousGeneratedImage = getGeneratedImageData();
    setPickedPanelVisible(true);
    isGenerating = true;
    setError('');
    generatedOutput.textContent = GENERATING_MESSAGE;
    renderEditorState();

    const selectedStyle = getSelectedStyle();
    const payload = {
      style: selectedStyle,
      name1: name1Input.value.trim(),
      name2: name2Input.value.trim(),
      date: dateInput.value.trim(),
    };

    try {
      const styleImagePayload = await getStyleImagePayload(selectedStyle);
      if (styleImagePayload) {
        payload.styleImage = {
          mimeType: styleImagePayload.mimeType,
          data: styleImagePayload.data,
          url: styleImagePayload.url,
        };
      }

      const response = await fetch(getApiUrl(), {
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
        throw new Error(errorMessage);
      }

      const preview = json.preview || {};
      const summary = buildGeminiSummary(preview) || 'Preview generated successfully.';
      const generatedImageData = (await renderGeneratedQuickClipImage(payload.style, preview)) || previousGeneratedImage;

      setGeneratedImage(generatedImageData);
      generatedOutput.textContent = summary;

      setScopeState(activeScope, {
        style: payload.style,
        name1: payload.name1,
        name2: payload.name2,
        date: payload.date,
        geminiSummary: summary,
        generatedImage: generatedImageData,
        previewOpened: true,
        maxName1: activeName1Max,
        maxName2: activeName2Max,
      });
      syncScope(activeScope);
    } catch (error) {
      setGeneratedImage(previousGeneratedImage);
      generatedOutput.textContent = previousSummary || DEFAULT_GENERATED_MESSAGE;
      setError(error instanceof Error ? error.message : 'Could not generate preview.');
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
