(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const DEFAULT_STYLE = 'Style 1';
  const STYLE_VALUES = ['Style 1', 'Style 2', 'Style 3'];
  const DEFAULT_LAST_NAME_MAX = 30;
  const DEFAULT_DATE_MAX = 10;
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = ['is-style-1', 'is-style-2', 'is-style-3'];
  const PERSONALIZATION_PREVIEW_BUILD = '2026-03-09-order-stage-preview-1';
  const DEFAULT_LAST_NAME_VALUE = 'The Johnsons';
  const DEFAULT_DATE_VALUE = '03/09/2026';
  const MIN_TEXTBOX_WIDTH = 18;
  const MIN_TEXTBOX_HEIGHT = 14;
  const MIN_RENDERED_TEXTBOX_WIDTH = 5;
  const MIN_RENDERED_TEXTBOX_HEIGHT = 4;
  const TEXTBOX_TIGHT_HORIZONTAL_PADDING = 20;
  const TEXTBOX_TIGHT_VERTICAL_PADDING = 16;
  const TEXTBOX_FIT_HORIZONTAL_INSET = 24;
  const TEXTBOX_FIT_VERTICAL_INSET = 18;
  const DEFAULT_PREVIEW_TEXT_SCALE = 1.15;
  const DEFAULT_CANVAS_TEXT_WIDTH_RATIO = 0.94;
  const DEFAULT_CANVAS_TEXT_HEIGHT_RATIO = 0.84;
  const DEFAULT_SAFE_AREA_TOLERANCE = 1.4;
  const TEXTBOX_LAYOUT_CHANGE_EPSILON = 0.18;
  const TEXTBOX_POINTER_MOVE_ACTIVATION_PX = 12;
  const SAFE_AREA_CENTER_SNAP_THRESHOLD = 1.1;
  const RENDER_SAFE_AREA_INSET = 1.1;
  const DEFAULT_ICON_SCALE = 100;
  const MIN_ICON_SIZE = 3.4;
  const MAX_ICON_SIZE = 28;
  const ICON_LAYOUT_CHANGE_EPSILON = 0.18;
  const ICON_POINTER_MOVE_ACTIVATION_PX = 10;
  const STAGE_PREVIEW_FILE_NAME_PREFIX = 'quickclips-stage-preview';
  const CUSTOM_ENGRAVING_KEYWORDS = Object.freeze(['custom engraving', 'personalization', 'personalized']);
  const DEFAULT_FLOWER_ICON_OPTIONS = Object.freeze([
    { value: 'tulip', label: 'Tulip', asset: 'quickclip-icon-tulip.svg' },
    { value: 'lily', label: 'Lily', asset: 'quickclip-icon-lily.svg' },
    { value: 'rose', label: 'Rose', asset: 'quickclip-icon-rose.svg' },
    { value: 'daisy', label: 'Daisy', asset: 'quickclip-icon-daisy.svg' },
    { value: 'lavender', label: 'Lavender', asset: 'quickclip-icon-lavender.svg' },
  ]);
  const DEFAULT_SAFE_AREA_BOUNDS = Object.freeze({
    x: 5.435,
    y: 25.143,
    w: 88.696,
    h: 42.571,
  });
  const SAFE_AREA_SCAN_PADDING = 6;
  const SAFE_AREA_BRIGHTNESS_THRESHOLD = 80;
  const ENGRAVING_AREA_ERROR = "You can't engrave here.";
  const DEFAULT_TEXT_LAYOUT = Object.freeze(buildDefaultTextLayout(DEFAULT_SAFE_AREA_BOUNDS));
  const FONT_OPTIONS = [
    { label: 'Leaner-Normal (Style 1)', family: '"Leaner-Normal", "Leaner Normal", "Segoe Script", cursive' },
    { label: 'Segoe UI (Style 1 Date)', family: '"Segoe UI", Arial, sans-serif' },
    { label: 'KG Not Sorry (Style 2)', family: '"KG Not Sorry", "KG Sorry Not Sorry", "Comic Sans MS", cursive' },
    { label: 'Leaner Thin (Style 2 Date)', family: '"Leaner Thin", "Leaner-Thin", "Segoe UI", Arial, sans-serif' },
    { label: 'Kaufmann BT (Style 3)', family: '"Kaufmann BT", "Kaufmann", "Segoe Script", cursive' },
    { label: 'KG Sorry Not Sorry Chub (Style 3 Date)', family: '"KG Sorry Not Sorry Chub", "KG Sorry Not Sorry", "Comic Sans MS", cursive' },
    { label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
    { label: 'Georgia', family: 'Georgia, "Times New Roman", serif' },
    { label: 'Times New Roman', family: '"Times New Roman", Times, serif' },
    { label: 'Trebuchet MS', family: '"Trebuchet MS", "Segoe UI", Arial, sans-serif' },
    { label: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', family: 'Tahoma, Geneva, sans-serif' },
    { label: 'Courier New', family: '"Courier New", Courier, monospace' },
    { label: 'Garamond', family: 'Garamond, Baskerville, serif' },
    { label: 'Baskerville', family: 'Baskerville, "Times New Roman", serif' },
    { label: 'Palatino Linotype', family: '"Palatino Linotype", Palatino, serif' },
    { label: 'Brush Script MT', family: '"Brush Script MT", "Segoe Script", cursive' },
    { label: 'Segoe Script', family: '"Segoe Script", "Brush Script MT", cursive' },
    { label: 'Lucida Handwriting', family: '"Lucida Handwriting", "Segoe Script", cursive' },
    { label: 'Comic Sans MS', family: '"Comic Sans MS", "Trebuchet MS", cursive' },
  ];
  const STYLE_FONT_PRESETS = {
    'Style 1': {
      nameFamily: '"Leaner-Normal", "Leaner Normal", "Segoe Script", cursive',
      dateFamily: '"Segoe UI", Arial, sans-serif',
      nameSize: 62,
      dateSize: 40,
      boxWidth: 70,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
    },
    'Style 2': {
      nameFamily: '"KG Not Sorry", "KG Sorry Not Sorry", "Comic Sans MS", cursive',
      dateFamily: '"Leaner Thin", "Leaner-Thin", "Segoe UI", Arial, sans-serif',
      nameSize: 58,
      dateSize: 38,
      boxWidth: 68,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
    },
    'Style 3': {
      nameFamily: '"Kaufmann BT", "Kaufmann", "Segoe Script", cursive',
      dateFamily: '"KG Sorry Not Sorry Chub", "KG Sorry Not Sorry", "Comic Sans MS", cursive',
      nameSize: 54,
      dateSize: 36,
      boxWidth: 66,
      rotation: 0,
      color: '#4b341f',
      dateWeight: '600',
      previewScale: 1.32,
      previewInsetX: 10,
      previewInsetY: 10,
      canvasWidthRatio: 0.99,
      canvasHeightRatio: 0.92,
      safeAreaTolerance: 2.4,
    },
  };

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  modal.setAttribute('data-personalization-preview-build', PERSONALIZATION_PREVIEW_BUILD);
  window.QuickClipsPersonalizationPreviewBuild = PERSONALIZATION_PREVIEW_BUILD;

  const styleInputs = Array.from(modal.querySelectorAll('[data-personalization-input="style"]'));
  const lastNameInput = modal.querySelector('[data-personalization-input="lastName"]');
  const lastNameCount = modal.querySelector('[data-personalization-count="lastName"]');
  const dateInput = modal.querySelector('[data-personalization-input="date"]');
  const dateCount = modal.querySelector('[data-personalization-count="date"]');
  const lastNameFontSelect = modal.querySelector('[data-personalization-input="lastNameFont"]');
  const dateFontSelect = modal.querySelector('[data-personalization-input="dateFont"]');
  const flowerIconSelect = modal.querySelector('[data-personalization-input="flowerIcon"]');
  const iconRegistryUrl = String(flowerIconSelect?.dataset.personalizationIconRegistryUrl || '').trim();
  const deterministicLastNameBox = modal.querySelector('[data-personalization-textbox="lastName"]');
  const deterministicDateBox = modal.querySelector('[data-personalization-textbox="date"]');
  const resizeHandles = Array.from(modal.querySelectorAll('[data-personalization-resize]'));
  const clipSurface = modal.querySelector('[data-personalization-clip-surface]');
  const stageImageUrl = String(clipSurface?.dataset.personalizationStageImageUrl || '').trim();
  const safeAreaImageUrl = String(clipSurface?.dataset.personalizationSafeAreaUrl || '').trim();
  const stylePreviewImage = modal.querySelector('[data-personalization-style-preview-image]');
  const deterministicOverlay = modal.querySelector('[data-personalization-deterministic-overlay]');
  const deterministicLastName = modal.querySelector('[data-personalization-deterministic-last-name]');
  const deterministicDate = modal.querySelector('[data-personalization-deterministic-date]');
  const deterministicIcon = modal.querySelector('[data-personalization-deterministic-icon]');
  const deterministicIconImage = modal.querySelector('[data-personalization-deterministic-icon-image]');
  const iconResizeHandle = modal.querySelector('[data-personalization-icon-resize]');
  const safeAreaWarning = modal.querySelector('[data-personalization-safe-area-warning]');
  const safeAreaBoundary = modal.querySelector('[data-personalization-safe-area-boundary]');
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
    !dateInput ||
    !lastNameFontSelect ||
    !dateFontSelect ||
    !flowerIconSelect ||
    !deterministicLastNameBox ||
    !deterministicDateBox ||
    resizeHandles.length < 2 ||
    !clipSurface ||
    !stylePreviewImage ||
    !deterministicOverlay ||
    !deterministicLastName ||
    !deterministicDate ||
    !deterministicIcon ||
    !deterministicIconImage ||
    !iconResizeHandle ||
    !safeAreaWarning ||
    !safeAreaBoundary ||
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
  const iconImagePayloadCache = new Map();
  const variantKeywordIndexByElement = new WeakMap();
  const pendingEligibilityScopes = new Set();

  let activeScope = '';
  let activeLastNameMax = DEFAULT_LAST_NAME_MAX;
  let activeDateMax = DEFAULT_DATE_MAX;
  let isGenerating = false;
  let generationErrorMessage = '';
  let generatedImageData = '';
  let activeSafeAreaBounds = cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
  let safeAreaBoundsPromise = null;
  let activeTextLayout = createDefaultTextLayout();
  let initialTextLayout = cloneTextLayout(activeTextLayout);
  let activeIconLayout = createDefaultIconLayout(activeTextLayout);
  let initialIconLayout = { ...activeIconLayout };
  let pendingFlowerIconValue = '';
  let boxInteraction = null;
  let iconInteraction = null;
  let selectedTextboxKey = '';
  let isIconSelected = false;
  let activeEditorSessionId = 0;
  let shouldValidateEngravingBounds = false;
  let hasUserMovedTextInCurrentSession = false;
  const textMeasureCanvas = document.createElement('canvas');
  const textMeasureContext = textMeasureCanvas.getContext('2d');
  const defaultGenerateButtonText = generateButtonLabel
    ? String(generateButtonLabel.textContent || '').trim() || 'Generate'
    : String(generateButton.textContent || '').trim() || 'Generate';

  function createDefaultTextLayout() {
    const defaultLayout = buildDefaultTextLayout(activeSafeAreaBounds);
    return {
      lastName: { ...defaultLayout.lastName },
      date: { ...defaultLayout.date },
    };
  }

  function cloneTextLayout(layout) {
    const source = layout || createDefaultTextLayout();
    return {
      lastName: { ...source.lastName },
      date: { ...source.date },
    };
  }

  function createDefaultIconLayout(textLayout) {
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const layout = sanitizeTextLayout(textLayout || activeTextLayout || createDefaultTextLayout());
    const dateLayout = layout.date || DEFAULT_TEXT_LAYOUT.date;
    const size = clampNumber((dateLayout.h * DEFAULT_ICON_SCALE) / 100, MIN_ICON_SIZE, Math.min(MAX_ICON_SIZE, safeArea.h * 0.36));
    const rightCenterX = dateLayout.x + dateLayout.w + size * 0.72;
    const fallbackCenterX = dateLayout.x - size * 0.72;
    const minCenterX = safeArea.x + size / 2;
    const maxCenterX = safeArea.x + safeArea.w - size / 2;
    const minCenterY = safeArea.y + size / 2;
    const maxCenterY = safeArea.y + safeArea.h - size / 2;
    let centerX = rightCenterX;
    if (centerX > maxCenterX) {
      centerX = fallbackCenterX;
    }
    return {
      x: Number(clampNumber(centerX, minCenterX, maxCenterX).toFixed(3)),
      y: Number(clampNumber(dateLayout.y + dateLayout.h / 2, minCenterY, maxCenterY).toFixed(3)),
      size: Number(size.toFixed(3)),
    };
  }

  function sanitizeIconLayout(layout) {
    const fallback = createDefaultIconLayout(activeTextLayout);
    const raw = layout || fallback;
    const size = clampNumber(
      Number.isFinite(Number(raw.size)) ? Number(raw.size) : fallback.size,
      MIN_ICON_SIZE,
      MAX_ICON_SIZE
    );
    const half = size / 2;
    const x = clampNumber(Number.isFinite(Number(raw.x)) ? Number(raw.x) : fallback.x, half, 100 - half);
    const y = clampNumber(Number.isFinite(Number(raw.y)) ? Number(raw.y) : fallback.y, half, 100 - half);
    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      size: Number(size.toFixed(3)),
    };
  }

  function clampIconLayoutToSafeArea(layout) {
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const normalized = sanitizeIconLayout(layout);
    const size = clampNumber(
      normalized.size,
      MIN_ICON_SIZE,
      Math.min(MAX_ICON_SIZE, Math.max(MIN_ICON_SIZE, Math.min(safeArea.w, safeArea.h)))
    );
    const half = size / 2;
    const minX = safeArea.x + half;
    const maxX = safeArea.x + safeArea.w - half;
    const minY = safeArea.y + half;
    const maxY = safeArea.y + safeArea.h - half;
    return {
      x: Number(clampNumber(normalized.x, minX, Math.max(minX, maxX)).toFixed(3)),
      y: Number(clampNumber(normalized.y, minY, Math.max(minY, maxY)).toFixed(3)),
      size: Number(size.toFixed(3)),
    };
  }

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

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function cloneSafeAreaBounds(bounds) {
    const source = bounds || DEFAULT_SAFE_AREA_BOUNDS;
    return {
      x: Number(source.x),
      y: Number(source.y),
      w: Number(source.w),
      h: Number(source.h),
    };
  }

  function sanitizeSafeAreaBounds(bounds) {
    const fallback = DEFAULT_SAFE_AREA_BOUNDS;
    const raw = bounds || fallback;
    const width = clampNumber(Number.isFinite(Number(raw.w)) ? Number(raw.w) : fallback.w, 1, 100);
    const height = clampNumber(Number.isFinite(Number(raw.h)) ? Number(raw.h) : fallback.h, 1, 100);
    const x = clampNumber(Number.isFinite(Number(raw.x)) ? Number(raw.x) : fallback.x, 0, 100 - width);
    const y = clampNumber(Number.isFinite(Number(raw.y)) ? Number(raw.y) : fallback.y, 0, 100 - height);
    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      w: Number(width.toFixed(3)),
      h: Number(height.toFixed(3)),
    };
  }

  function buildDefaultTextLayout(safeArea) {
    const bounds = sanitizeSafeAreaBounds(safeArea);
    const lastNameWidth = Math.max(MIN_TEXTBOX_WIDTH + 10, bounds.w * 0.84);
    const dateWidth = Math.max(MIN_TEXTBOX_WIDTH + 2, bounds.w * 0.46);
    const lastNameHeight = Math.max(MIN_TEXTBOX_HEIGHT + 4, bounds.h * 0.4);
    const dateHeight = Math.max(MIN_TEXTBOX_HEIGHT, bounds.h * 0.28);
    const lastNameX = bounds.x + (bounds.w - lastNameWidth) / 2;
    const dateX = bounds.x + (bounds.w - dateWidth) / 2;
    const lastNameY = bounds.y + bounds.h * 0.08;
    const maxDateY = bounds.y + bounds.h - dateHeight;
    const dateY = Math.min(bounds.y + bounds.h * 0.62, maxDateY);

    return {
      lastName: Object.freeze({
        x: Number(lastNameX.toFixed(3)),
        y: Number(lastNameY.toFixed(3)),
        w: Number(lastNameWidth.toFixed(3)),
        h: Number(lastNameHeight.toFixed(3)),
      }),
      date: Object.freeze({
        x: Number(dateX.toFixed(3)),
        y: Number(dateY.toFixed(3)),
        w: Number(dateWidth.toFixed(3)),
        h: Number(dateHeight.toFixed(3)),
      }),
    };
  }

  function parseCssPercentage(rawValue, fallbackRatio) {
    const normalized = String(rawValue || '').trim();
    if (!normalized) return fallbackRatio;
    if (normalized.endsWith('%')) {
      const parsedPercent = Number.parseFloat(normalized.slice(0, -1));
      if (Number.isFinite(parsedPercent)) {
        return clampNumber(parsedPercent / 100, 0, 1);
      }
      return fallbackRatio;
    }

    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return fallbackRatio;
    if (parsed > 1) {
      return clampNumber(parsed / 100, 0, 1);
    }
    return clampNumber(parsed, 0, 1);
  }

  function getStagePreviewTransform() {
    const computedStyles = window.getComputedStyle(clipSurface);
    const zoomRaw = Number.parseFloat(computedStyles.getPropertyValue('--quickclip-stage-zoom'));
    const zoom = Number.isFinite(zoomRaw) && zoomRaw > 0 ? zoomRaw : 1;
    const focusX = parseCssPercentage(computedStyles.getPropertyValue('--quickclip-stage-focus-x'), 0.5);
    const focusY = parseCssPercentage(computedStyles.getPropertyValue('--quickclip-stage-focus-y'), 0.5);
    return {
      zoom,
      focusX,
      focusY,
    };
  }

  function getCanvasTextMetrics(ctx, text, options) {
    const normalizedText = String(text || '').trim() || ' ';
    const fontSize = Math.max(1, Number(options.fontSize || 10));
    const fontFamily = String(options.fontFamily || 'sans-serif');
    const fontWeight = String(options.fontWeight || '600');

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(normalizedText);
    const actualLeft = Math.max(0, Number(metrics.actualBoundingBoxLeft || 0));
    const actualRight = Math.max(0, Number(metrics.actualBoundingBoxRight || 0));
    const actualAscent = Math.max(0, Number(metrics.actualBoundingBoxAscent || 0));
    const actualDescent = Math.max(0, Number(metrics.actualBoundingBoxDescent || 0));
    return {
      width: Math.max(1, Number(metrics.width || 0), actualLeft + actualRight),
      height: Math.max(1, actualAscent + actualDescent, fontSize * 0.92),
      left: actualLeft,
      right: actualRight,
      ascent: actualAscent,
      descent: actualDescent,
    };
  }

  function sanitizeTextLayout(layout) {
    const next = cloneTextLayout(layout);
    ['lastName', 'date'].forEach((key) => {
      const fallback = DEFAULT_TEXT_LAYOUT[key];
      const raw = next[key] || fallback;
      const width = clampNumber(
        Number.isFinite(Number(raw.w)) ? Number(raw.w) : fallback.w,
        MIN_TEXTBOX_WIDTH,
        98
      );
      const height = clampNumber(
        Number.isFinite(Number(raw.h)) ? Number(raw.h) : fallback.h,
        MIN_TEXTBOX_HEIGHT,
        90
      );
      const x = clampNumber(Number.isFinite(Number(raw.x)) ? Number(raw.x) : fallback.x, 0, 100 - width);
      const y = clampNumber(Number.isFinite(Number(raw.y)) ? Number(raw.y) : fallback.y, 0, 100 - height);
      next[key] = {
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        w: Number(width.toFixed(3)),
        h: Number(height.toFixed(3)),
      };
    });
    return next;
  }

  function clampTextboxToSafeArea(layout, safeArea) {
    if (!layout) return null;
    const width = clampNumber(Number(layout.w), MIN_TEXTBOX_WIDTH, Math.max(MIN_TEXTBOX_WIDTH, safeArea.w));
    const height = clampNumber(Number(layout.h), MIN_TEXTBOX_HEIGHT, Math.max(MIN_TEXTBOX_HEIGHT, safeArea.h));
    const maxX = safeArea.x + safeArea.w - width;
    const maxY = safeArea.y + safeArea.h - height;
    const x = clampNumber(Number(layout.x), safeArea.x, maxX);
    const y = clampNumber(Number(layout.y), safeArea.y, maxY);
    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      w: Number(width.toFixed(3)),
      h: Number(height.toFixed(3)),
    };
  }

  function clampTextLayoutToSafeArea(layout) {
    const normalizedLayout = sanitizeTextLayout(layout);
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    return {
      lastName: clampTextboxToSafeArea(normalizedLayout.lastName, safeArea),
      date: clampTextboxToSafeArea(normalizedLayout.date, safeArea),
    };
  }

  function populateFontSelect(selectElement) {
    selectElement.innerHTML = '';
    FONT_OPTIONS.forEach((option) => {
      const node = document.createElement('option');
      node.value = option.family;
      node.textContent = option.label;
      selectElement.appendChild(node);
    });
  }

  function setSelectValue(selectElement, value, fallbackValue) {
    const resolvedValue = String(value || fallbackValue || '').trim();
    const hasOption = Array.from(selectElement.options).some((option) => option.value === resolvedValue);
    if (hasOption) {
      selectElement.value = resolvedValue;
      return resolvedValue;
    }
    selectElement.value = String(fallbackValue || '').trim();
    return selectElement.value;
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

  function getStyleLayoutSettings(styleValue) {
    const stylePreset = getStylePreset(styleValue);

    function resolvePositiveNumber(value, fallback) {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    return {
      previewScale: resolvePositiveNumber(stylePreset.previewScale, DEFAULT_PREVIEW_TEXT_SCALE),
      previewInsetX: resolvePositiveNumber(stylePreset.previewInsetX, TEXTBOX_FIT_HORIZONTAL_INSET),
      previewInsetY: resolvePositiveNumber(stylePreset.previewInsetY, TEXTBOX_FIT_VERTICAL_INSET),
      canvasWidthRatio: resolvePositiveNumber(stylePreset.canvasWidthRatio, DEFAULT_CANVAS_TEXT_WIDTH_RATIO),
      canvasHeightRatio: resolvePositiveNumber(stylePreset.canvasHeightRatio, DEFAULT_CANVAS_TEXT_HEIGHT_RATIO),
      safeAreaTolerance: resolvePositiveNumber(stylePreset.safeAreaTolerance, DEFAULT_SAFE_AREA_TOLERANCE),
    };
  }

  function normalizeIconValue(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function humanizeIconValue(value) {
    return String(value || '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  }

  function resolveIconAssetUrl(assetPath) {
    const normalizedAssetPath = String(assetPath || '').trim();
    if (!normalizedAssetPath) return '';
    if (/^https?:\/\//i.test(normalizedAssetPath) || normalizedAssetPath.startsWith('/')) {
      return normalizedAssetPath;
    }
    if (iconRegistryUrl) {
      try {
        return new URL(normalizedAssetPath, iconRegistryUrl).toString();
      } catch (error) {
        return normalizedAssetPath;
      }
    }
    return normalizedAssetPath;
  }

  function readFlowerIconOptionsFromSelect() {
    const options = [];
    Array.from(flowerIconSelect.options).forEach((optionElement) => {
      const value = normalizeIconValue(optionElement.value);
      if (!value) return;
      const url = String(optionElement.dataset.iconUrl || '').trim();
      if (!url) return;
      const label = String(optionElement.textContent || '').trim() || humanizeIconValue(value);
      options.push({ value, label, url });
    });
    return options;
  }

  function normalizeFlowerIconRegistryEntries(entries) {
    const normalizedEntries = [];
    const seen = new Set();
    const inputEntries = Array.isArray(entries) ? entries : [];
    inputEntries.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const value = normalizeIconValue(entry.value || entry.key || entry.slug || entry.name || entry.label);
      if (!value || seen.has(value)) return;
      const directUrl = String(entry.url || '').trim();
      const asset = String(entry.asset || entry.file || '').trim();
      const url = directUrl || resolveIconAssetUrl(asset);
      if (!url) return;
      const label = String(entry.label || entry.name || '').trim() || humanizeIconValue(value);
      normalizedEntries.push({ value, label, url });
      seen.add(value);
    });
    return normalizedEntries;
  }

  function setFlowerIconOptions(options, preferredValue) {
    const normalizedOptions = normalizeFlowerIconRegistryEntries(options);
    flowerIconSelect.innerHTML = '';
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'No icon';
    flowerIconSelect.appendChild(emptyOption);

    normalizedOptions.forEach((entry) => {
      const optionElement = document.createElement('option');
      optionElement.value = entry.value;
      optionElement.textContent = entry.label;
      optionElement.dataset.iconUrl = entry.url;
      flowerIconSelect.appendChild(optionElement);
    });

    return setFlowerIconValue(preferredValue || pendingFlowerIconValue || flowerIconSelect.value || '');
  }

  async function loadFlowerIconRegistryOptions() {
    const fallbackOptions = readFlowerIconOptionsFromSelect();
    const defaultOptions = normalizeFlowerIconRegistryEntries(
      DEFAULT_FLOWER_ICON_OPTIONS.map((entry) => ({
        value: entry.value,
        label: entry.label,
        asset: entry.asset,
      }))
    );
    const currentValue = pendingFlowerIconValue || flowerIconSelect.value;
    setFlowerIconOptions(fallbackOptions.length ? fallbackOptions : defaultOptions, currentValue);

    if (!iconRegistryUrl) return;

    try {
      const response = await fetch(iconRegistryUrl, { cache: 'no-store' });
      if (!response.ok) return;
      const json = await response.json();
      const sourceEntries = Array.isArray(json) ? json : Array.isArray(json.icons) ? json.icons : [];
      const customOptions = normalizeFlowerIconRegistryEntries(sourceEntries);
      if (!customOptions.length) return;

      const mergedByValue = new Map();
      [...defaultOptions, ...customOptions].forEach((entry) => {
        if (!entry || !entry.value || !entry.url) return;
        mergedByValue.set(entry.value, entry);
      });
      setFlowerIconOptions(Array.from(mergedByValue.values()), currentValue);
    } catch (error) {
      // keep fallback options if icon registry cannot be fetched
    }
  }

  function normalizeFlowerIcon(value) {
    const normalizedValue = normalizeIconValue(value);
    if (!normalizedValue) return '';
    const hasOption = Array.from(flowerIconSelect.options).some((option) => option.value === normalizedValue);
    return hasOption ? normalizedValue : '';
  }

  function setFlowerIconValue(value) {
    const normalizedValue = normalizeIconValue(value);
    const hasOption = normalizedValue
      ? Array.from(flowerIconSelect.options).some((option) => option.value === normalizedValue)
      : false;
    if (hasOption) {
      pendingFlowerIconValue = '';
      flowerIconSelect.value = normalizedValue;
      return flowerIconSelect.value;
    }
    pendingFlowerIconValue = normalizedValue || '';
    flowerIconSelect.value = '';
    return flowerIconSelect.value;
  }

  function getSelectedFlowerIconValue() {
    return normalizeFlowerIcon(flowerIconSelect.value);
  }

  function getSelectedFlowerIconUrl(value) {
    const normalizedValue = normalizeFlowerIcon(value);
    if (!normalizedValue) return '';
    const option = Array.from(flowerIconSelect.options).find((candidate) => candidate.value === normalizedValue);
    if (!option) return '';
    return String(option.dataset.iconUrl || '').trim();
  }

  function applyIconLayout(layoutOverride) {
    const layout = sanitizeIconLayout(layoutOverride || activeIconLayout);
    activeIconLayout = layout;
    deterministicIcon.style.setProperty('--icon-x', `${layout.x}%`);
    deterministicIcon.style.setProperty('--icon-y', `${layout.y}%`);
    deterministicIcon.style.setProperty('--icon-size', `${layout.size}%`);
  }

  function syncIconSelectionState() {
    deterministicIcon.classList.toggle('is-selected', isIconSelected);
  }

  function setIconSelected(selected) {
    const nextValue = Boolean(selected);
    if (isIconSelected === nextValue) return;
    isIconSelected = nextValue;
    syncIconSelectionState();
  }

  function renderFlowerIcon() {
    const flowerIconValue = getSelectedFlowerIconValue();
    const flowerIconUrl = getSelectedFlowerIconUrl(flowerIconValue);
    if (!flowerIconValue || !flowerIconUrl) {
      deterministicIcon.setAttribute('hidden', '');
      deterministicIconImage.removeAttribute('src');
      setIconSelected(false);
      return;
    }

    applyIconLayout(activeIconLayout);
    deterministicIconImage.src = flowerIconUrl;
    deterministicIcon.removeAttribute('hidden');
  }

  function setTextboxCenterSnapState(boxKey, isSnapped) {
    const boxElement = getTextboxByKey(boxKey);
    if (!boxElement) return;
    boxElement.classList.toggle('is-center-snapped', Boolean(isSnapped));
  }

  populateFontSelect(lastNameFontSelect);
  populateFontSelect(dateFontSelect);
  loadFlowerIconRegistryOptions();

  function selectorEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return value.replace(/["\\]/g, '\\$&');
  }

  function hasCustomEngravingKeyword(value) {
    const normalizedValue = String(value || '').trim().toLowerCase();
    if (!normalizedValue) return false;
    return CUSTOM_ENGRAVING_KEYWORDS.some((keyword) => normalizedValue.includes(keyword));
  }

  function getVariantKeywordIndex(variantSelectsElement) {
    if (!variantSelectsElement) return null;
    if (variantKeywordIndexByElement.has(variantSelectsElement)) {
      return variantKeywordIndexByElement.get(variantSelectsElement);
    }

    let keywordIndex = null;
    const variantJsonNode = variantSelectsElement.querySelector('script[type="application/json"]');
    if (variantJsonNode) {
      try {
        const parsedVariantData = JSON.parse(String(variantJsonNode.textContent || '[]'));
        if (Array.isArray(parsedVariantData)) {
          keywordIndex = new Map();
          parsedVariantData.forEach((variant) => {
            if (!variant || variant.id == null) return;
            const variantId = String(variant.id);
            const optionValues = Array.isArray(variant.options) ? variant.options.join('|') : '';
            const variantTokens = `${String(variant.title || '')}|${optionValues}`;
            keywordIndex.set(variantId, variantTokens);
          });
        }
      } catch (error) {
        keywordIndex = null;
      }
    }

    variantKeywordIndexByElement.set(variantSelectsElement, keywordIndex);
    return keywordIndex;
  }

  function getVariantSelectsCandidatesForForm(formElement) {
    if (!formElement) return [];
    const candidates = new Set();
    const sectionElement = formElement.closest('section');
    if (sectionElement) {
      sectionElement.querySelectorAll('variant-selects').forEach((variantSelectsElement) => {
        candidates.add(variantSelectsElement);
      });
    }

    const quickAddModal = formElement.closest('quick-add-modal');
    if (quickAddModal) {
      quickAddModal.querySelectorAll('variant-selects').forEach((variantSelectsElement) => {
        candidates.add(variantSelectsElement);
      });
    }

    const sectionFromFormId = String(formElement.id || '').replace(/^product-form-/, '');
    if (sectionFromFormId) {
      document
        .querySelectorAll(`variant-selects[data-section="${selectorEscape(sectionFromFormId)}"]`)
        .forEach((variantSelectsElement) => {
          candidates.add(variantSelectsElement);
        });
    }

    if (!candidates.size) {
      document.querySelectorAll('variant-selects').forEach((variantSelectsElement) => {
        candidates.add(variantSelectsElement);
      });
    }

    return Array.from(candidates);
  }

  function hasCustomEngravingVariantForId(formElement, variantId) {
    const normalizedVariantId = String(variantId || '').trim();
    if (!normalizedVariantId) return false;
    const variantSelectsCandidates = getVariantSelectsCandidatesForForm(formElement);
    return variantSelectsCandidates.some((variantSelectsElement) => {
      const keywordIndex = getVariantKeywordIndex(variantSelectsElement);
      if (!keywordIndex) return false;
      const variantTokens = keywordIndex.get(normalizedVariantId);
      return hasCustomEngravingKeyword(variantTokens);
    });
  }

  function getSelectedFormOptionValues(formElement) {
    if (!formElement) return [];
    const selectedValues = [];

    formElement.querySelectorAll('fieldset').forEach((fieldsetElement) => {
      const selectedRadio = fieldsetElement.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        selectedValues.push(String(selectedRadio.value || '').trim());
      }
    });

    formElement.querySelectorAll('select').forEach((selectElement) => {
      const selectedOption = selectElement.selectedOptions && selectElement.selectedOptions.length
        ? selectElement.selectedOptions[0]
        : null;
      if (selectedOption) {
        selectedValues.push(String(selectedOption.value || selectedOption.textContent || '').trim());
      } else {
        selectedValues.push(String(selectElement.value || '').trim());
      }
    });

    return selectedValues;
  }

  function isCustomEngravingSelectedForForm(formElement) {
    if (!formElement) return false;
    const selectedValues = getSelectedFormOptionValues(formElement);
    if (selectedValues.length) {
      return selectedValues.some((value) => hasCustomEngravingKeyword(value));
    }

    const variantInput = formElement.querySelector('input[name="id"]');
    if (variantInput) {
      const variantToken = String(variantInput.dataset.variantTitle || variantInput.value || '').trim();
      if (hasCustomEngravingKeyword(variantToken)) {
        return true;
      }
      if (hasCustomEngravingVariantForId(formElement, variantInput.value)) {
        return true;
      }
    }

    return false;
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
    const defaultPreset = getStylePreset(DEFAULT_STYLE);
    return {
      style: DEFAULT_STYLE,
      lastName: DEFAULT_LAST_NAME_VALUE,
      date: DEFAULT_DATE_VALUE,
      lastNameFont: defaultPreset.nameFamily,
      dateFont: defaultPreset.dateFamily,
      flowerIcon: '',
      textLayout: createDefaultTextLayout(),
      iconLayout: createDefaultIconLayout(createDefaultTextLayout()),
      geminiSummary: '',
      generatedImage: '',
      stagePreviewDataUrl: '',
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
      lastNameFont: String(nextState.lastNameFont ?? currentState.lastNameFont ?? '').trim(),
      dateFont: String(nextState.dateFont ?? currentState.dateFont ?? '').trim(),
      flowerIcon: normalizeFlowerIcon(nextState.flowerIcon ?? currentState.flowerIcon),
      textLayout: clampTextLayoutToSafeArea(nextState.textLayout ?? currentState.textLayout),
      iconLayout: clampIconLayoutToSafeArea(
        nextState.iconLayout ?? currentState.iconLayout ?? createDefaultIconLayout(nextState.textLayout ?? currentState.textLayout)
      ),
      geminiSummary: String(nextState.geminiSummary ?? currentState.geminiSummary ?? '').trim(),
      generatedImage: String(nextState.generatedImage ?? currentState.generatedImage ?? '').trim(),
      stagePreviewDataUrl: String(nextState.stagePreviewDataUrl ?? currentState.stagePreviewDataUrl ?? '').trim(),
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

  function applyStyleDefaultFonts(styleValue) {
    const stylePreset = getStylePreset(styleValue);
    setSelectValue(lastNameFontSelect, stylePreset.nameFamily, stylePreset.nameFamily);
    setSelectValue(dateFontSelect, stylePreset.dateFamily, stylePreset.dateFamily);
  }

  function getActiveFontFamilies(styleValue) {
    const stylePreset = getStylePreset(styleValue);
    return {
      lastName: setSelectValue(lastNameFontSelect, lastNameFontSelect.value, stylePreset.nameFamily),
      date: setSelectValue(dateFontSelect, dateFontSelect.value, stylePreset.dateFamily),
    };
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

  function parseImageDataUrl(dataUrl) {
    const normalized = String(dataUrl || '').trim();
    const match = normalized.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) return null;
    const mimeType = String(match[1] || '').trim().toLowerCase();
    const base64Data = String(match[2] || '').trim();
    if (!mimeType.startsWith('image/') || !base64Data) return null;
    return { mimeType, base64Data };
  }

  function dataUrlToFile(dataUrl, fileName) {
    const parsed = parseImageDataUrl(dataUrl);
    if (!parsed) return null;

    const binary = window.atob(parsed.base64Data);
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new File([bytes], fileName, {
      type: parsed.mimeType,
      lastModified: Date.now(),
    });
  }

  function sanitizeFileNameSegment(value) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || 'custom';
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not load style image for context generation.'));
      image.src = source;
    });
  }

  function extractSafeAreaBoundsFromImage(image) {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }

    ctx.drawImage(image, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = SAFE_AREA_SCAN_PADDING; y < height - SAFE_AREA_SCAN_PADDING; y += 1) {
      for (let x = SAFE_AREA_SCAN_PADDING; x < width - SAFE_AREA_SCAN_PADDING; x += 1) {
        const index = (y * width + x) * 4;
        const alpha = Number(data[index + 3] || 0);
        if (alpha < 1) continue;

        const brightness = (Number(data[index] || 0) + Number(data[index + 1] || 0) + Number(data[index + 2] || 0)) / 3;
        if (brightness > SAFE_AREA_BRIGHTNESS_THRESHOLD) continue;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }

    return sanitizeSafeAreaBounds({
      x: (minX / width) * 100,
      y: (minY / height) * 100,
      w: ((maxX - minX + 1) / width) * 100,
      h: ((maxY - minY + 1) / height) * 100,
    });
  }

  async function resolveSafeAreaBounds() {
    if (!safeAreaImageUrl) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }

    try {
      const response = await fetch(safeAreaImageUrl, { cache: 'force-cache' });
      if (!response.ok) {
        return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
      }

      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      const image = await loadImage(dataUrl);
      return extractSafeAreaBoundsFromImage(image);
    } catch (error) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }
  }

  function ensureSafeAreaBounds() {
    if (safeAreaBoundsPromise) {
      return safeAreaBoundsPromise;
    }

    safeAreaBoundsPromise = resolveSafeAreaBounds()
      .then((bounds) => {
        activeSafeAreaBounds = sanitizeSafeAreaBounds(bounds);
        applySafeAreaBoundaryLayout();
        return cloneSafeAreaBounds(activeSafeAreaBounds);
      })
      .catch(() => cloneSafeAreaBounds(activeSafeAreaBounds));

    return safeAreaBoundsPromise;
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

  async function getIconImagePayload(iconUrl) {
    const normalizedIconUrl = String(iconUrl || '').trim();
    if (!normalizedIconUrl) return null;
    if (iconImagePayloadCache.has(normalizedIconUrl)) {
      return iconImagePayloadCache.get(normalizedIconUrl) || null;
    }

    try {
      const response = await fetch(normalizedIconUrl, { cache: 'force-cache' });
      if (!response.ok) return null;

      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      if (!base64Data) return null;

      const payload = {
        mimeType: blob.type || 'image/svg+xml',
        data: base64Data,
        url: normalizedIconUrl,
        dataUrl,
      };
      iconImagePayloadCache.set(normalizedIconUrl, payload);
      return payload;
    } catch (error) {
      return null;
    }
  }

  function resolveBestFitFontSize(ctx, text, options) {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) return options.minSize || 8;

    const minSize = Math.max(1, Number(options.minSize || 8));
    const maxSize = Math.max(minSize, Number(options.maxSize || minSize));
    const maxWidth = Math.max(1, Number(options.maxWidth || 1));
    const maxHeight = Math.max(1, Number(options.maxHeight || maxSize));
    const fontWeight = options.fontWeight || '600';
    const fontFamily = options.fontFamily || 'sans-serif';
    const lineHeightRatio = Number(options.lineHeightRatio || 1.06);

    let low = minSize;
    let high = maxSize;
    let best = minSize;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const metrics = getCanvasTextMetrics(ctx, trimmedText, {
        fontSize: mid,
        fontFamily,
        fontWeight,
      });
      const width = metrics.width;
      const height = Math.max(metrics.height, mid * lineHeightRatio);
      if (width <= maxWidth && height <= maxHeight) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return best;
  }

  function drawFittedText(ctx, text, options) {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) return options.minSize || 8;

    const fontSize = resolveBestFitFontSize(ctx, trimmedText, options);
    const fontWeight = options.fontWeight || '600';
    const fontFamily = options.fontFamily || 'sans-serif';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillText(trimmedText, options.x, options.y);
    return fontSize;
  }

  async function buildDeterministicContextImagePayload(
    styleValue,
    styleImagePayload,
    lastNameValue,
    dateValue,
    textLayout,
    fontFamilies,
    flowerIconConfig,
    iconLayout
  ) {
    if (!styleImagePayload || !styleImagePayload.dataUrl) return null;
    const stylePreset = getStylePreset(styleValue);
    const styleLayoutSettings = getStyleLayoutSettings(styleValue);
    const layout = sanitizeTextLayout(textLayout);
    const stageImage = await loadImage(styleImagePayload.dataUrl);
    const width = stageImage.naturalWidth || stageImage.width;
    const height = stageImage.naturalHeight || stageImage.height;
    if (!width || !height) return null;
    const lastNameFont = String(fontFamilies?.lastName || stylePreset.nameFamily || '').trim() || stylePreset.nameFamily;
    const dateFont = String(fontFamilies?.date || stylePreset.dateFamily || '').trim() || stylePreset.dateFamily;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(stageImage, 0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = stylePreset.color;

    const surfaceWidth = Math.max(1, clipSurface.clientWidth || width);
    const surfaceHeight = Math.max(1, clipSurface.clientHeight || height);
    const imageAspect = width / height;
    const surfaceAspect = surfaceWidth / surfaceHeight;
    const stagePreviewTransform = getStagePreviewTransform();
    let renderedWidth = surfaceWidth;
    let renderedHeight = surfaceHeight;
    let offsetX = 0;
    let offsetY = 0;
    if (surfaceAspect > imageAspect) {
      renderedHeight = surfaceHeight;
      renderedWidth = renderedHeight * imageAspect;
      offsetX = (surfaceWidth - renderedWidth) / 2;
    } else {
      renderedWidth = surfaceWidth;
      renderedHeight = renderedWidth / imageAspect;
      offsetY = (surfaceHeight - renderedHeight) / 2;
    }

    const zoom = Math.max(0.01, stagePreviewTransform.zoom);
    const originX = offsetX + renderedWidth * stagePreviewTransform.focusX;
    const originY = offsetY + renderedHeight * stagePreviewTransform.focusY;

    function surfacePointToNormalizedPoint(surfaceX, surfaceY) {
      const baseX = originX + (surfaceX - originX) / zoom;
      const baseY = originY + (surfaceY - originY) / zoom;
      return {
        x: clampNumber((baseX - offsetX) / renderedWidth, 0, 1),
        y: clampNumber((baseY - offsetY) / renderedHeight, 0, 1),
      };
    }

    function boxToPixels(box) {
      const surfaceX1 = (box.x / 100) * surfaceWidth;
      const surfaceY1 = (box.y / 100) * surfaceHeight;
      const surfaceX2 = ((box.x + box.w) / 100) * surfaceWidth;
      const surfaceY2 = ((box.y + box.h) / 100) * surfaceHeight;
      const point1 = surfacePointToNormalizedPoint(surfaceX1, surfaceY1);
      const point2 = surfacePointToNormalizedPoint(surfaceX2, surfaceY2);
      const normX1 = Math.min(point1.x, point2.x);
      const normY1 = Math.min(point1.y, point2.y);
      const normX2 = Math.max(point1.x, point2.x);
      const normY2 = Math.max(point1.y, point2.y);
      const x = normX1 * width;
      const y = normY1 * height;
      const w = Math.max(1, (normX2 - normX1) * width);
      const h = Math.max(1, (normY2 - normY1) * height);
      return {
        x,
        y,
        w,
        h,
      };
    }

    const nameBox = boxToPixels(layout.lastName);
    drawFittedText(ctx, lastNameValue, {
      x: nameBox.x + nameBox.w / 2,
      y: nameBox.y + nameBox.h / 2,
      maxWidth: Math.max(40, nameBox.w * styleLayoutSettings.canvasWidthRatio),
      maxHeight: Math.max(18, nameBox.h * styleLayoutSettings.canvasHeightRatio),
      minSize: 10,
      maxSize: Math.max(10, Math.round(nameBox.h * 1.6)),
      fontFamily: lastNameFont,
      fontWeight: '600',
    });

    const dateBox = boxToPixels(layout.date);
    drawFittedText(ctx, dateValue, {
      x: dateBox.x + dateBox.w / 2,
      y: dateBox.y + dateBox.h / 2,
      maxWidth: Math.max(36, dateBox.w * styleLayoutSettings.canvasWidthRatio),
      maxHeight: Math.max(16, dateBox.h * styleLayoutSettings.canvasHeightRatio),
      minSize: 9,
      maxSize: Math.max(9, Math.round(dateBox.h * 1.6)),
      fontFamily: dateFont,
      fontWeight: stylePreset.dateWeight || '600',
    });

    const flowerIconValue = normalizeFlowerIcon(flowerIconConfig?.value);
    const flowerIconUrl = String(flowerIconConfig?.url || '').trim();
    if (flowerIconValue && flowerIconUrl) {
      const resolvedIconLayout = sanitizeIconLayout(iconLayout || createDefaultIconLayout(layout));
      const iconPayload = await getIconImagePayload(flowerIconUrl);
      if (resolvedIconLayout && iconPayload && iconPayload.dataUrl) {
        try {
          const iconImage = await loadImage(iconPayload.dataUrl);
          const iconBox = boxToPixels({
            x: resolvedIconLayout.x - resolvedIconLayout.size / 2,
            y: resolvedIconLayout.y - resolvedIconLayout.size / 2,
            w: resolvedIconLayout.size,
            h: resolvedIconLayout.size,
          });
          ctx.drawImage(iconImage, iconBox.x, iconBox.y, iconBox.w, iconBox.h);
        } catch (error) {
          // Ignore icon rendering failure and continue rendering text context.
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
    if (!data) return null;

    return {
      mimeType: 'image/png',
      data,
      url: 'context://stage-overlay',
      dataUrl,
    };
  }

  function resolveStagePreviewDataUrl(value) {
    const normalized = String(value || '').trim();
    return normalized.startsWith('data:image/') ? normalized : '';
  }

  function getStateFontFamilies(state) {
    const stylePreset = getStylePreset(state?.style || DEFAULT_STYLE);
    return {
      lastName: String(state?.lastNameFont || stylePreset.nameFamily).trim() || stylePreset.nameFamily,
      date: String(state?.dateFont || stylePreset.dateFamily).trim() || stylePreset.dateFamily,
    };
  }

  async function buildStagePreviewDataUrlForState(state) {
    if (!state) return '';
    const generatedDataUrl = resolveStagePreviewDataUrl(state.generatedImage);
    if (generatedDataUrl) return generatedDataUrl;

    const style = normalizeStyle(state.style || DEFAULT_STYLE);
    const styleImagePayload = await getStyleImagePayload(style);
    if (!styleImagePayload) return '';

    const layout = clampTextLayoutToSafeArea(state.textLayout || createDefaultTextLayout());
    const iconLayout = clampIconLayoutToSafeArea(state.iconLayout || createDefaultIconLayout(layout));
    const fonts = getStateFontFamilies({ ...state, style });
    const flowerIconValue = normalizeFlowerIcon(state.flowerIcon);
    const flowerIconUrl = getSelectedFlowerIconUrl(flowerIconValue);
    const contextPayload = await buildDeterministicContextImagePayload(
      style,
      styleImagePayload,
      String(state.lastName || '').trim(),
      String(state.date || '').trim(),
      layout,
      fonts,
      { value: flowerIconValue, url: flowerIconUrl },
      iconLayout
    );

    return resolveStagePreviewDataUrl(contextPayload?.dataUrl || '');
  }

  async function ensureScopeStagePreviewDataUrl(scope, stateOverride) {
    const state = stateOverride || getScopeState(scope);
    if (!scope || !state) return '';

    const existingDataUrl = resolveStagePreviewDataUrl(state.stagePreviewDataUrl || state.generatedImage);
    if (existingDataUrl) {
      if (existingDataUrl !== state.stagePreviewDataUrl) {
        setScopeState(scope, { stagePreviewDataUrl: existingDataUrl });
      }
      return existingDataUrl;
    }

    const stagePreviewDataUrl = await buildStagePreviewDataUrlForState(state);
    if (stagePreviewDataUrl) {
      setScopeState(scope, { stagePreviewDataUrl });
      return stagePreviewDataUrl;
    }

    return '';
  }

  function clearFileInput(fileInput) {
    if (!fileInput) return;
    try {
      const emptyTransfer = new DataTransfer();
      fileInput.files = emptyTransfer.files;
    } catch (error) {
      try {
        fileInput.value = '';
      } catch (resetError) {
        // Ignore if browser blocks programmatic reset.
      }
    }
  }

  function buildStagePreviewFileName(scope, dataUrl) {
    const parsed = parseImageDataUrl(dataUrl);
    const extensionByMimeType = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const extension = parsed ? extensionByMimeType[parsed.mimeType] || 'png' : 'png';
    const scopeSegment = sanitizeFileNameSegment(scope);
    return `${STAGE_PREVIEW_FILE_NAME_PREFIX}-${scopeSegment}.${extension}`;
  }

  function attachStagePreviewFileToContext(context, stagePreviewDataUrl, scope) {
    if (!context) return false;
    const stagePreviewFileInput = context.querySelector('[data-personalization-property="stage_preview_file"]');
    if (!(stagePreviewFileInput instanceof HTMLInputElement)) {
      return false;
    }

    const normalizedDataUrl = resolveStagePreviewDataUrl(stagePreviewDataUrl);
    if (!normalizedDataUrl) {
      clearFileInput(stagePreviewFileInput);
      return false;
    }

    const previewFile = dataUrlToFile(normalizedDataUrl, buildStagePreviewFileName(scope, normalizedDataUrl));
    if (!previewFile) {
      clearFileInput(stagePreviewFileInput);
      return false;
    }

    try {
      const transfer = new DataTransfer();
      transfer.items.add(previewFile);
      stagePreviewFileInput.files = transfer.files;
      return Boolean(stagePreviewFileInput.files && stagePreviewFileInput.files.length);
    } catch (error) {
      clearFileInput(stagePreviewFileInput);
      return false;
    }
  }

  function setContextInputsEnabled(context, enabled) {
    if (!context) return;
    const shouldEnable = Boolean(enabled);
    const propertyInputs = Array.from(context.querySelectorAll('[data-personalization-property]'));
    propertyInputs.forEach((inputElement) => {
      if (!(inputElement instanceof HTMLInputElement)) return;
      inputElement.disabled = !shouldEnable;
      if (!shouldEnable && inputElement.type === 'file') {
        clearFileInput(inputElement);
      }
    });
    context.dataset.personalizationEnabled = shouldEnable ? 'true' : 'false';
  }

  function resolveScopeForm(scope) {
    if (!scope) return null;
    const escapedScope = selectorEscape(scope);
    const context = document.querySelector(
      `[data-personalization-context][data-personalization-scope="${escapedScope}"]`
    );
    if (context) {
      const formFromContext = context.closest('form');
      if (formFromContext) return formFromContext;
    }

    const trigger = document.querySelector(
      `[data-personalization-trigger][data-personalization-scope="${escapedScope}"]`
    );
    if (trigger) {
      const formFromTrigger = trigger.closest('form');
      if (formFromTrigger) return formFromTrigger;
    }

    return null;
  }

  function syncScopePersonalizationEligibility(scope) {
    if (!scope) return;
    const escapedScope = selectorEscape(scope);
    const triggers = Array.from(
      document.querySelectorAll(
        `[data-personalization-trigger][data-personalization-scope="${escapedScope}"]`
      )
    );
    const contexts = Array.from(
      document.querySelectorAll(
        `[data-personalization-context][data-personalization-scope="${escapedScope}"]`
      )
    );

    if (!triggers.length && !contexts.length) return;

    const requiresCustomOption =
      triggers.some((trigger) => String(trigger.dataset.personalizationRequiresCustomOption || '') === 'true') ||
      contexts.some((context) => String(context.dataset.personalizationRequiresCustomOption || '') === 'true');

    let isPersonalizationEnabledForScope = true;
    if (requiresCustomOption) {
      const scopeForm = resolveScopeForm(scope);
      if (scopeForm) {
        isPersonalizationEnabledForScope = isCustomEngravingSelectedForForm(scopeForm);
      } else {
        const hasInitialCustomFlag = triggers.some(
          (trigger) => String(trigger.dataset.personalizationCustomSelected || '') === 'true'
        );
        isPersonalizationEnabledForScope = hasInitialCustomFlag;
      }
    }

    triggers.forEach((trigger) => {
      trigger.toggleAttribute('hidden', !isPersonalizationEnabledForScope);
      trigger.disabled = !isPersonalizationEnabledForScope;
    });

    contexts.forEach((context) => {
      setContextInputsEnabled(context, isPersonalizationEnabledForScope);
    });

    if (!isPersonalizationEnabledForScope && activeScope === scope && modal.hasAttribute('open')) {
      closeEditor();
    }
  }

  function collectScopesForForm(formElement) {
    const scopes = new Set();
    if (!(formElement instanceof HTMLFormElement)) return scopes;

    formElement
      .querySelectorAll('[data-personalization-context][data-personalization-scope]')
      .forEach((contextElement) => {
        const scope = String(contextElement.dataset.personalizationScope || '').trim();
        if (scope) scopes.add(scope);
      });
    formElement
      .querySelectorAll('[data-personalization-trigger][data-personalization-scope]')
      .forEach((triggerElement) => {
        const scope = String(triggerElement.dataset.personalizationScope || '').trim();
        if (scope) scopes.add(scope);
      });

    return scopes;
  }

  function scheduleScopePersonalizationEligibilitySync(scope) {
    const normalizedScope = String(scope || '').trim();
    if (!normalizedScope || pendingEligibilityScopes.has(normalizedScope)) return;
    pendingEligibilityScopes.add(normalizedScope);

    const runSync = () => {
      pendingEligibilityScopes.delete(normalizedScope);
      syncScopePersonalizationEligibility(normalizedScope);
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(runSync);
      return;
    }

    window.setTimeout(runSync, 0);
  }

  function scheduleFormPersonalizationEligibilitySync(formElement) {
    const scopes = collectScopesForForm(formElement);
    scopes.forEach((scope) => {
      scheduleScopePersonalizationEligibilitySync(scope);
    });
  }

  function syncAllScopePersonalizationEligibility() {
    const scopes = new Set();
    document.querySelectorAll('[data-personalization-trigger][data-personalization-scope]').forEach((trigger) => {
      scopes.add(String(trigger.dataset.personalizationScope || ''));
    });
    document.querySelectorAll('[data-personalization-context][data-personalization-scope]').forEach((context) => {
      scopes.add(String(context.dataset.personalizationScope || ''));
    });

    scopes.forEach((scope) => {
      if (!scope) return;
      syncScopePersonalizationEligibility(scope);
    });
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

    const engravingAreaError = getEngravingAreaError();
    if (engravingAreaError) {
      return engravingAreaError;
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

  function getTextboxByKey(boxKey) {
    return boxKey === 'date' ? deterministicDateBox : deterministicLastNameBox;
  }

  function syncTextboxSelectionState() {
    [deterministicLastNameBox, deterministicDateBox].forEach((boxElement) => {
      if (!boxElement) return;
      const boxKey = boxElement.dataset.personalizationTextbox === 'date' ? 'date' : 'lastName';
      boxElement.classList.toggle('is-selected', boxKey === selectedTextboxKey);
    });
  }

  function setSelectedTextbox(boxKey) {
    const nextKey = boxKey === 'date' || boxKey === 'lastName' ? boxKey : '';
    if (selectedTextboxKey === nextKey) return;
    selectedTextboxKey = nextKey;
    syncTextboxSelectionState();
  }

  function resetEngravingWarningState() {
    shouldValidateEngravingBounds = false;
    hasUserMovedTextInCurrentSession = false;
    safeAreaWarning.setAttribute('hidden', '');
    clipSurface.classList.remove('is-warning-armed');
    clipSurface.classList.remove('is-out-of-bounds');
    setTextboxCenterSnapState('lastName', false);
    setTextboxCenterSnapState('date', false);
    deterministicIcon.classList.remove('is-active');
  }

  function armEngravingWarningState() {
    hasUserMovedTextInCurrentSession = true;
    shouldValidateEngravingBounds = true;
    clipSurface.classList.add('is-warning-armed');
  }

  function applyTextboxLayout(boxKey, layoutOverride) {
    const layout = layoutOverride || activeTextLayout[boxKey];
    const boxElement = getTextboxByKey(boxKey);
    if (!layout || !boxElement) return;

    boxElement.style.setProperty('--box-x', `${layout.x}%`);
    boxElement.style.setProperty('--box-y', `${layout.y}%`);
    boxElement.style.setProperty('--box-w', `${layout.w}%`);
    boxElement.style.setProperty('--box-h', `${layout.h}%`);
  }

  function applySafeAreaBoundaryLayout() {
    if (!safeAreaBoundary) return;
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    safeAreaBoundary.style.setProperty('--safe-area-x', `${safeArea.x}%`);
    safeAreaBoundary.style.setProperty('--safe-area-y', `${safeArea.y}%`);
    safeAreaBoundary.style.setProperty('--safe-area-w', `${safeArea.w}%`);
    safeAreaBoundary.style.setProperty('--safe-area-h', `${safeArea.h}%`);
  }

  function fitLineToContainer(lineElement, options) {
    const text = String(lineElement.textContent || '').trim();
    const parent = lineElement.parentElement;
    const insetXValue = Number(options.insetX);
    const insetYValue = Number(options.insetY);
    const insetX = Number.isFinite(insetXValue) ? Math.max(0, insetXValue) : TEXTBOX_FIT_HORIZONTAL_INSET;
    const insetY = Number.isFinite(insetYValue) ? Math.max(0, insetYValue) : TEXTBOX_FIT_VERTICAL_INSET;
    const maxWidth = Math.max(24, (parent ? parent.clientWidth : lineElement.clientWidth) - insetX);
    const maxHeight = Math.max(12, (parent ? parent.clientHeight : lineElement.clientHeight) - insetY);
    const minPx = Number(options.minPx || 8);
    const maxPx = Number(options.maxPx || Math.max(60, maxHeight * 2));
    const fontFamily = String(options.fontFamily || lineElement.style.fontFamily || 'sans-serif');
    const fontWeight = String(options.fontWeight || lineElement.style.fontWeight || '600');

    if (!text) {
      lineElement.style.setProperty('font-size', `${minPx}px`);
      return minPx;
    }

    let fittedSize = minPx;
    if (textMeasureContext) {
      fittedSize = resolveBestFitFontSize(textMeasureContext, text, {
        minSize: minPx,
        maxSize: maxPx,
        maxWidth,
        maxHeight,
        fontFamily,
        fontWeight,
      });
    }

    lineElement.style.setProperty('font-size', `${fittedSize}px`);
    return fittedSize;
  }

  function measureTextBounds(text, options) {
    const normalizedText = String(text || '').trim() || ' ';
    const fontSize = Math.max(1, Number(options.fontSize || 10));
    const fontFamily = String(options.fontFamily || 'sans-serif');
    const fontWeight = String(options.fontWeight || '600');

    if (!textMeasureContext) {
      return {
        width: Math.max(1, normalizedText.length * fontSize * 0.56),
        height: Math.max(1, fontSize * 1.02),
      };
    }

    return getCanvasTextMetrics(textMeasureContext, normalizedText, {
      fontSize,
      fontFamily,
      fontWeight,
    });
  }

  function buildRenderedTextboxLayout(boxKey, lineElement, fontSize) {
    const constraintBox = activeTextLayout[boxKey];
    if (!constraintBox || !lineElement) return null;

    const frameWidth = Math.max(1, clipSurface.clientWidth || 1);
    const frameHeight = Math.max(1, clipSurface.clientHeight || 1);
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const textMetrics = measureTextBounds(lineElement.textContent, {
      fontFamily: lineElement.style.fontFamily || 'sans-serif',
      fontWeight: lineElement.style.fontWeight || '600',
      fontSize,
    });
    const horizontalPadding = Math.max(TEXTBOX_TIGHT_HORIZONTAL_PADDING, fontSize * 0.48);
    const verticalPadding = Math.max(TEXTBOX_TIGHT_VERTICAL_PADDING, fontSize * 0.36);

    const maxWidthWithinSafeArea = Math.max(
      MIN_RENDERED_TEXTBOX_WIDTH,
      safeArea.w - RENDER_SAFE_AREA_INSET * 2
    );
    const maxHeightWithinSafeArea = Math.max(
      MIN_RENDERED_TEXTBOX_HEIGHT,
      safeArea.h - RENDER_SAFE_AREA_INSET * 2
    );

    const desiredWidth = clampNumber(
      ((textMetrics.width + horizontalPadding) / frameWidth) * 100,
      MIN_RENDERED_TEXTBOX_WIDTH,
      Math.min(constraintBox.w, maxWidthWithinSafeArea)
    );
    const desiredHeight = clampNumber(
      ((textMetrics.height + verticalPadding) / frameHeight) * 100,
      MIN_RENDERED_TEXTBOX_HEIGHT,
      Math.min(constraintBox.h, maxHeightWithinSafeArea)
    );
    const centerX = constraintBox.x + constraintBox.w / 2;
    const centerY = constraintBox.y + constraintBox.h / 2;
    const minX = Math.max(0, safeArea.x + RENDER_SAFE_AREA_INSET);
    const minY = Math.max(0, safeArea.y + RENDER_SAFE_AREA_INSET);
    const maxX = Math.min(100 - desiredWidth, safeArea.x + safeArea.w - RENDER_SAFE_AREA_INSET - desiredWidth);
    const maxY = Math.min(100 - desiredHeight, safeArea.y + safeArea.h - RENDER_SAFE_AREA_INSET - desiredHeight);
    const x = clampNumber(centerX - desiredWidth / 2, minX, Math.max(minX, maxX));
    const y = clampNumber(centerY - desiredHeight / 2, minY, Math.max(minY, maxY));

    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      w: Number(desiredWidth.toFixed(3)),
      h: Number(desiredHeight.toFixed(3)),
    };
  }

  function getTextboxValueByKey(boxKey) {
    return boxKey === 'date' ? dateInput.value.trim() : lastNameInput.value.trim();
  }

  function hasLayoutChangedSignificantly(sourceLayout, targetLayout) {
    if (!sourceLayout || !targetLayout) return false;
    return (
      Math.abs(sourceLayout.x - targetLayout.x) > TEXTBOX_LAYOUT_CHANGE_EPSILON ||
      Math.abs(sourceLayout.y - targetLayout.y) > TEXTBOX_LAYOUT_CHANGE_EPSILON ||
      Math.abs(sourceLayout.w - targetLayout.w) > TEXTBOX_LAYOUT_CHANGE_EPSILON ||
      Math.abs(sourceLayout.h - targetLayout.h) > TEXTBOX_LAYOUT_CHANGE_EPSILON
    );
  }

  function hasTextLayoutChangedFromInitial(currentLayout) {
    if (!initialTextLayout || !currentLayout) return false;
    const baselineLayout = sanitizeTextLayout(initialTextLayout);
    const candidateLayout = sanitizeTextLayout(currentLayout);
    return ['lastName', 'date'].some((boxKey) =>
      hasLayoutChangedSignificantly(baselineLayout[boxKey], candidateLayout[boxKey])
    );
  }

  function hasIconLayoutChangedFromInitial(currentLayout) {
    if (!initialIconLayout || !currentLayout) return false;
    const baselineLayout = sanitizeIconLayout(initialIconLayout);
    const candidateLayout = sanitizeIconLayout(currentLayout);
    return (
      Math.abs(baselineLayout.x - candidateLayout.x) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(baselineLayout.y - candidateLayout.y) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(baselineLayout.size - candidateLayout.size) > ICON_LAYOUT_CHANGE_EPSILON
    );
  }

  function isTextboxInsideSafeArea(layout) {
    if (!layout) return true;
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const styleLayoutSettings = getStyleLayoutSettings(getSelectedStyle());
    const inset = styleLayoutSettings.safeAreaTolerance;
    const right = layout.x + layout.w;
    const bottom = layout.y + layout.h;

    return (
      layout.x >= safeArea.x - inset &&
      layout.y >= safeArea.y - inset &&
      right <= safeArea.x + safeArea.w + inset &&
      bottom <= safeArea.y + safeArea.h + inset
    );
  }

  function isIconInsideSafeArea(layout) {
    if (!layout) return true;
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const styleLayoutSettings = getStyleLayoutSettings(getSelectedStyle());
    const inset = styleLayoutSettings.safeAreaTolerance;
    const half = Math.max(MIN_ICON_SIZE / 2, Number(layout.size || 0) / 2);
    const left = layout.x - half;
    const right = layout.x + half;
    const top = layout.y - half;
    const bottom = layout.y + half;
    return (
      left >= safeArea.x - inset &&
      top >= safeArea.y - inset &&
      right <= safeArea.x + safeArea.w + inset &&
      bottom <= safeArea.y + safeArea.h + inset
    );
  }

  function getEngravingAreaError() {
    if (!shouldValidateEngravingBounds || !hasUserMovedTextInCurrentSession) {
      return '';
    }

    if (!activeScope || !modal.hasAttribute('open')) {
      return '';
    }

    const hasMovedTextBoxes = hasTextLayoutChangedFromInitial(activeTextLayout);
    const hasMovedIcon = hasIconLayoutChangedFromInitial(activeIconLayout);
    if (!hasMovedTextBoxes && !hasMovedIcon) {
      return '';
    }

    const textboxKeys = ['lastName', 'date'];

    for (const boxKey of textboxKeys) {
      if (!getTextboxValueByKey(boxKey)) continue;
      const activeLayout = activeTextLayout[boxKey] || null;
      if (!isTextboxInsideSafeArea(activeLayout)) {
        return ENGRAVING_AREA_ERROR;
      }
    }

    if (getSelectedFlowerIconValue() && !isIconInsideSafeArea(activeIconLayout)) {
      return ENGRAVING_AREA_ERROR;
    }

    return '';
  }

  function renderDeterministicOverlay() {
    const selectedStyle = getSelectedStyle();
    const stylePreset = getStylePreset(selectedStyle);
    const styleLayoutSettings = getStyleLayoutSettings(selectedStyle);
    const activeFonts = getActiveFontFamilies(selectedStyle);
    const frameHeight = Math.max(40, clipSurface.clientHeight || 0);
    const lastNameLayout = activeTextLayout.lastName;
    const dateLayout = activeTextLayout.date;
    const nameMaxSize = Math.max(
      14,
      Math.round((frameHeight * lastNameLayout.h) / 100 * styleLayoutSettings.previewScale)
    );
    const dateMaxSize = Math.max(
      12,
      Math.round((frameHeight * dateLayout.h) / 100 * styleLayoutSettings.previewScale)
    );

    deterministicOverlay.removeAttribute('hidden');
    applySafeAreaBoundaryLayout();
    applyTextboxLayout('lastName');
    applyTextboxLayout('date');

    deterministicLastName.textContent = lastNameInput.value.trim() || ' ';
    deterministicDate.textContent = dateInput.value.trim() || ' ';

    deterministicLastName.style.setProperty('font-family', activeFonts.lastName || stylePreset.nameFamily);
    deterministicLastName.style.setProperty('font-weight', '600');
    deterministicLastName.style.setProperty('color', stylePreset.color);
    const lastNameFontSize = fitLineToContainer(deterministicLastName, {
      minPx: 8,
      maxPx: nameMaxSize,
      fontFamily: activeFonts.lastName || stylePreset.nameFamily,
      fontWeight: '600',
      insetX: styleLayoutSettings.previewInsetX,
      insetY: styleLayoutSettings.previewInsetY,
    });

    deterministicDate.style.setProperty('font-family', activeFonts.date || stylePreset.dateFamily);
    deterministicDate.style.setProperty('font-weight', stylePreset.dateWeight || '600');
    deterministicDate.style.setProperty('color', stylePreset.color);
    const dateFontSize = fitLineToContainer(deterministicDate, {
      minPx: 7,
      maxPx: dateMaxSize,
      fontFamily: activeFonts.date || stylePreset.dateFamily,
      fontWeight: stylePreset.dateWeight || '600',
      insetX: styleLayoutSettings.previewInsetX,
      insetY: styleLayoutSettings.previewInsetY,
    });

    if (!boxInteraction) {
      const renderedNameLayout = buildRenderedTextboxLayout('lastName', deterministicLastName, lastNameFontSize);
      const renderedDateLayout = buildRenderedTextboxLayout('date', deterministicDate, dateFontSize);
      if (renderedNameLayout) {
        applyTextboxLayout('lastName', renderedNameLayout);
      }
      if (renderedDateLayout) {
        applyTextboxLayout('date', renderedDateLayout);
      }
    }

    renderFlowerIcon();
  }

  function endBoxInteraction() {
    if (!boxInteraction) return;
    setTextboxCenterSnapState(boxInteraction.boxKey, false);
    const boxElement = getTextboxByKey(boxInteraction.boxKey);
    if (boxElement) {
      boxElement.classList.remove('is-active');
    }
    boxInteraction = null;
  }

  function onBoxPointerMove(event) {
    if (!boxInteraction) return;
    if (boxInteraction.sessionId !== activeEditorSessionId) {
      onBoxPointerUp();
      return;
    }

    const pointerDeltaX = event.clientX - boxInteraction.startX;
    const pointerDeltaY = event.clientY - boxInteraction.startY;
    const pointerDistance = Math.hypot(pointerDeltaX, pointerDeltaY);
    if (!boxInteraction.dragActivated) {
      if (pointerDistance < TEXTBOX_POINTER_MOVE_ACTIVATION_PX) {
        return;
      }
      boxInteraction.dragActivated = true;
    }

    const frameWidth = Math.max(1, clipSurface.clientWidth || 1);
    const frameHeight = Math.max(1, clipSurface.clientHeight || 1);
    const deltaXPct = (pointerDeltaX / frameWidth) * 100;
    const deltaYPct = (pointerDeltaY / frameHeight) * 100;
    const nextLayout = cloneTextLayout(activeTextLayout);
    const box = nextLayout[boxInteraction.boxKey];
    if (!box) return;

    let isCenterSnapped = false;

    if (boxInteraction.mode === 'resize') {
      const nextWidth = clampNumber(boxInteraction.startBox.w + deltaXPct, MIN_TEXTBOX_WIDTH, 98 - boxInteraction.startBox.x);
      const nextHeight = clampNumber(
        boxInteraction.startBox.h + deltaYPct,
        MIN_TEXTBOX_HEIGHT,
        98 - boxInteraction.startBox.y
      );
      box.w = nextWidth;
      box.h = nextHeight;
      setTextboxCenterSnapState(boxInteraction.boxKey, false);
    } else {
      box.x = clampNumber(boxInteraction.startBox.x + deltaXPct, 0, 100 - boxInteraction.startBox.w);
      box.y = clampNumber(boxInteraction.startBox.y + deltaYPct, 0, 100 - boxInteraction.startBox.h);

      const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
      const targetCenterX = safeArea.x + (safeArea.w - box.w) / 2;
      const targetCenterY = safeArea.y + (safeArea.h - box.h) / 2;

      if (Math.abs(box.x - targetCenterX) <= SAFE_AREA_CENTER_SNAP_THRESHOLD) {
        box.x = targetCenterX;
        isCenterSnapped = true;
      }
      if (Math.abs(box.y - targetCenterY) <= SAFE_AREA_CENTER_SNAP_THRESHOLD) {
        box.y = targetCenterY;
        isCenterSnapped = true;
      }
      setTextboxCenterSnapState(boxInteraction.boxKey, isCenterSnapped);
    }

    activeTextLayout = sanitizeTextLayout(nextLayout);
    const movedLayout = activeTextLayout[boxInteraction.boxKey];
    if (hasLayoutChangedSignificantly(boxInteraction.startBox, movedLayout)) {
      boxInteraction.layoutChanged = true;
      armEngravingWarningState();
    }
    renderDeterministicOverlay();
    renderValidationState();
    event.preventDefault();
  }

  function onBoxPointerUp() {
    if (!boxInteraction) return;
    const shouldEnableBoundsValidation = Boolean(boxInteraction.layoutChanged);
    window.removeEventListener('pointermove', onBoxPointerMove);
    window.removeEventListener('pointerup', onBoxPointerUp);
    window.removeEventListener('pointercancel', onBoxPointerUp);
    endBoxInteraction();
    if (shouldEnableBoundsValidation) {
      armEngravingWarningState();
    }
    renderDeterministicOverlay();
    renderValidationState();
  }

  function beginBoxInteraction(event, boxKey, mode) {
    if (isGenerating) return;
    if (event.button !== 0) return;
    onIconPointerUp();
    const currentBox = activeTextLayout[boxKey];
    if (!currentBox) return;
    setSelectedTextbox(boxKey);
    setIconSelected(false);

    boxInteraction = {
      boxKey,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startBox: { ...currentBox },
      dragActivated: false,
      layoutChanged: false,
      sessionId: activeEditorSessionId,
    };

    const boxElement = getTextboxByKey(boxKey);
    if (boxElement) {
      boxElement.classList.add('is-active');
    }

    window.addEventListener('pointermove', onBoxPointerMove);
    window.addEventListener('pointerup', onBoxPointerUp);
    window.addEventListener('pointercancel', onBoxPointerUp);
    event.preventDefault();
  }

  function endIconInteraction() {
    if (!iconInteraction) return;
    deterministicIcon.classList.remove('is-active');
    iconInteraction = null;
  }

  function onIconPointerMove(event) {
    if (!iconInteraction) return;
    if (iconInteraction.sessionId !== activeEditorSessionId) {
      onIconPointerUp();
      return;
    }

    const pointerDeltaX = event.clientX - iconInteraction.startX;
    const pointerDeltaY = event.clientY - iconInteraction.startY;
    const pointerDistance = Math.hypot(pointerDeltaX, pointerDeltaY);
    if (!iconInteraction.dragActivated) {
      if (pointerDistance < ICON_POINTER_MOVE_ACTIVATION_PX) {
        return;
      }
      iconInteraction.dragActivated = true;
    }

    const frameWidth = Math.max(1, clipSurface.clientWidth || 1);
    const frameHeight = Math.max(1, clipSurface.clientHeight || 1);
    const deltaXPct = (pointerDeltaX / frameWidth) * 100;
    const deltaYPct = (pointerDeltaY / frameHeight) * 100;
    const nextLayout = { ...iconInteraction.startLayout };

    if (iconInteraction.mode === 'resize') {
      const dominantDelta = Math.abs(deltaXPct) >= Math.abs(deltaYPct) ? deltaXPct : deltaYPct;
      nextLayout.size = iconInteraction.startLayout.size + dominantDelta;
    } else {
      nextLayout.x = iconInteraction.startLayout.x + deltaXPct;
      nextLayout.y = iconInteraction.startLayout.y + deltaYPct;
    }

    activeIconLayout = sanitizeIconLayout(nextLayout);
    if (
      Math.abs(activeIconLayout.x - iconInteraction.startLayout.x) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(activeIconLayout.y - iconInteraction.startLayout.y) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(activeIconLayout.size - iconInteraction.startLayout.size) > ICON_LAYOUT_CHANGE_EPSILON
    ) {
      iconInteraction.layoutChanged = true;
      armEngravingWarningState();
    }

    renderDeterministicOverlay();
    renderValidationState();
    event.preventDefault();
  }

  function onIconPointerUp() {
    if (!iconInteraction) return;
    const shouldEnableBoundsValidation = Boolean(iconInteraction.layoutChanged);
    window.removeEventListener('pointermove', onIconPointerMove);
    window.removeEventListener('pointerup', onIconPointerUp);
    window.removeEventListener('pointercancel', onIconPointerUp);
    endIconInteraction();
    if (shouldEnableBoundsValidation) {
      armEngravingWarningState();
    }
    renderDeterministicOverlay();
    renderValidationState();
  }

  function beginIconInteraction(event, mode) {
    if (isGenerating) return;
    if (event.button !== 0) return;
    if (!getSelectedFlowerIconValue()) return;
    onBoxPointerUp();

    setSelectedTextbox('');
    setIconSelected(true);
    iconInteraction = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startLayout: { ...sanitizeIconLayout(activeIconLayout) },
      dragActivated: false,
      layoutChanged: false,
      sessionId: activeEditorSessionId,
    };
    deterministicIcon.classList.add('is-active');
    window.addEventListener('pointermove', onIconPointerMove);
    window.addEventListener('pointerup', onIconPointerUp);
    window.addEventListener('pointercancel', onIconPointerUp);
    event.preventDefault();
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

  function renderValidationState() {
    const engravingAreaError = getEngravingAreaError();
    const canRenderEngravingWarning = Boolean(shouldValidateEngravingBounds && hasUserMovedTextInCurrentSession);
    const hasEngravingAreaError = Boolean(canRenderEngravingWarning && engravingAreaError);
    clipSurface.classList.toggle('is-warning-armed', canRenderEngravingWarning);
    clipSurface.classList.toggle('is-out-of-bounds', hasEngravingAreaError);
    safeAreaWarning.toggleAttribute('hidden', !hasEngravingAreaError);

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

  function renderEditorState() {
    if (lastNameCount) {
      lastNameCount.textContent = `${lastNameInput.value.length}/${activeLastNameMax}`;
    }
    if (dateCount) {
      dateCount.textContent = `${dateInput.value.length}/${activeDateMax}`;
    }

    clipSurface.classList.toggle('is-generating', isGenerating);
    setPickedPanelVisible(true);
    renderClipStyle();
    renderValidationState();
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
    const iconProperty = context.querySelector('[data-personalization-property="icon"]');
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
    if (deterministicFontProperty) {
      const resolvedLastNameFont = state.lastNameFont || stylePreset.nameFamily;
      const resolvedDateFont = state.dateFont || stylePreset.dateFamily;
      deterministicFontProperty.value = `${resolvedLastNameFont} | ${resolvedDateFont}`;
    }
    if (iconProperty) iconProperty.value = normalizeFlowerIcon(state.flowerIcon);
    if (deterministicSizeProperty) deterministicSizeProperty.value = String(stylePreset.nameSize);
    if (deterministicBoxWidthProperty) deterministicBoxWidthProperty.value = String(stylePreset.boxWidth);
    if (geminiSummaryProperty) geminiSummaryProperty.value = state.geminiSummary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
  }

  function isConfiguredState(state) {
    if (!state) return false;
    return Boolean(state.lastName || state.date || state.flowerIcon || state.geminiSummary || state.generatedImage);
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
    syncScopePersonalizationEligibility(scope);
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
      const defaultState = createDefaultState();
      const initialStyle =
        (context.querySelector('[data-personalization-property="style"]') || {}).value || defaultState.style;
      setScopeState(scope, {
        style: initialStyle,
        lastName:
          (context.querySelector('[data-personalization-property="name1"]') || {}).value ||
          (context.querySelector('[data-personalization-property="primary"]') || {}).value ||
          defaultState.lastName,
        date: (context.querySelector('[data-personalization-property="date"]') || {}).value || defaultState.date,
        lastNameFont: getStylePreset(
          initialStyle
        ).nameFamily,
        dateFont: getStylePreset(
          initialStyle
        ).dateFamily,
        flowerIcon:
          (context.querySelector('[data-personalization-property="icon"]') || {}).value ||
          defaultState.flowerIcon,
        textLayout: defaultState.textLayout,
        geminiSummary: (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '',
        generatedImage: '',
        stagePreviewDataUrl: '',
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
    onBoxPointerUp();
    onIconPointerUp();
    activeEditorSessionId += 1;
    resetEngravingWarningState();

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

    const normalizedStyle = normalizeStyle(existingState.style || DEFAULT_STYLE);
    setSelectedStyle(normalizedStyle);
    lastNameInput.value = existingState.lastName || '';
    dateInput.value = existingState.date || '';
    const stylePreset = getStylePreset(normalizedStyle);
    setSelectValue(lastNameFontSelect, existingState.lastNameFont, stylePreset.nameFamily);
    setSelectValue(dateFontSelect, existingState.dateFont, stylePreset.dateFamily);
    setFlowerIconValue(existingState.flowerIcon);
    activeTextLayout = clampTextLayoutToSafeArea(existingState.textLayout);
    initialTextLayout = cloneTextLayout(activeTextLayout);
    activeIconLayout = clampIconLayoutToSafeArea(existingState.iconLayout || createDefaultIconLayout(activeTextLayout));
    initialIconLayout = { ...activeIconLayout };
    resetEngravingWarningState();
    selectedTextboxKey = '';
    syncTextboxSelectionState();
    setIconSelected(false);
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
    onBoxPointerUp();
    onIconPointerUp();
    setSelectedTextbox('');
    setIconSelected(false);
    resetEngravingWarningState();
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

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const form = target.closest('form[data-type="add-to-cart-form"]');
    if (!form) return;
    scheduleFormPersonalizationEligibilitySync(form);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const form = target.closest('form[data-type="add-to-cart-form"]');
    if (!form) return;
    scheduleFormPersonalizationEligibilitySync(form);
  });

  document.addEventListener('variant:change', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      syncAllScopePersonalizationEligibility();
      return;
    }

    const form = target.closest('form[data-type="add-to-cart-form"]');
    if (form) {
      scheduleFormPersonalizationEligibilitySync(form);
      return;
    }

    syncAllScopePersonalizationEligibility();
  });

  styleInputs.forEach((input) => {
    input.addEventListener('change', () => {
      setGeneratedImage('');
      setGenerationError('');
      resetEngravingWarningState();
      applyStyleDefaultFonts(getSelectedStyle());
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
  [lastNameFontSelect, dateFontSelect].forEach((selectElement) => {
    selectElement.addEventListener('change', () => {
      setGenerationError('');
      renderEditorState();
    });
  });
  flowerIconSelect.addEventListener('change', () => {
    onIconPointerUp();
    const previousIconValue = getSelectedFlowerIconValue();
    setFlowerIconValue(flowerIconSelect.value);
    if (!previousIconValue && getSelectedFlowerIconValue()) {
      activeIconLayout = clampIconLayoutToSafeArea(createDefaultIconLayout(activeTextLayout));
      initialIconLayout = { ...activeIconLayout };
    }
    if (!getSelectedFlowerIconValue()) {
      setIconSelected(false);
    }
    setGenerationError('');
    renderEditorState();
  });
  window.addEventListener('resize', () => {
    renderDeterministicOverlay();
  });

  [deterministicLastNameBox, deterministicDateBox].forEach((boxElement) => {
    boxElement.addEventListener('pointerdown', (event) => {
      const boxKey = boxElement.dataset.personalizationTextbox === 'date' ? 'date' : 'lastName';
      if (event.target && event.target.closest('[data-personalization-resize]')) {
        return;
      }
      beginBoxInteraction(event, boxKey, 'drag');
    });
  });

  resizeHandles.forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      const boxKey = handle.dataset.personalizationResize === 'date' ? 'date' : 'lastName';
      beginBoxInteraction(event, boxKey, 'resize');
      event.stopPropagation();
    });
  });

  deterministicIcon.addEventListener('pointerdown', (event) => {
    if (event.target && event.target.closest('[data-personalization-icon-resize]')) {
      return;
    }
    beginIconInteraction(event, 'drag');
  });

  iconResizeHandle.addEventListener('pointerdown', (event) => {
    beginIconInteraction(event, 'resize');
    event.stopPropagation();
  });

  modal.addEventListener('pointerdown', (event) => {
    if (event.target.closest('[data-personalization-textbox]')) return;
    if (event.target.closest('[data-personalization-resize]')) return;
    if (event.target.closest('[data-personalization-deterministic-icon]')) return;
    if (event.target.closest('[data-personalization-icon-resize]')) return;
    setSelectedTextbox('');
    setIconSelected(false);
  });

  document.body.addEventListener('modalClosed', () => {
    if (modal.hasAttribute('open')) return;
    onBoxPointerUp();
    onIconPointerUp();
    setSelectedTextbox('');
    setIconSelected(false);
    resetEngravingWarningState();
  });

  const modalOpenStateObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName !== 'open') return;
      if (!modal.hasAttribute('open')) {
        onBoxPointerUp();
        onIconPointerUp();
        setSelectedTextbox('');
        setIconSelected(false);
      }
      resetEngravingWarningState();
    });
  });
  modalOpenStateObserver.observe(modal, { attributes: true, attributeFilter: ['open'] });

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
      lastNameFont: lastNameFontSelect.value,
      dateFont: dateFontSelect.value,
      flowerIcon: getSelectedFlowerIconValue(),
      textLayout: cloneTextLayout(activeTextLayout),
      iconLayout: { ...activeIconLayout },
      geminiSummary: getGeneratedSummary(),
      generatedImage: getGeneratedImageData(),
      stagePreviewDataUrl: resolveStagePreviewDataUrl(getGeneratedImageData()),
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
    const activeFonts = getActiveFontFamilies(selectedStyle);
    const selectedFlowerIcon = getSelectedFlowerIconValue();
    const selectedFlowerIconUrl = getSelectedFlowerIconUrl(selectedFlowerIcon);
    const payload = {
      style: selectedStyle,
      lastName: lastNameInput.value.trim(),
      date: dateInput.value.trim(),
      lastNameFont: activeFonts.lastName,
      dateFont: activeFonts.date,
      flowerIcon: selectedFlowerIcon,
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
        payload.date,
        activeTextLayout,
        {
          lastName: payload.lastNameFont,
          date: payload.dateFont,
        },
        {
          value: payload.flowerIcon,
          url: selectedFlowerIconUrl,
        },
        activeIconLayout
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
        lastNameFont: payload.lastNameFont,
        dateFont: payload.dateFont,
        flowerIcon: payload.flowerIcon,
        textLayout: cloneTextLayout(activeTextLayout),
        iconLayout: { ...activeIconLayout },
        geminiSummary: '',
        generatedImage: generatedImageData,
        stagePreviewDataUrl: generatedImageData,
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

  async function prepareStagePreviewForSubmit(context, scope) {
    const state = getScopeState(scope);
    if (!state) return;

    const stagePreviewDataUrl = await ensureScopeStagePreviewDataUrl(scope, state);
    const resolvedState = getScopeState(scope) || state;
    applyStateToContext(context, resolvedState);
    attachStagePreviewFileToContext(context, stagePreviewDataUrl, scope);
  }

  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.dataset.type !== 'add-to-cart-form') return;

      if (form.dataset.personalizationSubmitReady === 'true') {
        delete form.dataset.personalizationSubmitReady;
        return;
      }

      if (form.dataset.personalizationPrepareInFlight === 'true') {
        event.preventDefault();
        return;
      }

      const context = form.querySelector('[data-personalization-context]');
      if (!context) return;

      const scope = resolveContextScope(context);
      if (!scope) return;
      syncScopePersonalizationEligibility(scope);
      if (String(context.dataset.personalizationEnabled || 'true') !== 'true') {
        return;
      }

      const state = getScopeState(scope);
      if (!state) return;
      applyStateToContext(context, state);

      event.preventDefault();
      form.dataset.personalizationPrepareInFlight = 'true';
      const submitter = event.submitter instanceof HTMLElement ? event.submitter : null;

      prepareStagePreviewForSubmit(context, scope)
        .catch(() => {
          // Continue checkout even if stage preview attachment fails.
        })
        .finally(() => {
          delete form.dataset.personalizationPrepareInFlight;
          form.dataset.personalizationSubmitReady = 'true';

          if (typeof form.requestSubmit === 'function') {
            if (submitter) {
              form.requestSubmit(submitter);
            } else {
              form.requestSubmit();
            }
            return;
          }

          if (submitter && typeof submitter.click === 'function') {
            submitter.click();
            return;
          }

          form.submit();
        });
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

        if (node.matches('form[data-type="add-to-cart-form"]')) {
          scheduleFormPersonalizationEligibilitySync(node);
        }

        if (node.querySelector('form[data-type="add-to-cart-form"]')) {
          node.querySelectorAll('form[data-type="add-to-cart-form"]').forEach((formElement) => {
            scheduleFormPersonalizationEligibilitySync(formElement);
          });
        }

        if (node.matches('[data-personalization-trigger][data-personalization-scope]')) {
          const scope = String(node.dataset.personalizationScope || '').trim();
          if (scope) {
            scheduleScopePersonalizationEligibilitySync(scope);
          }
        }

        if (node.querySelector('[data-personalization-trigger][data-personalization-scope]')) {
          node
            .querySelectorAll('[data-personalization-trigger][data-personalization-scope]')
            .forEach((triggerElement) => {
              const scope = String(triggerElement.dataset.personalizationScope || '').trim();
              if (scope) {
                scheduleScopePersonalizationEligibilitySync(scope);
              }
            });
        }
      });
    });
  });

  hydrateContexts(document);
  syncAllScopePersonalizationEligibility();
  ensureSafeAreaBounds().then(() => {
    activeTextLayout = clampTextLayoutToSafeArea(activeTextLayout);
    activeIconLayout = clampIconLayoutToSafeArea(activeIconLayout);
    if (activeScope) {
      renderEditorState();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
