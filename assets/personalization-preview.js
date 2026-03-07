(function () {
  'use strict';

  /* ---------------------------------------------------------- *
   * Preserved from Codex: all existing constants and core logic
   * Includes modal UX refinements and accessibility updates
   * ---------------------------------------------------------- */

  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_STYLE = 'Style 1';
  const STYLE_VALUES = ['Style 1', 'Style 2', 'Style 3'];
  const DEFAULT_NAME1_MAX = 30;
  const DEFAULT_NAME2_MAX = 30;
  const DEFAULT_DATE_MAX = 32;
  const DEFAULT_GENERATED_MESSAGE = 'Click Generate to create your QuickClip preview.';
  const GENERATING_MESSAGE = 'Generating QuickClip preview...';
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = ['is-style-1', 'is-style-2', 'is-style-3'];

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const modalContent    = modal.querySelector('.personalization-preview-modal__content');
  const stickyHeader    = modal.querySelector('.pp-sticky-header');

  const styleInputs     = Array.from(modal.querySelectorAll('[data-personalization-input="style"]'));
  const name1Input      = modal.querySelector('[data-personalization-input="name1"]');
  const name2Input      = modal.querySelector('[data-personalization-input="name2"]');
  const dateInput       = modal.querySelector('[data-personalization-input="date"]');
  const name1Count      = modal.querySelector('[data-personalization-count="name1"]');
  const name2Count      = modal.querySelector('[data-personalization-count="name2"]');
  const previewName1    = modal.querySelector('[data-personalization-preview="name1"]');
  const previewName2    = modal.querySelector('[data-personalization-preview="name2"]');
  const previewDate     = modal.querySelector('[data-personalization-preview="date"]');
  const clipSurface     = modal.querySelector('[data-personalization-clip-surface]');
  const pickedPanel     = modal.querySelector('[data-personalization-picked-panel]');
  const generatedOutput = modal.querySelector('[data-personalization-generated-output]');
  const productName     = modal.querySelector('[data-personalization-product-name]');
  const errorElement    = modal.querySelector('[data-personalization-error]');
  const pickButton      = modal.querySelector('[data-personalization-pick]');
  const generateButton  = modal.querySelector('[data-personalization-generate]');
  const saveButton      = modal.querySelector('[data-personalization-save]');
  const cancelButton    = modal.querySelector('[data-personalization-cancel]');

  if (
    styleInputs.length === 0 ||
    !name1Input || !name2Input || !dateInput ||
    !name1Count || !name2Count ||
    !previewName1 || !previewName2 || !previewDate ||
    !clipSurface || !pickedPanel || !generatedOutput ||
    !productName || !errorElement ||
    !pickButton || !generateButton || !saveButton || !cancelButton
  ) {
    return;
  }

  /* ---- State ---- */
  const stateByScope = new Map();
  let activeScope    = '';
  let activeTrigger  = null;        // A4: track opener for focus return
  let activeName1Max = DEFAULT_NAME1_MAX;
  let activeName2Max = DEFAULT_NAME2_MAX;
  let isGenerating   = false;

  /* ---- Utilities ---- */
  function parseMaxLength(value, fallback) {
    const n = Number.parseInt(value, 10);
    return (Number.isNaN(n) || n < 1) ? fallback : n;
  }

  function normalizeStyle(value) {
    return STYLE_VALUES.includes(value) ? value : DEFAULT_STYLE;
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
    if (typeof modalConfig === 'string' && modalConfig.trim()) return modalConfig.trim();
    return DEFAULT_API_PATH;
  }

  /* ---- Default state ---- */
  function createDefaultState() {
    return {
      style: DEFAULT_STYLE,
      name1: '', name2: '', date: '',
      geminiSummary: '',
      previewOpened: false,
      maxName1: DEFAULT_NAME1_MAX,
      maxName2: DEFAULT_NAME2_MAX,
    };
  }

  /* ---- Scope state management ---- */
  function getScopeState(scope) {
    return scope ? (stateByScope.get(scope) || null) : null;
  }

  function setScopeState(scope, nextState) {
    if (!scope) return;
    const cur = getScopeState(scope) || createDefaultState();
    stateByScope.set(scope, {
      style:        normalizeStyle(nextState.style ?? cur.style),
      name1:        String(nextState.name1   ?? cur.name1   ?? '').trim(),
      name2:        String(nextState.name2   ?? cur.name2   ?? '').trim(),
      date:         String(nextState.date    ?? cur.date    ?? '').trim(),
      geminiSummary:String(nextState.geminiSummary ?? cur.geminiSummary ?? '').trim(),
      previewOpened:Boolean(nextState.previewOpened ?? cur.previewOpened),
      maxName1:     parseMaxLength(nextState.maxName1 ?? cur.maxName1, DEFAULT_NAME1_MAX),
      maxName2:     parseMaxLength(nextState.maxName2 ?? cur.maxName2, DEFAULT_NAME2_MAX),
    });
  }

  /* ---- Error display ---- */
  function setError(message) {
    if (!message) {
      errorElement.setAttribute('hidden', '');
      errorElement.textContent = '';
    } else {
      errorElement.removeAttribute('hidden');
      errorElement.textContent = message;
    }
  }

  /* ---- Style helpers ---- */
  function getSelectedStyle() {
    const checked = styleInputs.find((i) => i.checked);
    return normalizeStyle(checked ? checked.value : DEFAULT_STYLE);
  }

  function setSelectedStyle(styleValue) {
    const val = normalizeStyle(styleValue);
    styleInputs.forEach((i) => { i.checked = i.value === val; });
  }

  function getClipStyleClass(styleValue) {
    if (styleValue === 'Style 2') return 'is-style-2';
    if (styleValue === 'Style 3') return 'is-style-3';
    return 'is-style-1';
  }

  /* ---- Gemini summary ---- */
  function getGeneratedSummary() {
    const t = generatedOutput.textContent ? generatedOutput.textContent.trim() : '';
    return (t && t !== DEFAULT_GENERATED_MESSAGE && t !== GENERATING_MESSAGE) ? t : '';
  }

  /* ---- Validation ---- */
  function getValidationError(options = {}) {
    const requireAll = Boolean(options.requireAll);
    const n1 = name1Input.value.trim();
    const n2 = name2Input.value.trim();
    const dt = dateInput.value.trim();
    if (n1.length > activeName1Max) return `Name 1 must be ${activeName1Max} characters or fewer.`;
    if (n2.length > activeName2Max) return `Name 2 must be ${activeName2Max} characters or fewer.`;
    if (dt.length > DEFAULT_DATE_MAX) return `Date must be ${DEFAULT_DATE_MAX} characters or fewer.`;
    if (requireAll) {
      if (!n1) return 'Name 1 is required before generating a preview.';
      if (!n2) return 'Name 2 is required before generating a preview.';
      if (!dt) return 'Date is required before generating a preview.';
    }
    return '';
  }

  /* ---- B1: Color-coded character counter ---- */
  function updateCount(input, countEl, max) {
    if (!countEl) return;
    const len   = input.value.length;
    const ratio = max > 0 ? len / max : 0;
    countEl.textContent = `${len}/${max}`;
    countEl.classList.toggle('pp-count--warn',  ratio >= 0.8 && ratio < 1);
    countEl.classList.toggle('pp-count--error', ratio >= 1);
    // B3: mirror onto input border
    input.classList.toggle('pp-input--error', len > max);
  }

  /* ---- D2: Clear button visibility ---- */
  function updateClearButtons() {
    [
      { input: name1Input, field: 'name1' },
      { input: name2Input, field: 'name2' },
    ].forEach(({ input, field }) => {
      const btn = modal.querySelector(`[data-personalization-clear="${field}"]`);
      if (btn) btn.toggleAttribute('hidden', input.value.length === 0);
    });
  }

  /* ---- Preview / clip rendering ---- */
  function setPickedPanelVisible(visible) {
    pickedPanel.toggleAttribute('hidden', !visible);
  }

  function renderClipStyle() {
    const styleClass = getClipStyleClass(getSelectedStyle());
    clipSurface.classList.remove(...CLIP_STYLE_CLASSES);
    clipSurface.classList.add(styleClass);
  }

  function renderPreviewText() {
    previewName1.textContent = name1Input.value.trim() || 'Name 1';
    previewName2.textContent = name2Input.value.trim() || 'Name 2';
    previewDate.textContent  = dateInput.value.trim()  || 'Date';
  }

  /* ---- Combined render ---- */
  function renderEditorState() {
    updateCount(name1Input, name1Count, activeName1Max);
    updateCount(name2Input, name2Count, activeName2Max);
    updateClearButtons();
    renderClipStyle();
    renderPreviewText();

    const hasError = Boolean(getValidationError());
    if (!isGenerating) setError(hasError ? getValidationError() : '');

    pickButton.disabled     = isGenerating || hasError;
    generateButton.disabled = isGenerating || hasError;
    saveButton.disabled     = isGenerating || hasError;
  }

  /* ---- E1: Spinner on save/generate ---- */
  function setButtonLoading(button, loading) {
    const label   = button.querySelector('.pp-btn-label');
    const spinner = button.querySelector('.pp-spinner');
    if (label)   label.style.opacity = loading ? '0.55' : '';
    if (spinner) spinner.toggleAttribute('hidden', !loading);
  }

  /* ---- A3: Sticky header shadow on scroll ---- */
  if (modalContent && stickyHeader) {
    modalContent.addEventListener('scroll', () => {
      stickyHeader.classList.toggle('is-scrolled', modalContent.scrollTop > 4);
    }, { passive: true });
  }

  /* ---- F3: Body scroll lock ---- */
  function lockScroll()   { document.body.classList.add('pp-modal-open'); }
  function unlockScroll() { document.body.classList.remove('pp-modal-open'); }

  /* ---- G1: Focus trap ---- */
  function getFocusable() {
    return [...modalContent.querySelectorAll(
      'button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
    )].filter((el) => el.offsetParent !== null && !el.closest('[hidden]'));
  }

  function handleTrap(event) {
    if (event.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  /* ---- A4: Unified close with unlock + focus return ---- */
  function doClose() {
    unlockScroll();
    modal.removeEventListener('keydown', handleTrap);
    if (typeof modal.hide === 'function') {
      modal.hide();
    } else {
      modal.removeAttribute('open');
    }
    if (activeTrigger) {
      const t = activeTrigger;
      activeTrigger = null;
      requestAnimationFrame(() => t.focus());
    }
  }

  /* ---- G2: Escape key ---- */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.hasAttribute('open')) doClose();
  });

  /* ---- Open editor ---- */
  function openEditor(trigger) {
    activeScope = trigger.dataset.personalizationScope || '';
    if (!activeScope) return;

    activeTrigger = trigger; // A4
    const existingState = getScopeState(activeScope) || createDefaultState();

    activeName1Max = parseMaxLength(trigger.dataset.personalizationPrimaryMax,   existingState.maxName1 || DEFAULT_NAME1_MAX);
    activeName2Max = parseMaxLength(trigger.dataset.personalizationSecondaryMax, existingState.maxName2 || DEFAULT_NAME2_MAX);

    name1Input.maxLength = activeName1Max;
    name2Input.maxLength = activeName2Max;
    dateInput.maxLength  = DEFAULT_DATE_MAX;

    const productTitle = trigger.dataset.personalizationProductTitle || '';
    productName.textContent = productTitle;
    productName.toggleAttribute('hidden', !productTitle);

    setSelectedStyle(existingState.style || DEFAULT_STYLE);
    name1Input.value = existingState.name1 || '';
    name2Input.value = existingState.name2 || '';
    dateInput.value  = existingState.date  || '';
    generatedOutput.textContent = existingState.geminiSummary || DEFAULT_GENERATED_MESSAGE;
    setPickedPanelVisible(Boolean(existingState.previewOpened));
    isGenerating = false;
    setButtonLoading(generateButton, false);
    setButtonLoading(saveButton, false);
    renderEditorState();

    lockScroll(); // F3

    if (typeof modal.show === 'function') {
      modal.show(trigger);
    } else {
      modal.setAttribute('open', '');
    }

    // G1: activate focus trap and move focus to first input
    setTimeout(() => {
      name1Input.focus();
      modal.addEventListener('keydown', handleTrap);
    }, 60);
  }

  /* ---- Trigger click delegation ---- */
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-personalization-trigger]');
    if (!trigger) return;
    event.preventDefault();
    openEditor(trigger);
  });

  /* ---- Input event listeners ---- */
  styleInputs.forEach((input) => input.addEventListener('change', renderEditorState));
  name1Input.addEventListener('input', renderEditorState);
  name2Input.addEventListener('input', renderEditorState);
  dateInput.addEventListener('input', renderEditorState);

  /* ---- B2: Blur validation ---- */
  name1Input.addEventListener('blur', () => {
    if (name1Input.value.length > activeName1Max) name1Input.classList.add('pp-input--error');
  });
  name2Input.addEventListener('blur', () => {
    if (name2Input.value.length > activeName2Max) name2Input.classList.add('pp-input--error');
  });

  /* ---- D2: Clear buttons ---- */
  modal.addEventListener('click', (event) => {
    const clearBtn = event.target.closest('[data-personalization-clear]');
    if (!clearBtn) return;
    const field = clearBtn.dataset.personalizationClear;
    const input = modal.querySelector(`[data-personalization-input="${field}"]`);
    if (!input) return;
    input.value = '';
    input.focus();
    clearBtn.setAttribute('hidden', '');
    renderEditorState();
  });

  /* ---- Commit active state (Codex logic, preserved) ---- */
  function commitActiveState(closeModal) {
    if (!activeScope) return false;
    const error = getValidationError();
    if (error) { setError(error); return false; }

    setScopeState(activeScope, {
      style:         getSelectedStyle(),
      name1:         name1Input.value.trim(),
      name2:         name2Input.value.trim(),
      date:          dateInput.value.trim(),
      geminiSummary: getGeneratedSummary(),
      previewOpened: !pickedPanel.hasAttribute('hidden'),
      maxName1:      activeName1Max,
      maxName2:      activeName2Max,
    });
    syncScope(activeScope);

    if (closeModal) doClose();
    return true;
  }

  /* ---- Gemini generate (Codex logic, preserved + E1 spinner) ---- */
  function buildGeminiSummary(preview) {
    const parts = [];
    if (preview.headline)   parts.push(preview.headline);
    if (preview.subline)    parts.push(preview.subline);
    if (preview.dateLine)   parts.push(preview.dateLine);
    if (preview.styleNotes) parts.push(preview.styleNotes);
    return parts.join(' | ').trim();
  }

  async function generatePreview() {
    if (!activeScope || isGenerating) return;
    const blockingError = getValidationError({ requireAll: true });
    if (blockingError) { setError(blockingError); return; }

    const previousSummary = getGeneratedSummary();
    setPickedPanelVisible(true);
    isGenerating = true;
    setButtonLoading(generateButton, true); // E1
    setError('');
    generatedOutput.textContent = GENERATING_MESSAGE;
    renderEditorState();

    const payload = {
      style: getSelectedStyle(),
      name1: name1Input.value.trim(),
      name2: name2Input.value.trim(),
      date:  dateInput.value.trim(),
    };

    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = (typeof json.error === 'string' && json.error) ? json.error : `Request failed with status ${response.status}.`;
        throw new Error(msg);
      }
      const preview = json.preview || {};
      const summary = buildGeminiSummary(preview) || 'Preview generated successfully.';
      generatedOutput.textContent = summary;
      setScopeState(activeScope, {
        style: payload.style,
        name1: payload.name1, name2: payload.name2, date: payload.date,
        geminiSummary: summary,
        previewOpened: true,
        maxName1: activeName1Max, maxName2: activeName2Max,
      });
      syncScope(activeScope);
    } catch (error) {
      generatedOutput.textContent = previousSummary || DEFAULT_GENERATED_MESSAGE;
      setError(error instanceof Error ? error.message : 'Could not generate preview.');
    } finally {
      isGenerating = false;
      setButtonLoading(generateButton, false); // E1
      renderEditorState();
    }
  }

  /* ---- Button handlers ---- */
  pickButton.addEventListener('click', () => {
    const err = getValidationError({ requireAll: true });
    if (err) { setError(err); return; }
    setPickedPanelVisible(true);
    commitActiveState(false);
    renderEditorState();
  });

  generateButton.addEventListener('click', () => generatePreview());

  saveButton.addEventListener('click', () => {
    setButtonLoading(saveButton, true); // E1
    const ok = commitActiveState(false);
    if (ok) {
      setTimeout(() => {
        setButtonLoading(saveButton, false);
        doClose();
      }, 300);
    } else {
      setButtonLoading(saveButton, false);
    }
  });

  cancelButton.addEventListener('click', doClose);

  /* ---- Scope sync and context management (Codex, preserved) ---- */
  function applyStateToContext(context, state) {
    function w(prop, val) {
      const el = context.querySelector(`[data-personalization-property="${prop}"]`);
      if (el) el.value = val;
    }
    w('primary',       state.name1 || '');
    w('secondary',     state.name2 || '');
    w('style',         state.style || DEFAULT_STYLE);
    w('name1',         state.name1 || '');
    w('name2',         state.name2 || '');
    w('date',          state.date  || '');
    w('gemini_summary',state.geminiSummary || '');
    w('scope',         context.dataset.personalizationScope || '');
  }

  function isConfiguredState(state) {
    return state ? Boolean(state.name1 || state.name2 || state.date || state.geminiSummary) : false;
  }

  function updateTriggerLabels(scope) {
    if (!scope) return;
    const state        = getScopeState(scope);
    const escapedScope = selectorEscape(scope);
    document.querySelectorAll(
      `[data-personalization-trigger][data-personalization-scope="${escapedScope}"]`
    ).forEach((trigger) => {
      const labelNode    = trigger.querySelector('[data-personalization-trigger-label]');
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
    const state        = getScopeState(scope) || createDefaultState();
    const escapedScope = selectorEscape(scope);
    document.querySelectorAll(
      `[data-personalization-context][data-personalization-scope="${escapedScope}"]`
    ).forEach((context) => applyStateToContext(context, state));
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
    form.querySelectorAll('[data-personalization-trigger]').forEach((t) => {
      t.dataset.personalizationScope = scope;
    });
  }

  function hydrateContext(context) {
    const scope = resolveContextScope(context);
    if (!scope) return;
    const form = context.closest('form');
    inheritScopeForFormTriggers(form, scope);
    if (!getScopeState(scope)) {
      setScopeState(scope, {
        style: (context.querySelector('[data-personalization-property="style"]') || {}).value || DEFAULT_STYLE,
        name1: (context.querySelector('[data-personalization-property="name1"]') || {}).value
             || (context.querySelector('[data-personalization-property="primary"]') || {}).value || '',
        name2: (context.querySelector('[data-personalization-property="name2"]') || {}).value
             || (context.querySelector('[data-personalization-property="secondary"]') || {}).value || '',
        date:  (context.querySelector('[data-personalization-property="date"]')  || {}).value || '',
        geminiSummary: (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '',
        maxName1: DEFAULT_NAME1_MAX,
        maxName2: DEFAULT_NAME2_MAX,
      });
    }
    syncScope(scope);
  }

  function hydrateContexts(root) {
    root.querySelectorAll('[data-personalization-context]').forEach(hydrateContext);
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.type !== 'add-to-cart-form') return;
    const context = form.querySelector('[data-personalization-context]');
    if (!context) return;
    const scope = resolveContextScope(context);
    if (!scope) return;
    const state = getScopeState(scope);
    if (state) applyStateToContext(context, state);
  }, true);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('[data-personalization-context]')) hydrateContext(node);
        else if (node.querySelector('[data-personalization-context]')) hydrateContexts(node);
      });
    });
  });

  hydrateContexts(document);
  observer.observe(document.body, { childList: true, subtree: true });
})();
