(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_STYLE = 'Style 1';
  const STYLE_VALUES = ['Style 1', 'Style 2', 'Style 3'];
  const DEFAULT_LAST_NAME_MAX = 30;
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = ['is-style-1', 'is-style-2', 'is-style-3'];

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const styleInputs = Array.from(modal.querySelectorAll('[data-personalization-input="style"]'));
  const lastNameInput = modal.querySelector('[data-personalization-input="lastName"]');
  const lastNameCount = modal.querySelector('[data-personalization-count="lastName"]');
  const clipSurface = modal.querySelector('[data-personalization-clip-surface]');
  const stylePreviewImage = modal.querySelector('[data-personalization-style-preview-image]');
  const pickedPanel = modal.querySelector('[data-personalization-picked-panel]');
  const productName = modal.querySelector('[data-personalization-product-name]');
  const errorElement = modal.querySelector('[data-personalization-error]');
  const generateButton = modal.querySelector('[data-personalization-generate]');
  const saveButton = modal.querySelector('[data-personalization-save]');
  const cancelButton = modal.querySelector('[data-personalization-cancel]');

  if (
    styleInputs.length === 0 ||
    !lastNameInput ||
    !lastNameCount ||
    !clipSurface ||
    !stylePreviewImage ||
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
  let isGenerating = false;
  let generationErrorMessage = '';
  let generatedImageData = '';

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
      geminiSummary: '',
      generatedImage: '',
      previewOpened: true,
      maxLastName: DEFAULT_LAST_NAME_MAX,
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
      geminiSummary: String(nextState.geminiSummary ?? currentState.geminiSummary ?? '').trim(),
      generatedImage: String(nextState.generatedImage ?? currentState.generatedImage ?? '').trim(),
      previewOpened: Boolean(nextState.previewOpened ?? currentState.previewOpened),
      maxLastName: parseMaxLength(nextState.maxLastName ?? currentState.maxLastName, DEFAULT_LAST_NAME_MAX),
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

  function getGeneratedSummary() {
    return '';
  }

  function getValidationError(options = {}) {
    const requireAll = Boolean(options.requireAll);
    const lastNameValue = lastNameInput.value.trim();

    if (lastNameValue.length > activeLastNameMax) {
      return `Last name must be ${activeLastNameMax} characters or fewer.`;
    }

    if (requireAll) {
      if (!lastNameValue) return 'Last name is required before generating a preview.';
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

    const existingGeneratedImage = getGeneratedImageData();
    if (existingGeneratedImage) {
      clipSurface.style.setProperty('--quickclip-style-image', 'none');
      stylePreviewImage.src = existingGeneratedImage;
      stylePreviewImage.removeAttribute('hidden');
      return;
    }

    setWorkspaceStyleImage(selectedStyle);
  }

  function renderEditorState() {
    lastNameCount.textContent = `${lastNameInput.value.length}/${activeLastNameMax}`;

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

    if (primaryProperty) primaryProperty.value = state.lastName || '';
    if (secondaryProperty) secondaryProperty.value = '';
    if (styleProperty) styleProperty.value = state.style || DEFAULT_STYLE;
    if (name1Property) name1Property.value = state.lastName || '';
    if (name2Property) name2Property.value = '';
    if (dateProperty) dateProperty.value = '';
    if (geminiSummaryProperty) geminiSummaryProperty.value = state.geminiSummary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
  }

  function isConfiguredState(state) {
    if (!state) return false;
    return Boolean(state.lastName || state.geminiSummary);
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
        geminiSummary: (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '',
        generatedImage: '',
        maxLastName: DEFAULT_LAST_NAME_MAX,
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

    lastNameInput.maxLength = activeLastNameMax;

    const productTitle = trigger.dataset.personalizationProductTitle || '';
    productName.textContent = productTitle;
    productName.toggleAttribute('hidden', !productTitle);

    setSelectedStyle(existingState.style || DEFAULT_STYLE);
    lastNameInput.value = existingState.lastName || '';
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
    setGeneratedImage('');
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
      geminiSummary: getGeneratedSummary(),
      generatedImage: getGeneratedImageData(),
      previewOpened: true,
      maxLastName: activeLastNameMax,
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
        geminiSummary: '',
        generatedImage: generatedImageData,
        previewOpened: true,
        maxLastName: activeLastNameMax,
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
