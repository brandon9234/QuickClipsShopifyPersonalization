(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_PRIMARY_MAX = 30;
  const DEFAULT_SECONDARY_MAX = 30;

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const primaryInput = modal.querySelector('[data-personalization-input="primary"]');
  const secondaryInput = modal.querySelector('[data-personalization-input="secondary"]');
  const primaryCount = modal.querySelector('[data-personalization-count="primary"]');
  const secondaryCount = modal.querySelector('[data-personalization-count="secondary"]');
  const previewPrimary = modal.querySelector('[data-personalization-preview="primary"]');
  const previewSecondary = modal.querySelector('[data-personalization-preview="secondary"]');
  const productName = modal.querySelector('[data-personalization-product-name]');
  const errorElement = modal.querySelector('[data-personalization-error]');
  const saveButton = modal.querySelector('[data-personalization-save]');
  const cancelButton = modal.querySelector('[data-personalization-cancel]');

  if (
    !primaryInput ||
    !secondaryInput ||
    !primaryCount ||
    !secondaryCount ||
    !previewPrimary ||
    !previewSecondary ||
    !productName ||
    !errorElement ||
    !saveButton ||
    !cancelButton
  ) {
    return;
  }

  const stateByScope = new Map();

  let activeScope = '';
  let activePrimaryMax = DEFAULT_PRIMARY_MAX;
  let activeSecondaryMax = DEFAULT_SECONDARY_MAX;

  function parseMaxLength(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
  }

  function selectorEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
  }

  function getScopeState(scope) {
    if (!scope) return null;
    return stateByScope.get(scope) || null;
  }

  function setScopeState(scope, state) {
    if (!scope) return;
    stateByScope.set(scope, {
      primary: state.primary || '',
      secondary: state.secondary || '',
      maxPrimary: parseMaxLength(state.maxPrimary, DEFAULT_PRIMARY_MAX),
      maxSecondary: parseMaxLength(state.maxSecondary, DEFAULT_SECONDARY_MAX),
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

  function getValidationError() {
    const primaryValue = primaryInput.value.trim();
    const secondaryValue = secondaryInput.value.trim();

    if (primaryValue.length > activePrimaryMax) {
      return `Primary text must be ${activePrimaryMax} characters or fewer.`;
    }

    if (secondaryValue.length > activeSecondaryMax) {
      return `Secondary text must be ${activeSecondaryMax} characters or fewer.`;
    }

    return '';
  }

  function renderEditorState() {
    primaryCount.textContent = `${primaryInput.value.length}/${activePrimaryMax}`;
    secondaryCount.textContent = `${secondaryInput.value.length}/${activeSecondaryMax}`;

    previewPrimary.textContent = primaryInput.value.trim() || 'Primary text';
    previewSecondary.textContent = secondaryInput.value.trim() || 'Secondary text';

    const error = getValidationError();
    setError(error);
    saveButton.disabled = Boolean(error);
  }

  function applyStateToContext(context, state) {
    const primaryProperty = context.querySelector('[data-personalization-property="primary"]');
    const secondaryProperty = context.querySelector('[data-personalization-property="secondary"]');
    const scopeProperty = context.querySelector('[data-personalization-property="scope"]');

    if (primaryProperty) primaryProperty.value = state.primary || '';
    if (secondaryProperty) secondaryProperty.value = state.secondary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
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
      if (state && (state.primary || state.secondary)) {
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

    const state = getScopeState(scope) || {
      primary: '',
      secondary: '',
      maxPrimary: DEFAULT_PRIMARY_MAX,
      maxSecondary: DEFAULT_SECONDARY_MAX,
    };

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

    const primaryProperty = context.querySelector('[data-personalization-property="primary"]');
    const secondaryProperty = context.querySelector('[data-personalization-property="secondary"]');
    const existingState = getScopeState(scope);

    if (!existingState) {
      setScopeState(scope, {
        primary: primaryProperty ? primaryProperty.value : '',
        secondary: secondaryProperty ? secondaryProperty.value : '',
        maxPrimary: DEFAULT_PRIMARY_MAX,
        maxSecondary: DEFAULT_SECONDARY_MAX,
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

    const existingState = getScopeState(activeScope);
    activePrimaryMax = parseMaxLength(
      trigger.dataset.personalizationPrimaryMax,
      existingState ? existingState.maxPrimary : DEFAULT_PRIMARY_MAX
    );
    activeSecondaryMax = parseMaxLength(
      trigger.dataset.personalizationSecondaryMax,
      existingState ? existingState.maxSecondary : DEFAULT_SECONDARY_MAX
    );

    primaryInput.maxLength = activePrimaryMax;
    secondaryInput.maxLength = activeSecondaryMax;

    const productTitle = trigger.dataset.personalizationProductTitle || '';
    productName.textContent = productTitle;
    productName.toggleAttribute('hidden', !productTitle);

    primaryInput.value = existingState ? existingState.primary : '';
    secondaryInput.value = existingState ? existingState.secondary : '';
    renderEditorState();

    if (typeof modal.show === 'function') {
      modal.show(trigger);
    } else {
      modal.setAttribute('open', '');
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-personalization-trigger]');
    if (!trigger) return;

    event.preventDefault();
    openEditor(trigger);
  });

  primaryInput.addEventListener('input', renderEditorState);
  secondaryInput.addEventListener('input', renderEditorState);

  saveButton.addEventListener('click', () => {
    if (!activeScope) return;

    const error = getValidationError();
    if (error) {
      setError(error);
      return;
    }

    setScopeState(activeScope, {
      primary: primaryInput.value.trim(),
      secondary: secondaryInput.value.trim(),
      maxPrimary: activePrimaryMax,
      maxSecondary: activeSecondaryMax,
    });

    syncScope(activeScope);

    if (typeof modal.hide === 'function') {
      modal.hide();
    } else {
      modal.removeAttribute('open');
    }
  });

  cancelButton.addEventListener('click', () => {
    if (typeof modal.hide === 'function') {
      modal.hide();
    } else {
      modal.removeAttribute('open');
    }
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
