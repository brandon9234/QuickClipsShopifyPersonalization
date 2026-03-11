(function () {
  const MODAL_ID = 'PersonalizationPreviewModal';
  const STYLE_DEFINITIONS = Object.freeze([
    { value: 'Handwritten 1', legacyValue: 'Style 1' },
    { value: 'Handwritten 2', legacyValue: 'Style 2' },
    { value: 'Handwritten 3', legacyValue: 'Style 3' },
    { value: 'Cursive 1', legacyValue: 'Style 4' },
    { value: 'Cursive 2', legacyValue: 'Style 5' },
    { value: 'Cursive 3', legacyValue: 'Style 6' },
    { value: 'Professional 1', legacyValue: 'Style 7' },
    { value: 'Professional 2', legacyValue: 'Style 8' },
    { value: 'Professional 3', legacyValue: 'Style 9' },
    { value: 'Bold 1', legacyValue: 'Style 10' },
    { value: 'Bold 2', legacyValue: 'Style 11' },
    { value: 'Bold 3', legacyValue: 'Style 12' },
    { value: 'Minimal 1', legacyValue: 'Style 13' },
    { value: 'Minimal 2', legacyValue: 'Style 14' },
    { value: 'Playful 1', legacyValue: 'Style 15' },
    { value: 'Playful 2', legacyValue: 'Style 16' },
    { value: 'Playful 3', legacyValue: 'Style 17' },
    { value: 'Elegant 1', legacyValue: 'Style 18' },
    { value: 'Elegant 2', legacyValue: 'Style 19' },
    { value: 'Classic 1', legacyValue: 'Style 20' },
    { value: 'Classic 2', legacyValue: 'Style 21' },
    { value: 'Classic 3', legacyValue: 'Style 22' },
    { value: 'Modern 1', legacyValue: 'Style 23' },
    { value: 'Modern 2', legacyValue: 'Style 24' },
  ]);
  const STYLE_VALUES = STYLE_DEFINITIONS.map((definition) => definition.value);
  const DEFAULT_STYLE = STYLE_VALUES[0];
  const STYLE_LEGACY_ALIASES = Object.freeze(
    STYLE_DEFINITIONS.reduce((aliases, definition) => {
      aliases[definition.legacyValue] = definition.value;
      return aliases;
    }, {})
  );
  const STYLE_METADATA_BY_VALUE = Object.freeze(
    STYLE_DEFINITIONS.reduce((metadata, definition) => {
      const styleValue = String(definition.value || '').trim();
      if (!styleValue) return metadata;
      const match = styleValue.match(/^(.*?)(?:\s+(\d+))$/);
      const family = String(match ? match[1] : styleValue).trim();
      const variantNumber = String(match && match[2] ? match[2] : '').trim();
      metadata[styleValue] = Object.freeze({
        family,
        variantLabel: variantNumber ? `Style ${variantNumber}` : styleValue,
      });
      return metadata;
    }, {})
  );
  const STYLE_FAMILY_VALUES = Object.freeze(
    Object.keys(
      STYLE_DEFINITIONS.reduce((families, definition) => {
        const styleValue = String(definition.value || '').trim();
        const styleMetadata = STYLE_METADATA_BY_VALUE[styleValue];
        if (!styleMetadata || !styleMetadata.family) return families;
        if (!families[styleMetadata.family]) families[styleMetadata.family] = true;
        return families;
      }, {})
    )
  );
  const STYLE_OPTIONS_BY_FAMILY = Object.freeze(
    STYLE_FAMILY_VALUES.reduce((groups, family) => {
      const familyOptions = STYLE_DEFINITIONS.filter((definition) => {
        const styleValue = String(definition.value || '').trim();
        const styleMetadata = STYLE_METADATA_BY_VALUE[styleValue];
        return styleMetadata && styleMetadata.family === family;
      }).map((definition) => {
        const styleValue = String(definition.value || '').trim();
        const styleMetadata = STYLE_METADATA_BY_VALUE[styleValue];
        return Object.freeze({
          value: styleValue,
          label: styleMetadata ? styleMetadata.variantLabel : styleValue,
        });
      });
      groups[family] = Object.freeze(familyOptions);
      return groups;
    }, {})
  );
  const DEFAULT_STYLE_FAMILY =
    (STYLE_METADATA_BY_VALUE[DEFAULT_STYLE] && STYLE_METADATA_BY_VALUE[DEFAULT_STYLE].family) ||
    STYLE_FAMILY_VALUES[0] ||
    '';
  const DEFAULT_LAST_NAME_MAX = 30;
  const DEFAULT_DATE_MAX = 10;
  const DEFAULT_API_PATH = '/apps/quickclips-personalization/preview';
  const CLIP_STYLE_CLASSES = STYLE_VALUES.map((styleValue) => `is-${styleValue.toLowerCase().replace(/\s+/g, '-')}`);
  const PERSONALIZATION_PREVIEW_BUILD = '2026-03-11-text-safe-area-bounds';
  const DEFAULT_LAST_NAME_VALUE = 'The Johnsons';
  const DEFAULT_DATE_VALUE = '03/09/2026';
  const MIN_TEXTBOX_WIDTH = 18;
  const MIN_TEXTBOX_HEIGHT = 14;
  const MIN_RENDERED_TEXTBOX_WIDTH = 5;
  const MIN_RENDERED_TEXTBOX_HEIGHT = 4;
  const DEFAULT_PREVIEW_TEXT_SCALE = 1.15;
  const DEFAULT_CANVAS_TEXT_WIDTH_RATIO = 0.94;
  const DEFAULT_CANVAS_TEXT_HEIGHT_RATIO = 0.84;
  const DEFAULT_SAFE_AREA_TOLERANCE = 1.4;
  const TEXTBOX_LAYOUT_CHANGE_EPSILON = 0.18;
  const TEXTBOX_POINTER_MOVE_ACTIVATION_PX = 12;
  const DEFAULT_ICON_SCALE = 100;
  const MIN_ICON_SIZE = 3.4;
  const MAX_ICON_SIZE = 28;
  const ICON_LAYOUT_CHANGE_EPSILON = 0.18;
  const ICON_POINTER_MOVE_ACTIVATION_PX = 10;
  const STAGE_PREVIEW_FILE_NAME_PREFIX = 'quickclips-stage-preview';
  const CUSTOM_ENGRAVING_KEYWORDS = Object.freeze(['custom engraving']);
  const DEFAULT_FLOWER_ICON_OPTIONS = Object.freeze([
    { value: 'cartoon-flower', label: 'Cartoon Flower', asset: 'Cartoon Flower.png' },
    { value: 'flower-with-stem', label: 'Flower With Stem', asset: 'Flower With Stem.png' },
    { value: 'flower-with-stem-leaves', label: 'Flower With Stem + Leaves', asset: 'flower-with-stem-leaves.png' },
    { value: 'flower-with-stem-leaves-2', label: 'Flower With Stem + Leaves 2', asset: 'flower-with-stem-leaves-2.png' },
    { value: 'rounded-petals-with-leaves', label: 'Rounded Petals with Leaves', asset: 'Rounded Petals with Leaves.png' },
    { value: 'pointed-petals-with-leaves', label: 'Pointed Petals with Leaves', asset: 'Pointed Petals with Leaves.png' },
    { value: 'cartoon-flower-2', label: 'Cartoon Flower 2', asset: 'Cartoon Flower 2.png' },
    { value: 'pointed-petal-flower', label: 'Pointed Petal Flower', asset: 'Pointed Petal Flower.png' },
    { value: 'rounded-petal-flower', label: 'Rounded Petal Flower', asset: 'Rounded Petal Flower.png' },
    { value: 'berries', label: 'Berries', asset: 'Berries.png' },
    { value: 'jagged-leaf', label: 'Jagged Leaf', asset: 'Jagged Leaf.png' },
    { value: 'stem-with-leaves', label: 'Stem with Leaves', asset: 'Stem with Leaves.png' },
    { value: 'leaf', label: 'Leaf', asset: 'Leaf.png' },
    { value: 'leaves', label: 'Leaves', asset: 'Leaves.png' },
    { value: 'leaves-2', label: 'Leaves 2', asset: 'Leaves 2.png' },
    { value: 'bouquet', label: 'Bouquet', asset: 'Bouquet.png' },
    { value: 'cake', label: 'Cake', asset: 'Cake.png' },
    { value: 'calendar', label: 'Calendar', asset: 'Calendar.png' },
    { value: 'ring', label: 'Ring', asset: 'Ring.png' },
    { value: 'rings', label: 'Rings', asset: 'Rings.png' },
    { value: 'glasses-clink', label: 'Glasses Clink', asset: 'Glasses Clink.png' },
    { value: 'music-hearts', label: 'Music Hearts', asset: 'Music Hearts.png' },
    { value: 'heart-lock', label: 'Heart Lock', asset: 'Heart Lock.png' },
    { value: 'church', label: 'Church', asset: 'Church.png' },
    { value: 'hearts', label: 'Hearts', asset: 'Hearts.png' },
    { value: 'heart', label: 'Heart', asset: 'Heart.png' },
  ]);
  const DEFAULT_SAFE_AREA_BOUNDS = Object.freeze({
    x: 5.435,
    y: 25.143,
    w: 88.696,
    h: 42.571,
  });
  const MINI_STAGE_IMAGE_KEYWORD = 'horizontalminiquickclipzoomed';
  const SAFE_AREA_SCAN_PADDING = 6;
  const SAFE_AREA_BRIGHTNESS_THRESHOLD = 80;
  const DEFAULT_TEXT_LAYOUT = Object.freeze(buildDefaultTextLayout(DEFAULT_SAFE_AREA_BOUNDS));
  const FONT_FAMILIES = Object.freeze({
    playpenSansHebrew: '"Playpen Sans Hebrew", "Segoe UI", sans-serif',
    homemadeApple: '"Homemade Apple", "Brush Script MT", cursive',
    caveatBrush: '"Caveat Brush", "Brush Script MT", cursive',
    karlie: '"Karlie", "Brush Script MT", cursive',
    brittanySignature: '"Brittany Signature", "Brush Script MT", cursive',
    sofia: '"Sofia", "Brush Script MT", cursive',
    robotoFlex: '"Roboto Flex", Arial, sans-serif',
    markaziText: '"Markazi Text", Georgia, serif',
    martelDemiBold: '"Martel DemiBold", Georgia, serif',
    martelHeavy: '"Martel Heavy", Georgia, serif',
    titanOne: '"Titan One", Impact, sans-serif',
    bowlbyOneSc: '"Bowlby One SC", Impact, sans-serif',
    notable: '"Notable", Impact, sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    avenirNext: '"AvenirNext LT Pro Regular", Arial, sans-serif',
    hachiMaruPop: '"Hachi Maru Pop", cursive',
    centuryGothic: '"Century Gothic", Arial, sans-serif',
    originalSurfer: '"Original Surfer", "Trebuchet MS", cursive',
    kiwiMaru: '"Kiwi Maru", Georgia, serif',
    sacramento: '"Sacramento", "Brush Script MT", cursive',
    palatinoLinotype: '"Palatino Linotype", Palatino, "Book Antiqua", serif',
    niconne: '"Niconne", "Brush Script MT", cursive',
    libreBaskerville: '"Libre Baskerville", Baskerville, "Times New Roman", serif',
    bahnschrift: '"Bahnschrift", "Arial Narrow", Arial, sans-serif',
    calibri: '"Calibri", Arial, sans-serif',
    limelight: '"Limelight", Georgia, serif',
    kgSorryNotSorry: '"KG Sorry Not Sorry", "Comic Sans MS", cursive',
    kgSorryNotSorryChub: '"KG Sorry Not Sorry Chub", "Comic Sans MS", cursive',
    engraversGothicBt: '"EngraversGothic BT", "Palatino Linotype", serif',
  });
  const FONT_OPTIONS = [
    { label: 'Playpen Sans Hebrew', family: FONT_FAMILIES.playpenSansHebrew },
    { label: 'Homemade Apple', family: FONT_FAMILIES.homemadeApple },
    { label: 'Caveat Brush', family: FONT_FAMILIES.caveatBrush },
    { label: 'Karlie', family: FONT_FAMILIES.karlie },
    { label: 'Brittany Signature', family: FONT_FAMILIES.brittanySignature },
    { label: 'Sofia', family: FONT_FAMILIES.sofia },
    { label: 'Roboto Flex', family: FONT_FAMILIES.robotoFlex },
    { label: 'Markazi Text', family: FONT_FAMILIES.markaziText },
    { label: 'Martel DemiBold', family: FONT_FAMILIES.martelDemiBold },
    { label: 'Martel Heavy', family: FONT_FAMILIES.martelHeavy },
    { label: 'Titan One', family: FONT_FAMILIES.titanOne },
    { label: 'Bowlby One SC', family: FONT_FAMILIES.bowlbyOneSc },
    { label: 'Notable', family: FONT_FAMILIES.notable },
    { label: 'Arial', family: FONT_FAMILIES.arial },
    { label: 'AvenirNext LT Pro Regular', family: FONT_FAMILIES.avenirNext },
    { label: 'Hachi Maru Pop', family: FONT_FAMILIES.hachiMaruPop },
    { label: 'Century Gothic', family: FONT_FAMILIES.centuryGothic },
    { label: 'Original Surfer', family: FONT_FAMILIES.originalSurfer },
    { label: 'Kiwi Maru', family: FONT_FAMILIES.kiwiMaru },
    { label: 'Sacramento', family: FONT_FAMILIES.sacramento },
    { label: 'Palatino Linotype', family: FONT_FAMILIES.palatinoLinotype },
    { label: 'Niconne', family: FONT_FAMILIES.niconne },
    { label: 'Libre Baskerville', family: FONT_FAMILIES.libreBaskerville },
    { label: 'Bahnschrift', family: FONT_FAMILIES.bahnschrift },
    { label: 'Calibri', family: FONT_FAMILIES.calibri },
    { label: 'Limelight', family: FONT_FAMILIES.limelight },
    { label: 'KG Sorry Not Sorry', family: FONT_FAMILIES.kgSorryNotSorry },
    { label: 'KG Sorry Not Sorry Chub', family: FONT_FAMILIES.kgSorryNotSorryChub },
    { label: 'EngraversGothic BT', family: FONT_FAMILIES.engraversGothicBt },
  ];
  const BASE_STYLE_PRESET = Object.freeze({
    nameSize: 60,
    dateSize: 38,
    boxWidth: 68,
    rotation: 0,
    color: '#4b341f',
    dateWeight: '600',
  });
  const STYLE_FONT_PRESETS = {
    'Handwritten 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.playpenSansHebrew, dateFamily: FONT_FAMILIES.playpenSansHebrew },
    'Handwritten 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.homemadeApple, dateFamily: FONT_FAMILIES.engraversGothicBt },
    'Handwritten 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.caveatBrush, dateFamily: FONT_FAMILIES.kgSorryNotSorryChub },
    'Cursive 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.karlie, dateFamily: FONT_FAMILIES.calibri },
    'Cursive 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.brittanySignature, dateFamily: FONT_FAMILIES.avenirNext },
    'Cursive 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.sofia, dateFamily: FONT_FAMILIES.avenirNext },
    'Professional 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.robotoFlex, dateFamily: FONT_FAMILIES.robotoFlex },
    'Professional 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.markaziText, dateFamily: FONT_FAMILIES.markaziText },
    'Professional 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.martelDemiBold, dateFamily: FONT_FAMILIES.martelHeavy, dateWeight: '700' },
    'Bold 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.titanOne, dateFamily: FONT_FAMILIES.titanOne, previewScale: 1.08 },
    'Bold 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.bowlbyOneSc, dateFamily: FONT_FAMILIES.avenirNext, previewScale: 1.04 },
    'Bold 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.notable, dateFamily: FONT_FAMILIES.engraversGothicBt, previewScale: 1.02 },
    'Minimal 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.arial, dateFamily: FONT_FAMILIES.arial },
    'Minimal 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.avenirNext, dateFamily: FONT_FAMILIES.avenirNext },
    'Playful 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.hachiMaruPop, dateFamily: FONT_FAMILIES.centuryGothic },
    'Playful 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.originalSurfer, dateFamily: FONT_FAMILIES.originalSurfer, previewScale: 1.06 },
    'Playful 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.kiwiMaru, dateFamily: FONT_FAMILIES.kiwiMaru },
    'Elegant 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.sacramento, dateFamily: FONT_FAMILIES.palatinoLinotype, previewScale: 1.12 },
    'Elegant 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.niconne, dateFamily: FONT_FAMILIES.libreBaskerville, previewScale: 1.08 },
    'Classic 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.bahnschrift, dateFamily: FONT_FAMILIES.bahnschrift },
    'Classic 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.libreBaskerville, dateFamily: FONT_FAMILIES.libreBaskerville },
    'Classic 3': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.calibri, dateFamily: FONT_FAMILIES.calibri },
    'Modern 1': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.limelight, dateFamily: FONT_FAMILIES.avenirNext },
    'Modern 2': { ...BASE_STYLE_PRESET, nameFamily: FONT_FAMILIES.kgSorryNotSorry, dateFamily: FONT_FAMILIES.kgSorryNotSorryChub },
  };

  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  modal.setAttribute('data-personalization-preview-build', PERSONALIZATION_PREVIEW_BUILD);
  window.QuickClipsPersonalizationPreviewBuild = PERSONALIZATION_PREVIEW_BUILD;

  const styleFamilySelect = modal.querySelector('[data-personalization-input="styleFamily"]');
  const styleVariantSelect = modal.querySelector('[data-personalization-input="styleVariant"]');
  const lastNameInput = modal.querySelector('[data-personalization-input="lastName"]');
  const lastNameCount = modal.querySelector('[data-personalization-count="lastName"]');
  const dateInput = modal.querySelector('[data-personalization-input="date"]');
  const dateCount = modal.querySelector('[data-personalization-count="date"]');
  const lastNameFontSelect = modal.querySelector('[data-personalization-input="lastNameFont"]');
  const dateFontSelect = modal.querySelector('[data-personalization-input="dateFont"]');
  const flowerIconSelect = modal.querySelector('[data-personalization-input="flowerIcon"]');
  const iconRegistryUrl = String(flowerIconSelect?.dataset.personalizationIconRegistryUrl || '').trim();
  const iconDropdown = modal.querySelector('[data-personalization-icon-dropdown]');
  const iconDropdownToggle = modal.querySelector('[data-personalization-icon-dropdown-toggle]');
  const iconDropdownTogglePreview = modal.querySelector('[data-personalization-icon-dropdown-toggle-preview]');
  const iconDropdownToggleImage = modal.querySelector('[data-personalization-icon-dropdown-toggle-image]');
  const iconDropdownToggleLabel = modal.querySelector('[data-personalization-icon-dropdown-toggle-label]');
  const iconDropdownMenu = modal.querySelector('[data-personalization-icon-dropdown-menu]');
  const deterministicLastNameBox = modal.querySelector('[data-personalization-textbox="lastName"]');
  const deterministicDateBox = modal.querySelector('[data-personalization-textbox="date"]');
  const resizeHandles = Array.from(modal.querySelectorAll('[data-personalization-resize]'));
  const clipSurface = modal.querySelector('[data-personalization-clip-surface]');
  const defaultStageImageUrl = String(clipSurface?.dataset.personalizationStageImageUrl || '').trim();
  const defaultSafeAreaImageUrl = String(clipSurface?.dataset.personalizationSafeAreaUrl || '').trim();
  const stylePreviewImage = modal.querySelector('[data-personalization-style-preview-image]');
  const deterministicOverlay = modal.querySelector('[data-personalization-deterministic-overlay]');
  const deterministicLastName = modal.querySelector('[data-personalization-deterministic-last-name]');
  const deterministicDate = modal.querySelector('[data-personalization-deterministic-date]');
  const iconLayer = modal.querySelector('[data-personalization-icon-layer]');
  const removeIconButton = modal.querySelector('[data-personalization-remove-icon]');
  const safeAreaWarning = modal.querySelector('[data-personalization-safe-area-warning]');
  const safeAreaBoundary = modal.querySelector('[data-personalization-safe-area-boundary]');
  const clipGuideBoundary = modal.querySelector('[data-personalization-clip-guide-boundary]');
  const pickedPanel = modal.querySelector('[data-personalization-picked-panel]');
  const productName = modal.querySelector('[data-personalization-product-name]');
  const errorElement = modal.querySelector('[data-personalization-error]');
  const generateButton = modal.querySelector('[data-personalization-generate]');
  const generateButtonLabel = modal.querySelector('[data-personalization-generate-label]');
  const saveButton = modal.querySelector('[data-personalization-save]');
  const cancelButton = modal.querySelector('[data-personalization-cancel]');

  if (
    !styleFamilySelect ||
    !styleVariantSelect ||
    !lastNameInput ||
    !dateInput ||
    !lastNameFontSelect ||
    !dateFontSelect ||
    !flowerIconSelect ||
    !iconDropdown ||
    !iconDropdownToggle ||
    !iconDropdownTogglePreview ||
    !iconDropdownToggleImage ||
    !iconDropdownToggleLabel ||
    !iconDropdownMenu ||
    !deterministicLastNameBox ||
    !deterministicDateBox ||
    resizeHandles.length < 2 ||
    !clipSurface ||
    !stylePreviewImage ||
    !deterministicOverlay ||
    !deterministicLastName ||
    !deterministicDate ||
    !iconLayer ||
    !removeIconButton ||
    !safeAreaWarning ||
    !safeAreaBoundary ||
    !clipGuideBoundary ||
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
  const pendingIconImagePayloadByUrl = new Map();
  const safeAreaBoundsByUrl = new Map();
  const variantKeywordIndexByElement = new WeakMap();
  const pendingEligibilityScopes = new Set();

  let activeScope = '';
  let activeLastNameMax = DEFAULT_LAST_NAME_MAX;
  let activeDateMax = DEFAULT_DATE_MAX;
  let activeStageImageUrl = defaultStageImageUrl;
  let activeSafeAreaImageUrl = defaultSafeAreaImageUrl;
  let isGenerating = false;
  let generationErrorMessage = '';
  let generatedImageData = '';
  let activeSafeAreaBounds = cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
  let safeAreaBoundsPromise = null;
  let safeAreaBoundsPromiseUrl = '';
  let activeTextLayout = createDefaultTextLayout();
  let renderedTextLayout = cloneTextLayout(activeTextLayout);
  let initialTextLayout = cloneTextLayout(activeTextLayout);
  let activeIcons = [];
  let pendingFlowerIconValue = '';
  let boxInteraction = null;
  let iconInteraction = null;
  let selectedTextboxKey = '';
  let selectedIconId = '';
  let isIconDropdownOpen = false;
  let nextIconInstanceId = 1;
  let suppressFlowerIconSelectChange = false;
  let activeEditorSessionId = 0;
  let shouldValidateEngravingBounds = false;
  let hasUserMovedTextInCurrentSession = false;
  let pendingFontRefreshRequestId = 0;
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

  function isTextLayoutAtDefault(layout) {
    const candidateLayout = sanitizeTextLayout(layout || createDefaultTextLayout());
    const defaultLayout = createDefaultTextLayout();
    return !['lastName', 'date'].some((boxKey) =>
      hasLayoutChangedSignificantly(candidateLayout[boxKey], defaultLayout[boxKey])
    );
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

  function normalizeIconAspectRatio(value) {
    const aspectRatio = Number(value);
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return 1;
    return Number(clampNumber(aspectRatio, 0.05, 20).toFixed(6));
  }

  function getIconBoxDimensions(size, aspectRatio) {
    const normalizedSize = clampNumber(Number(size || 0), MIN_ICON_SIZE, MAX_ICON_SIZE);
    const normalizedAspectRatio = normalizeIconAspectRatio(aspectRatio);
    if (normalizedAspectRatio >= 1) {
      return {
        w: Number(normalizedSize.toFixed(3)),
        h: Number((normalizedSize / normalizedAspectRatio).toFixed(3)),
      };
    }
    return {
      w: Number((normalizedSize * normalizedAspectRatio).toFixed(3)),
      h: Number(normalizedSize.toFixed(3)),
    };
  }

  function getMaxIconSizeForSafeArea(safeArea, aspectRatio) {
    const normalizedAspectRatio = normalizeIconAspectRatio(aspectRatio);
    const maxByWidth = normalizedAspectRatio >= 1 ? safeArea.w : safeArea.w / normalizedAspectRatio;
    const maxByHeight = normalizedAspectRatio >= 1 ? safeArea.h * normalizedAspectRatio : safeArea.h;
    return Math.max(MIN_ICON_SIZE, Math.min(MAX_ICON_SIZE, maxByWidth, maxByHeight));
  }

  function createIconBox(layout, aspectRatio) {
    const normalizedLayout = sanitizeIconLayout(layout);
    const dimensions = getIconBoxDimensions(normalizedLayout.size, aspectRatio);
    return {
      x: Number((normalizedLayout.x - dimensions.w / 2).toFixed(3)),
      y: Number((normalizedLayout.y - dimensions.h / 2).toFixed(3)),
      w: dimensions.w,
      h: dimensions.h,
    };
  }

  function areIconLayoutsEqual(left, right, epsilon) {
    const tolerance = Number.isFinite(Number(epsilon)) ? Number(epsilon) : 0.001;
    const leftLayout = sanitizeIconLayout(left);
    const rightLayout = sanitizeIconLayout(right);
    return (
      Math.abs(leftLayout.x - rightLayout.x) <= tolerance &&
      Math.abs(leftLayout.y - rightLayout.y) <= tolerance &&
      Math.abs(leftLayout.size - rightLayout.size) <= tolerance
    );
  }

  function clampIconLayoutToSafeArea(layout, aspectRatio) {
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    const normalized = sanitizeIconLayout(layout);
    const normalizedAspectRatio = normalizeIconAspectRatio(aspectRatio);
    const size = clampNumber(
      normalized.size,
      MIN_ICON_SIZE,
      getMaxIconSizeForSafeArea(safeArea, normalizedAspectRatio)
    );
    const dimensions = getIconBoxDimensions(size, normalizedAspectRatio);
    const halfWidth = dimensions.w / 2;
    const halfHeight = dimensions.h / 2;
    const minX = safeArea.x + halfWidth;
    const maxX = safeArea.x + safeArea.w - halfWidth;
    const minY = safeArea.y + halfHeight;
    const maxY = safeArea.y + safeArea.h - halfHeight;
    return {
      x: Number(clampNumber(normalized.x, minX, Math.max(minX, maxX)).toFixed(3)),
      y: Number(clampNumber(normalized.y, minY, Math.max(minY, maxY)).toFixed(3)),
      size: Number(size.toFixed(3)),
    };
  }

  function createIconInstanceId() {
    const id = `icon-${nextIconInstanceId}`;
    nextIconInstanceId += 1;
    return id;
  }

  function cloneIconEntries(entries) {
    const sourceEntries = Array.isArray(entries) ? entries : [];
    return sourceEntries
      .map((entry) => ({
        id: String(entry?.id || createIconInstanceId()),
        value: normalizeFlowerIcon(entry?.value),
        layout: sanitizeIconLayout(entry?.layout),
      }))
      .filter((entry) => entry.value);
  }

  function normalizeIconEntries(entries, textLayout, fallbackIconValue, fallbackIconLayout) {
    const normalizedTextLayout = sanitizeTextLayout(textLayout || activeTextLayout || createDefaultTextLayout());
    const sourceEntries = Array.isArray(entries) ? entries : [];
    const normalizedEntries = [];

    sourceEntries.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const value = normalizeFlowerIcon(entry.value);
      if (!value) return;
      const aspectRatio = getIconAspectRatioForValue(value);
      const resolvedLayout = clampIconLayoutToSafeArea(
        sanitizeIconLayout(entry.layout || createDefaultIconLayout(normalizedTextLayout)),
        aspectRatio
      );
      normalizedEntries.push({
        id: String(entry.id || createIconInstanceId()),
        value,
        layout: resolvedLayout,
      });
    });

    if (normalizedEntries.length) {
      return normalizedEntries;
    }

    const fallbackValue = normalizeFlowerIcon(fallbackIconValue);
    if (!fallbackValue) return [];

    return [
      {
        id: createIconInstanceId(),
        value: fallbackValue,
        layout: clampIconLayoutToSafeArea(
          sanitizeIconLayout(fallbackIconLayout || createDefaultIconLayout(normalizedTextLayout)),
          getIconAspectRatioForValue(fallbackValue)
        ),
      },
    ];
  }

  function getIconEntryById(iconId) {
    const normalizedId = String(iconId || '').trim();
    if (!normalizedId) return null;
    return activeIcons.find((entry) => entry.id === normalizedId) || null;
  }

  function getSelectedIconEntry() {
    return getIconEntryById(selectedIconId);
  }

  function getPrimaryIconEntry(entries) {
    const sourceEntries = Array.isArray(entries) ? entries : [];
    return sourceEntries.length ? sourceEntries[0] : null;
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
    const advanceWidth = Math.max(1, Number(metrics.width || 0));
    return {
      width: Math.max(1, advanceWidth, actualLeft + actualRight),
      advanceWidth,
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

  function getTextboxSafeArea() {
    return sanitizeSafeAreaBounds(activeSafeAreaBounds);
  }

  function getTextboxResizeSafeArea() {
    return getTextboxSafeArea();
  }

  function isLayoutWithinBounds(layout, bounds, tolerance) {
    if (!layout || !bounds) return true;
    const normalizedLayout = {
      x: Number(layout.x || 0),
      y: Number(layout.y || 0),
      w: Number(layout.w || 0),
      h: Number(layout.h || 0),
    };
    const normalizedBounds = {
      x: Number(bounds.x || 0),
      y: Number(bounds.y || 0),
      w: Number(bounds.w || 0),
      h: Number(bounds.h || 0),
    };
    const safeTolerance = Math.max(0, Number(tolerance || 0));
    const layoutRight = normalizedLayout.x + normalizedLayout.w;
    const layoutBottom = normalizedLayout.y + normalizedLayout.h;
    const boundsRight = normalizedBounds.x + normalizedBounds.w;
    const boundsBottom = normalizedBounds.y + normalizedBounds.h;
    return (
      normalizedLayout.x >= normalizedBounds.x - safeTolerance &&
      normalizedLayout.y >= normalizedBounds.y - safeTolerance &&
      layoutRight <= boundsRight + safeTolerance &&
      layoutBottom <= boundsBottom + safeTolerance
    );
  }

  function isIconLayoutAtDefault(layout, textLayout) {
    const baselineTextLayout = sanitizeTextLayout(textLayout || activeTextLayout);
    const candidateLayout = sanitizeIconLayout(layout || createDefaultIconLayout(baselineTextLayout));
    const defaultLayout = sanitizeIconLayout(createDefaultIconLayout(baselineTextLayout));
    return (
      Math.abs(candidateLayout.x - defaultLayout.x) <= ICON_LAYOUT_CHANGE_EPSILON &&
      Math.abs(candidateLayout.y - defaultLayout.y) <= ICON_LAYOUT_CHANGE_EPSILON &&
      Math.abs(candidateLayout.size - defaultLayout.size) <= ICON_LAYOUT_CHANGE_EPSILON
    );
  }

  function syncPreviewLayoutForInitialPlacement() {
    const shouldResetTextLayout = isTextLayoutAtDefault(activeTextLayout);
    const shouldResetIconLayout =
      activeIcons.length === 1 && isIconLayoutAtDefault(activeIcons[0].layout, activeTextLayout);
    if (!shouldResetTextLayout && !shouldResetIconLayout) return false;

    if (shouldResetTextLayout) {
      activeTextLayout = createDefaultTextLayout();
      renderedTextLayout = cloneTextLayout(activeTextLayout);
      initialTextLayout = cloneTextLayout(activeTextLayout);
    }

    if (shouldResetIconLayout) {
      const currentIcon = activeIcons[0];
      if (currentIcon) {
        const resetLayout = clampIconLayoutToSafeArea(
          sanitizeIconLayout(createDefaultIconLayout(activeTextLayout)),
          getIconAspectRatioForEntry(currentIcon)
        );
        activeIcons = [
          {
            ...currentIcon,
            layout: resetLayout,
          },
        ];
      }
    }

    return true;
  }

  async function refreshPreviewAfterFontsReady(options = {}) {
    const refreshRequestId = ++pendingFontRefreshRequestId;
    const shouldSyncInitialPlacement = Boolean(options.syncInitialPlacement);
    if (shouldSyncInitialPlacement) {
      syncPreviewLayoutForInitialPlacement();
    }

    renderEditorState();

    if (!modal.hasAttribute('open')) return;
    if (!document.fonts || typeof document.fonts.load !== 'function') return;

    const selectedStyle = getSelectedStyle();
    const stylePreset = getStylePreset(selectedStyle);
    const activeFonts = getActiveFontFamilies(selectedStyle);
    const nameSample = lastNameInput.value.trim() || DEFAULT_LAST_NAME_VALUE;
    const dateSample = dateInput.value.trim() || DEFAULT_DATE_VALUE;

    await Promise.allSettled([
      document.fonts.load(`600 48px ${activeFonts.lastName}`, nameSample),
      document.fonts.load(`${stylePreset.dateWeight || '600'} 36px ${activeFonts.date}`, dateSample),
    ]);

    if (refreshRequestId !== pendingFontRefreshRequestId) return;
    if (!modal.hasAttribute('open')) return;

    if (shouldSyncInitialPlacement) {
      syncPreviewLayoutForInitialPlacement();
    }

    renderEditorState();
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
    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) return DEFAULT_STYLE;
    if (STYLE_VALUES.includes(normalizedValue)) return normalizedValue;
    if (STYLE_LEGACY_ALIASES[normalizedValue]) return STYLE_LEGACY_ALIASES[normalizedValue];
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
      previewInsetX: resolvePositiveNumber(stylePreset.previewInsetX, 0),
      previewInsetY: resolvePositiveNumber(stylePreset.previewInsetY, 0),
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
        const absoluteRegistryUrl = new URL(iconRegistryUrl, window.location.href).toString();
        return new URL(normalizedAssetPath, absoluteRegistryUrl).toString();
      } catch (error) {
        return normalizedAssetPath;
      }
    }
    return normalizedAssetPath;
  }

  function getDefaultIconTrimBounds() {
    return { x: 0, y: 0, w: 1, h: 1 };
  }

  function normalizeIconTrimBounds(trimBounds) {
    const fallback = getDefaultIconTrimBounds();
    const source = trimBounds || fallback;
    const width = clampNumber(Number(source.w), 0.001, 1);
    const height = clampNumber(Number(source.h), 0.001, 1);
    const x = clampNumber(Number(source.x), 0, 1 - width);
    const y = clampNumber(Number(source.y), 0, 1 - height);
    return {
      x: Number(x.toFixed(6)),
      y: Number(y.toFixed(6)),
      w: Number(width.toFixed(6)),
      h: Number(height.toFixed(6)),
    };
  }

  function getIconMaskPositionPercent(start, size) {
    const safeSize = clampNumber(Number(size), 0.001, 1);
    if (safeSize >= 0.9999) return '50%';
    const travel = 1 - safeSize;
    const safeStart = clampNumber(Number(start), 0, travel);
    return `${((safeStart / travel) * 100).toFixed(3)}%`;
  }

  function resolveTrimmedIconAspectRatio(trimBounds, sourceWidth, sourceHeight) {
    const normalizedBounds = normalizeIconTrimBounds(trimBounds);
    const width = Math.max(1, Number(sourceWidth || 0));
    const height = Math.max(1, Number(sourceHeight || 0));
    const trimmedWidth = Math.max(1, normalizedBounds.w * width);
    const trimmedHeight = Math.max(1, normalizedBounds.h * height);
    return normalizeIconAspectRatio(trimmedWidth / trimmedHeight);
  }

  function applyIconLayoutMetrics(iconElement, iconLayout, aspectRatio) {
    if (!(iconElement instanceof HTMLElement)) return;
    const normalizedLayout = sanitizeIconLayout(iconLayout);
    const dimensions = getIconBoxDimensions(normalizedLayout.size, aspectRatio);
    iconElement.style.setProperty('--icon-box-width', `${dimensions.w.toFixed(3)}%`);
    iconElement.style.setProperty('--icon-box-height', `${dimensions.h.toFixed(3)}%`);
  }

  function applyIconTrimBounds(iconElement, trimBounds) {
    if (!(iconElement instanceof HTMLElement)) return;
    const normalizedBounds = normalizeIconTrimBounds(trimBounds);
    iconElement.style.setProperty('--icon-mask-size-x', `${(100 / normalizedBounds.w).toFixed(3)}%`);
    iconElement.style.setProperty('--icon-mask-size-y', `${(100 / normalizedBounds.h).toFixed(3)}%`);
    iconElement.style.setProperty('--icon-mask-pos-x', getIconMaskPositionPercent(normalizedBounds.x, normalizedBounds.w));
    iconElement.style.setProperty('--icon-mask-pos-y', getIconMaskPositionPercent(normalizedBounds.y, normalizedBounds.h));
  }

  function clearIconTrimBounds(iconElement) {
    if (!(iconElement instanceof HTMLElement)) return;
    iconElement.style.removeProperty('--icon-mask-size-x');
    iconElement.style.removeProperty('--icon-mask-size-y');
    iconElement.style.removeProperty('--icon-mask-pos-x');
    iconElement.style.removeProperty('--icon-mask-pos-y');
  }

  function resolveImageTrimBounds(imageElement) {
    if (!imageElement) return getDefaultIconTrimBounds();
    const width = imageElement.naturalWidth || imageElement.width || 0;
    const height = imageElement.naturalHeight || imageElement.height || 0;
    if (!width || !height) return getDefaultIconTrimBounds();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return getDefaultIconTrimBounds();

    context.clearRect(0, 0, width, height);
    context.drawImage(imageElement, 0, 0, width, height);

    let imageData = null;
    try {
      imageData = context.getImageData(0, 0, width, height).data;
    } catch (error) {
      return getDefaultIconTrimBounds();
    }
    if (!imageData) return getDefaultIconTrimBounds();

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    const alphaThreshold = 10;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha <= alphaThreshold) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) {
      return getDefaultIconTrimBounds();
    }

    const pad = 1;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    return normalizeIconTrimBounds({
      x: minX / width,
      y: minY / height,
      w: (maxX - minX + 1) / width,
      h: (maxY - minY + 1) / height,
    });
  }

  function resolveTrimmedIconSourceRect(trimBounds, sourceWidth, sourceHeight) {
    const normalizedBounds = normalizeIconTrimBounds(trimBounds);
    const width = Math.max(1, Number(sourceWidth || 0));
    const height = Math.max(1, Number(sourceHeight || 0));
    const x = clampNumber(normalizedBounds.x * width, 0, width - 1);
    const y = clampNumber(normalizedBounds.y * height, 0, height - 1);
    const w = clampNumber(normalizedBounds.w * width, 1, width - x);
    const h = clampNumber(normalizedBounds.h * height, 1, height - y);
    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      w: Number(w.toFixed(3)),
      h: Number(h.toFixed(3)),
    };
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

  function getFlowerIconOptionByValue(value) {
    const normalizedValue = normalizeFlowerIcon(value);
    if (!normalizedValue) return null;
    const option = Array.from(flowerIconSelect.options).find((candidate) => candidate.value === normalizedValue);
    if (!option) return null;
    return {
      value: normalizedValue,
      label: String(option.textContent || '').trim() || humanizeIconValue(normalizedValue),
      url: String(option.dataset.iconUrl || '').trim(),
    };
  }

  function getFlowerIconOptionEntries() {
    const entries = [];
    const seen = new Set();
    Array.from(flowerIconSelect.options).forEach((optionElement) => {
      const normalizedValue = normalizeIconValue(optionElement.value);
      const value = normalizedValue || '';
      if (seen.has(value)) return;
      seen.add(value);
      entries.push({
        value,
        label:
          String(optionElement.textContent || '').trim() ||
          (value ? humanizeIconValue(value) : 'No icon'),
        url: String(optionElement.dataset.iconUrl || '').trim(),
      });
    });
    return entries;
  }

  function setIconDropdownOpen(open) {
    const nextOpen = Boolean(open);
    if (isIconDropdownOpen === nextOpen) return;
    isIconDropdownOpen = nextOpen;
    iconDropdown.classList.toggle('is-open', nextOpen);
    iconDropdownToggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    iconDropdownMenu.toggleAttribute('hidden', !nextOpen);
  }

  function syncIconDropdownSelection() {
    const selectedValue = getSelectedFlowerIconValue();
    iconDropdownMenu.querySelectorAll('[data-personalization-icon-option-value]').forEach((buttonElement) => {
      if (!(buttonElement instanceof HTMLButtonElement)) return;
      const optionValue = normalizeIconValue(buttonElement.dataset.personalizationIconOptionValue);
      const isSelected = selectedValue ? optionValue === selectedValue : !optionValue;
      buttonElement.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  function syncIconDropdownToggle() {
    const selectedIcon = getFlowerIconOptionByValue(getSelectedFlowerIconValue());
    if (selectedIcon && selectedIcon.url) {
      iconDropdownToggleLabel.textContent = selectedIcon.label;
      iconDropdownToggleImage.src = selectedIcon.url;
      iconDropdownTogglePreview.removeAttribute('hidden');
      return;
    }
    iconDropdownToggleLabel.textContent = 'No icon';
    iconDropdownToggleImage.removeAttribute('src');
    iconDropdownTogglePreview.setAttribute('hidden', '');
  }

  function renderFlowerIconDropdownOptions() {
    iconDropdownMenu.innerHTML = '';
    getFlowerIconOptionEntries().forEach((entry) => {
      const optionButton = document.createElement('button');
      optionButton.type = 'button';
      optionButton.className = 'personalization-preview-modal__icon-dropdown-option';
      optionButton.dataset.personalizationIconOptionValue = entry.value;
      optionButton.setAttribute('role', 'option');
      optionButton.setAttribute('aria-selected', 'false');
      optionButton.draggable = Boolean(entry.value && entry.url);

      if (entry.url) {
        const iconImage = document.createElement('img');
        iconImage.className = 'personalization-preview-modal__icon-dropdown-option-image';
        iconImage.src = entry.url;
        iconImage.alt = '';
        iconImage.loading = 'lazy';
        optionButton.appendChild(iconImage);
      } else {
        const iconPlaceholder = document.createElement('span');
        iconPlaceholder.className = 'personalization-preview-modal__icon-dropdown-option-image is-placeholder';
        iconPlaceholder.setAttribute('aria-hidden', 'true');
        optionButton.appendChild(iconPlaceholder);
      }

      const label = document.createElement('span');
      label.className = 'personalization-preview-modal__icon-dropdown-option-label';
      label.textContent = entry.label;
      optionButton.appendChild(label);
      iconDropdownMenu.appendChild(optionButton);
    });
    syncIconDropdownSelection();
    syncIconDropdownToggle();
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

    const resolvedValue = setFlowerIconValue(preferredValue || pendingFlowerIconValue || flowerIconSelect.value || '');
    renderFlowerIconDropdownOptions();
    return resolvedValue;
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
      syncIconDropdownSelection();
      syncIconDropdownToggle();
      return flowerIconSelect.value;
    }
    pendingFlowerIconValue = normalizedValue || '';
    flowerIconSelect.value = '';
    syncIconDropdownSelection();
    syncIconDropdownToggle();
    return flowerIconSelect.value;
  }

  function getSelectedFlowerIconValue() {
    const selectedIcon = getSelectedIconEntry();
    return selectedIcon ? selectedIcon.value : '';
  }

  function getSelectedFlowerIconUrl(value) {
    const selectedIcon = getFlowerIconOptionByValue(value);
    return selectedIcon ? selectedIcon.url : '';
  }

  function getCachedIconPayloadByUrl(iconUrl) {
    const normalizedIconUrl = String(iconUrl || '').trim();
    if (!normalizedIconUrl) return null;
    return iconImagePayloadCache.get(normalizedIconUrl) || null;
  }

  function getIconAspectRatioForUrl(iconUrl) {
    const payload = getCachedIconPayloadByUrl(iconUrl);
    return normalizeIconAspectRatio(payload && payload.aspectRatio);
  }

  function getIconAspectRatioForValue(value) {
    const iconUrl = getSelectedFlowerIconUrl(value);
    return getIconAspectRatioForUrl(iconUrl);
  }

  function getIconAspectRatioForEntry(entry) {
    return getIconAspectRatioForValue(entry && entry.value);
  }

  function syncFlowerIconPickerValue() {
    const selectedValue = getSelectedFlowerIconValue();
    suppressFlowerIconSelectChange = true;
    setFlowerIconValue(selectedValue);
    suppressFlowerIconSelectChange = false;
  }

  function syncIconSelectionState() {
    const normalizedSelectedId = String(selectedIconId || '').trim();
    iconLayer.querySelectorAll('[data-personalization-icon-id]').forEach((iconElement) => {
      if (!(iconElement instanceof HTMLElement)) return;
      const iconId = String(iconElement.dataset.personalizationIconId || '').trim();
      iconElement.classList.toggle('is-selected', Boolean(normalizedSelectedId) && iconId === normalizedSelectedId);
    });
  }

  function setIconSelected(selected) {
    if (selected) {
      if (!selectedIconId) {
        const fallbackIcon = activeIcons[activeIcons.length - 1] || null;
        selectedIconId = fallbackIcon ? fallbackIcon.id : '';
      }
    } else {
      selectedIconId = '';
    }
    syncIconSelectionState();
    syncFlowerIconPickerValue();
    syncRemoveIconButton();
  }

  function syncRemoveIconButton() {
    removeIconButton.toggleAttribute('hidden', !selectedIconId);
  }

  function clearSelectedFlowerIcon() {
    if (!selectedIconId) return;
    onIconPointerUp();
    setIconDropdownOpen(false);
    invalidateGeneratedPreview();
    activeIcons = activeIcons.filter((entry) => entry.id !== selectedIconId);
    selectedIconId = '';
    setIconSelected(Boolean(activeIcons.length));
    setGenerationError('');
    renderEditorState();
  }

  function updateIconEntryLayout(iconId, nextLayout) {
    const normalizedId = String(iconId || '').trim();
    if (!normalizedId) return false;
    let didUpdate = false;
    activeIcons = activeIcons.map((entry) => {
      if (entry.id !== normalizedId) return entry;
      const aspectRatio = getIconAspectRatioForEntry(entry);
      didUpdate = true;
      return {
        ...entry,
        layout: clampIconLayoutToSafeArea(sanitizeIconLayout(nextLayout), aspectRatio),
      };
    });
    return didUpdate;
  }

  function addIconToClip(iconValue, layoutOverride) {
    const normalizedValue = normalizeFlowerIcon(iconValue);
    const iconUrl = getSelectedFlowerIconUrl(normalizedValue);
    if (!normalizedValue || !iconUrl) return false;
    const defaultLayout = createDefaultIconLayout(activeTextLayout);
    const aspectRatio = getIconAspectRatioForValue(normalizedValue);
    const normalizedLayout = clampIconLayoutToSafeArea(
      sanitizeIconLayout({
        ...defaultLayout,
        ...(layoutOverride || {}),
      }),
      aspectRatio
    );
    const iconEntry = {
      id: createIconInstanceId(),
      value: normalizedValue,
      layout: normalizedLayout,
    };
    activeIcons = [...activeIcons, iconEntry];
    selectedIconId = iconEntry.id;
    setSelectedTextbox('');
    invalidateGeneratedPreview();
    armEngravingWarningState();
    syncFlowerIconPickerValue();
    setGenerationError('');
    renderEditorState();
    return true;
  }

  function getRenderableIconEntries(iconEntriesOverride) {
    const sourceEntries = normalizeIconEntries(iconEntriesOverride ?? activeIcons, activeTextLayout);
    return sourceEntries
      .map((entry) => ({
        id: entry.id,
        value: entry.value,
        url: getSelectedFlowerIconUrl(entry.value),
        layout: sanitizeIconLayout(entry.layout),
      }))
      .filter((entry) => entry.url);
  }

  function renderFlowerIcon() {
    const normalizedIcons = normalizeIconEntries(activeIcons, activeTextLayout);
    activeIcons = normalizedIcons;
    iconLayer.innerHTML = '';
    const stylePreset = getStylePreset(getSelectedStyle());
    if (!activeIcons.length) {
      selectedIconId = '';
      syncFlowerIconPickerValue();
      syncRemoveIconButton();
      return;
    }

    if (selectedIconId && !getIconEntryById(selectedIconId)) {
      selectedIconId = '';
    }
    if (!selectedIconId) {
      selectedIconId = activeIcons[activeIcons.length - 1].id;
    }

    activeIcons.forEach((iconEntry) => {
      const iconUrl = getSelectedFlowerIconUrl(iconEntry.value);
      if (!iconUrl) return;

      const iconElement = document.createElement('div');
      iconElement.className = 'personalization-preview-modal__deterministic-icon';
      iconElement.dataset.personalizationIconId = iconEntry.id;
      iconElement.style.setProperty('--icon-x', `${iconEntry.layout.x}%`);
      iconElement.style.setProperty('--icon-y', `${iconEntry.layout.y}%`);
      iconElement.style.setProperty('--icon-size', `${iconEntry.layout.size}%`);
      iconElement.style.setProperty('--icon-mask-image', `url("${iconUrl.replace(/"/g, '\\"')}")`);
      iconElement.style.setProperty('--icon-color', stylePreset.color || BASE_STYLE_PRESET.color);

      if (iconEntry.id === selectedIconId) {
        iconElement.classList.add('is-selected');
      }
      if (iconInteraction && iconInteraction.iconId === iconEntry.id) {
        iconElement.classList.add('is-active');
      }

      const iconImage = document.createElement('img');
      iconImage.className = 'personalization-preview-modal__deterministic-icon-image';
      iconImage.src = iconUrl;
      iconImage.alt = 'Selected icon';
      iconImage.loading = 'lazy';
      iconElement.appendChild(iconImage);

      const resizeHandle = document.createElement('button');
      resizeHandle.type = 'button';
      resizeHandle.className = 'personalization-preview-modal__icon-resize-handle';
      resizeHandle.dataset.personalizationIconResize = iconEntry.id;
      resizeHandle.setAttribute('aria-label', 'Resize icon');
      iconElement.appendChild(resizeHandle);

      const cachedIconPayload = getCachedIconPayloadByUrl(iconUrl);
      applyIconLayoutMetrics(iconElement, iconEntry.layout, cachedIconPayload && cachedIconPayload.aspectRatio);
      if (cachedIconPayload && cachedIconPayload.trimBounds) {
        applyIconTrimBounds(iconElement, cachedIconPayload.trimBounds);
      } else {
        clearIconTrimBounds(iconElement);
        void getIconImagePayload(iconUrl).then((iconPayload) => {
          if (!iconPayload || !iconPayload.trimBounds) return;
          const currentIcon = getIconEntryById(iconEntry.id);
          if (!currentIcon) return;
          if (getSelectedFlowerIconUrl(currentIcon.value) !== iconUrl) return;
          const normalizedLayout = clampIconLayoutToSafeArea(currentIcon.layout, iconPayload.aspectRatio);
          if (!areIconLayoutsEqual(normalizedLayout, currentIcon.layout)) {
            updateIconEntryLayout(iconEntry.id, normalizedLayout);
            renderEditorState();
            return;
          }
          applyIconLayoutMetrics(iconElement, normalizedLayout, iconPayload.aspectRatio);
          applyIconTrimBounds(iconElement, iconPayload.trimBounds);
        });
      }

      iconLayer.appendChild(iconElement);
    });

    syncIconSelectionState();
    syncRemoveIconButton();
  }

  function setTextboxCenterSnapState(boxKey, isSnapped) {
    const boxElement = getTextboxByKey(boxKey);
    if (!boxElement) return;
    boxElement.classList.toggle('is-center-snapped', Boolean(isSnapped));
  }

  populateFontSelect(lastNameFontSelect);
  populateFontSelect(dateFontSelect);
  populateStyleFamilyOptions();
  setSelectedStyle(DEFAULT_STYLE);
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

  function getFormAssociatedControls(formElement) {
    if (!(formElement instanceof HTMLFormElement)) return [];
    const associatedControls = new Set();

    formElement.querySelectorAll('input, select, textarea').forEach((control) => {
      associatedControls.add(control);
    });

    const formId = String(formElement.id || '').trim();
    if (formId) {
      const escapedFormId = selectorEscape(formId);
      document
        .querySelectorAll(
          `input[form="${escapedFormId}"], select[form="${escapedFormId}"], textarea[form="${escapedFormId}"]`
        )
        .forEach((control) => {
          associatedControls.add(control);
        });
    }

    return Array.from(associatedControls);
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
    const associatedControls = getFormAssociatedControls(formElement);

    const checkedRadiosByName = new Map();
    associatedControls.forEach((control) => {
      if (!(control instanceof HTMLInputElement)) return;
      if (control.type !== 'radio' || !control.name || !control.checked) return;
      checkedRadiosByName.set(control.name, control);
    });
    checkedRadiosByName.forEach((control) => {
      selectedValues.push(String(control.value || '').trim());
    });

    associatedControls.forEach((control) => {
      if (control instanceof HTMLInputElement && control.type === 'checkbox' && control.checked) {
        selectedValues.push(String(control.value || '').trim());
        return;
      }

      if (!(control instanceof HTMLSelectElement)) return;
      if (control.selectedOptions && control.selectedOptions.length) {
        Array.from(control.selectedOptions).forEach((selectedOption) => {
          selectedValues.push(String(selectedOption.value || selectedOption.textContent || '').trim());
        });
        return;
      }

      selectedValues.push(String(control.value || '').trim());
    });

    return selectedValues;
  }

  function formHasCustomEngravingOption(formElement) {
    if (!formElement) return false;
    const associatedControls = getFormAssociatedControls(formElement);
    if (!associatedControls.length) return false;

    for (const control of associatedControls) {
      if (control instanceof HTMLInputElement) {
        if (control.type !== 'radio' && control.type !== 'checkbox') continue;
        if (hasCustomEngravingKeyword(control.value)) {
          return true;
        }
        continue;
      }

      if (!(control instanceof HTMLSelectElement)) continue;
      const options = Array.from(control.options || []);
      if (
        options.some((option) =>
          hasCustomEngravingKeyword(String(option.value || option.textContent || '').trim())
        )
      ) {
        return true;
      }
    }

    return false;
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
    const defaultTextLayout = createDefaultTextLayout();
    return {
      style: DEFAULT_STYLE,
      lastName: DEFAULT_LAST_NAME_VALUE,
      date: DEFAULT_DATE_VALUE,
      lastNameFont: defaultPreset.nameFamily,
      dateFont: defaultPreset.dateFamily,
      flowerIcon: '',
      icons: [],
      textLayout: defaultTextLayout,
      iconLayout: createDefaultIconLayout(defaultTextLayout),
      geminiSummary: '',
      generatedImage: '',
      stagePreviewDataUrl: '',
      previewOpened: true,
      maxLastName: DEFAULT_LAST_NAME_MAX,
      maxDate: DEFAULT_DATE_MAX,
      isSaved: false,
    };
  }

  function getScopeState(scope) {
    if (!scope) return null;
    return stateByScope.get(scope) || null;
  }

  function setScopeState(scope, nextState) {
    if (!scope) return;
    const currentState = getScopeState(scope) || createDefaultState();
    const hasExplicitIcons = Object.prototype.hasOwnProperty.call(nextState || {}, 'icons');
    const normalizedTextLayout = clampTextLayoutToSafeArea(nextState.textLayout ?? currentState.textLayout);
    const normalizedIcons = normalizeIconEntries(
      nextState.icons ?? currentState.icons,
      normalizedTextLayout,
      hasExplicitIcons ? '' : nextState.flowerIcon ?? currentState.flowerIcon,
      hasExplicitIcons ? null : nextState.iconLayout ?? currentState.iconLayout
    );
    const primaryIcon = getPrimaryIconEntry(normalizedIcons);

    stateByScope.set(scope, {
      style: normalizeStyle(nextState.style || currentState.style),
      lastName: String(nextState.lastName ?? currentState.lastName ?? '').trim(),
      date: String(nextState.date ?? currentState.date ?? '').trim(),
      lastNameFont: String(nextState.lastNameFont ?? currentState.lastNameFont ?? '').trim(),
      dateFont: String(nextState.dateFont ?? currentState.dateFont ?? '').trim(),
      flowerIcon: primaryIcon ? primaryIcon.value : '',
      icons: cloneIconEntries(normalizedIcons),
      textLayout: normalizedTextLayout,
      iconLayout: primaryIcon
        ? sanitizeIconLayout(primaryIcon.layout)
        : sanitizeIconLayout(nextState.iconLayout ?? currentState.iconLayout ?? createDefaultIconLayout(normalizedTextLayout)),
      geminiSummary: String(nextState.geminiSummary ?? currentState.geminiSummary ?? '').trim(),
      generatedImage: String(nextState.generatedImage ?? currentState.generatedImage ?? '').trim(),
      stagePreviewDataUrl: String(nextState.stagePreviewDataUrl ?? currentState.stagePreviewDataUrl ?? '').trim(),
      previewOpened: Boolean(nextState.previewOpened ?? currentState.previewOpened),
      maxLastName: parseMaxLength(nextState.maxLastName ?? currentState.maxLastName, DEFAULT_LAST_NAME_MAX),
      maxDate: parseMaxLength(nextState.maxDate ?? currentState.maxDate, DEFAULT_DATE_MAX),
      isSaved: Boolean(nextState.isSaved ?? currentState.isSaved),
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

  function normalizeStyleFamily(value) {
    const normalizedFamily = String(value || '').trim();
    if (normalizedFamily && STYLE_OPTIONS_BY_FAMILY[normalizedFamily]) return normalizedFamily;
    return DEFAULT_STYLE_FAMILY;
  }

  function populateStyleFamilyOptions() {
    styleFamilySelect.innerHTML = '';
    STYLE_FAMILY_VALUES.forEach((family) => {
      const optionElement = document.createElement('option');
      optionElement.value = family;
      optionElement.textContent = family;
      styleFamilySelect.appendChild(optionElement);
    });
    setSelectValue(styleFamilySelect, styleFamilySelect.value, DEFAULT_STYLE_FAMILY);
  }

  function populateStyleVariantOptions(styleFamily, preferredStyleValue) {
    const normalizedFamily = normalizeStyleFamily(styleFamily);
    const styleOptions = STYLE_OPTIONS_BY_FAMILY[normalizedFamily] || [];
    styleVariantSelect.innerHTML = '';

    if (!styleOptions.length) {
      const fallbackStyle = normalizeStyle(preferredStyleValue || DEFAULT_STYLE);
      const optionElement = document.createElement('option');
      optionElement.value = fallbackStyle;
      optionElement.textContent = fallbackStyle;
      styleVariantSelect.appendChild(optionElement);
      styleVariantSelect.value = fallbackStyle;
      return fallbackStyle;
    }

    styleOptions.forEach((styleOption) => {
      const optionElement = document.createElement('option');
      optionElement.value = styleOption.value;
      optionElement.textContent = styleOption.label;
      styleVariantSelect.appendChild(optionElement);
    });

    const normalizedPreferredStyle = normalizeStyle(preferredStyleValue);
    const hasPreferredOption = styleOptions.some((styleOption) => styleOption.value === normalizedPreferredStyle);
    const fallbackStyle = styleOptions[0].value;
    styleVariantSelect.value = hasPreferredOption ? normalizedPreferredStyle : fallbackStyle;
    return normalizeStyle(styleVariantSelect.value);
  }

  function getSelectedStyle() {
    return normalizeStyle(styleVariantSelect.value || DEFAULT_STYLE);
  }

  function setSelectedStyle(styleValue) {
    const normalizedStyle = normalizeStyle(styleValue);
    const styleMetadata = STYLE_METADATA_BY_VALUE[normalizedStyle];
    const styleFamily = normalizeStyleFamily(styleMetadata ? styleMetadata.family : DEFAULT_STYLE_FAMILY);
    setSelectValue(styleFamilySelect, styleFamily, DEFAULT_STYLE_FAMILY);
    return populateStyleVariantOptions(styleFamily, normalizedStyle);
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
    return `is-${normalizeStyle(styleValue).toLowerCase().replace(/\s+/g, '-')}`;
  }

  function getStyleImageUrl(styleValue) {
    return activeStageImageUrl || '';
  }

  function setActiveStageImageUrl(nextUrl) {
    const normalizedUrl = String(nextUrl || '').trim() || defaultStageImageUrl || '';
    activeStageImageUrl = normalizedUrl;
    const isMiniStage = normalizedUrl.toLowerCase().includes(MINI_STAGE_IMAGE_KEYWORD);
    clipSurface.classList.toggle('is-mini-stage', isMiniStage);
    clipGuideBoundary.toggleAttribute('hidden', !isMiniStage);
    if (normalizedUrl) {
      clipSurface.dataset.personalizationStageImageUrl = normalizedUrl;
      return;
    }

    delete clipSurface.dataset.personalizationStageImageUrl;
  }

  function setActiveSafeAreaImageUrl(nextUrl) {
    const normalizedUrl = String(nextUrl || '').trim() || defaultSafeAreaImageUrl || '';
    activeSafeAreaImageUrl = normalizedUrl;
    safeAreaBoundsPromise = null;
    safeAreaBoundsPromiseUrl = '';
    const cachedBounds = safeAreaBoundsByUrl.get(normalizedUrl);
    activeSafeAreaBounds = cloneSafeAreaBounds(cachedBounds || DEFAULT_SAFE_AREA_BOUNDS);
    applySafeAreaBoundaryLayout();
    applyClipGuideBoundaryLayout();
    if (normalizedUrl) {
      clipSurface.dataset.personalizationSafeAreaUrl = normalizedUrl;
      return;
    }

    delete clipSurface.dataset.personalizationSafeAreaUrl;
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

  function invalidateGeneratedPreview() {
    if (!generatedImageData) return;
    setGeneratedImage('');
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
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const maxScanDimension = 700;
    const scale = Math.min(1, maxScanDimension / Math.max(sourceWidth || 1, sourceHeight || 1));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
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
    const darkMask = new Uint8Array(width * height);
    const edgeMask = new Uint8Array(width * height);
    const queueX = [];
    const queueY = [];
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
        darkMask[y * width + x] = 1;
      }
    }

    function queueEdgePixel(x, y) {
      const maskIndex = y * width + x;
      if (!darkMask[maskIndex] || edgeMask[maskIndex]) return;
      edgeMask[maskIndex] = 1;
      queueX.push(x);
      queueY.push(y);
    }

    for (let x = SAFE_AREA_SCAN_PADDING; x < width - SAFE_AREA_SCAN_PADDING; x += 1) {
      queueEdgePixel(x, SAFE_AREA_SCAN_PADDING);
      queueEdgePixel(x, height - SAFE_AREA_SCAN_PADDING - 1);
    }
    for (let y = SAFE_AREA_SCAN_PADDING; y < height - SAFE_AREA_SCAN_PADDING; y += 1) {
      queueEdgePixel(SAFE_AREA_SCAN_PADDING, y);
      queueEdgePixel(width - SAFE_AREA_SCAN_PADDING - 1, y);
    }

    while (queueX.length) {
      const x = queueX.pop();
      const y = queueY.pop();
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      neighbors.forEach(([nextX, nextY]) => {
        if (
          nextX < SAFE_AREA_SCAN_PADDING ||
          nextY < SAFE_AREA_SCAN_PADDING ||
          nextX >= width - SAFE_AREA_SCAN_PADDING ||
          nextY >= height - SAFE_AREA_SCAN_PADDING
        ) {
          return;
        }
        const nextIndex = nextY * width + nextX;
        if (!darkMask[nextIndex] || edgeMask[nextIndex]) return;
        edgeMask[nextIndex] = 1;
        queueX.push(nextX);
        queueY.push(nextY);
      });
    }

    for (let y = SAFE_AREA_SCAN_PADDING; y < height - SAFE_AREA_SCAN_PADDING; y += 1) {
      for (let x = SAFE_AREA_SCAN_PADDING; x < width - SAFE_AREA_SCAN_PADDING; x += 1) {
        const maskIndex = y * width + x;
        if (!darkMask[maskIndex] || edgeMask[maskIndex]) continue;
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

  async function resolveSafeAreaBounds(safeAreaUrl) {
    if (!safeAreaUrl) {
      return cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
    }

    try {
      const response = await fetch(safeAreaUrl, { cache: 'force-cache' });
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
    const safeAreaUrl = String(activeSafeAreaImageUrl || '').trim();
    if (!safeAreaUrl) {
      activeSafeAreaBounds = cloneSafeAreaBounds(DEFAULT_SAFE_AREA_BOUNDS);
      applySafeAreaBoundaryLayout();
      applyClipGuideBoundaryLayout();
      return Promise.resolve(cloneSafeAreaBounds(activeSafeAreaBounds));
    }

    if (safeAreaBoundsByUrl.has(safeAreaUrl)) {
      activeSafeAreaBounds = cloneSafeAreaBounds(safeAreaBoundsByUrl.get(safeAreaUrl));
      applySafeAreaBoundaryLayout();
      applyClipGuideBoundaryLayout();
      return Promise.resolve(cloneSafeAreaBounds(activeSafeAreaBounds));
    }

    if (safeAreaBoundsPromise && safeAreaBoundsPromiseUrl === safeAreaUrl) {
      return safeAreaBoundsPromise;
    }

    safeAreaBoundsPromiseUrl = safeAreaUrl;
    safeAreaBoundsPromise = resolveSafeAreaBounds(safeAreaUrl)
      .then((bounds) => {
        const sanitizedBounds = sanitizeSafeAreaBounds(bounds);
        safeAreaBoundsByUrl.set(safeAreaUrl, sanitizedBounds);
        if (activeSafeAreaImageUrl === safeAreaUrl) {
          activeSafeAreaBounds = cloneSafeAreaBounds(sanitizedBounds);
          applySafeAreaBoundaryLayout();
          applyClipGuideBoundaryLayout();
        }
        return cloneSafeAreaBounds(sanitizedBounds);
      })
      .catch(() => cloneSafeAreaBounds(activeSafeAreaBounds))
      .finally(() => {
        if (safeAreaBoundsPromiseUrl === safeAreaUrl) {
          safeAreaBoundsPromise = null;
        }
      });

    return safeAreaBoundsPromise;
  }

  function applyClipGuideBoundaryLayout() {
    if (!clipGuideBoundary) return;
    const safeArea = sanitizeSafeAreaBounds(activeSafeAreaBounds);
    clipGuideBoundary.style.setProperty('--clip-guide-x', `${safeArea.x}%`);
    clipGuideBoundary.style.setProperty('--clip-guide-y', `${safeArea.y}%`);
    clipGuideBoundary.style.setProperty('--clip-guide-w', `${safeArea.w}%`);
    clipGuideBoundary.style.setProperty('--clip-guide-h', `${safeArea.h}%`);
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
    if (pendingIconImagePayloadByUrl.has(normalizedIconUrl)) {
      return pendingIconImagePayloadByUrl.get(normalizedIconUrl) || null;
    }

    const request = (async () => {
      try {
        const response = await fetch(normalizedIconUrl, { cache: 'force-cache' });
        if (!response.ok) return null;

        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
        if (!base64Data) return null;

        let trimBounds = getDefaultIconTrimBounds();
        let sourceWidth = 0;
        let sourceHeight = 0;
        try {
          const iconImage = await loadImage(dataUrl);
          sourceWidth = iconImage.naturalWidth || iconImage.width || 0;
          sourceHeight = iconImage.naturalHeight || iconImage.height || 0;
          trimBounds = resolveImageTrimBounds(iconImage);
        } catch (error) {
          trimBounds = getDefaultIconTrimBounds();
        }
        const normalizedTrimBounds = normalizeIconTrimBounds(trimBounds);
        const aspectRatio = resolveTrimmedIconAspectRatio(normalizedTrimBounds, sourceWidth, sourceHeight);

        const payload = {
          mimeType: blob.type || 'image/svg+xml',
          data: base64Data,
          url: normalizedIconUrl,
          dataUrl,
          trimBounds: normalizedTrimBounds,
          sourceWidth,
          sourceHeight,
          aspectRatio,
        };
        iconImagePayloadCache.set(normalizedIconUrl, payload);
        return payload;
      } catch (error) {
        return null;
      } finally {
        pendingIconImagePayloadByUrl.delete(normalizedIconUrl);
      }
    })();

    pendingIconImagePayloadByUrl.set(normalizedIconUrl, request);
    return request;
  }

  async function buildTintedIconCanvas(iconImage, color) {
    if (!iconImage) return null;
    const width = iconImage.naturalWidth || iconImage.width || 0;
    const height = iconImage.naturalHeight || iconImage.height || 0;
    if (!width || !height) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(iconImage, 0, 0, width, height);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = String(color || BASE_STYLE_PRESET.color || '#4b341f');
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    return canvas;
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

  function getTextOpticalOffsetPx(metrics) {
    if (!metrics) return 0;
    const advanceWidth = Math.max(1, Number(metrics.advanceWidth || metrics.width || 0));
    const left = Math.max(0, Number(metrics.left || 0));
    const right = Math.max(0, Number(metrics.right || 0));
    return ((right - left) - advanceWidth) / 2;
  }

  function drawFittedText(ctx, text, options) {
    const trimmedText = String(text || '').trim();
    if (!trimmedText) return options.minSize || 8;

    const fontSize = resolveBestFitFontSize(ctx, trimmedText, options);
    const fontWeight = options.fontWeight || '600';
    const fontFamily = options.fontFamily || 'sans-serif';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = getCanvasTextMetrics(ctx, trimmedText, {
      fontSize,
      fontFamily,
      fontWeight,
    });
    const opticalOffsetPx = getTextOpticalOffsetPx(metrics);
    ctx.fillText(trimmedText, options.x - opticalOffsetPx, options.y);
    return fontSize;
  }

  async function buildDeterministicContextImagePayload(
    styleValue,
    styleImagePayload,
    lastNameValue,
    dateValue,
    textLayout,
    fontFamilies,
    iconEntriesConfig
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

    const iconEntries = Array.isArray(iconEntriesConfig) ? iconEntriesConfig : [];
    for (const iconEntry of iconEntries) {
      const flowerIconValue = normalizeFlowerIcon(iconEntry?.value);
      const flowerIconUrl = String(iconEntry?.url || '').trim();
      if (!flowerIconValue || !flowerIconUrl) continue;

      const resolvedIconLayout = sanitizeIconLayout(iconEntry?.layout || createDefaultIconLayout(layout));
      const iconPayload = await getIconImagePayload(flowerIconUrl);
      if (!resolvedIconLayout || !iconPayload || !iconPayload.dataUrl) continue;

      try {
        const iconImage = await loadImage(iconPayload.dataUrl);
        const tintedIconCanvas = await buildTintedIconCanvas(iconImage, stylePreset.color);
        const iconSource = tintedIconCanvas || iconImage;
        const iconAspectRatio = normalizeIconAspectRatio(iconPayload.aspectRatio);
        const sourceWidth =
          iconSource instanceof HTMLImageElement
            ? iconSource.naturalWidth || iconSource.width || 0
            : Number(iconSource.width || 0);
        const sourceHeight =
          iconSource instanceof HTMLImageElement
            ? iconSource.naturalHeight || iconSource.height || 0
            : Number(iconSource.height || 0);
        const clampedIconLayout = clampIconLayoutToSafeArea(resolvedIconLayout, iconAspectRatio);
        const iconBox = boxToPixels(createIconBox(clampedIconLayout, iconAspectRatio));
        const iconSourceRect = resolveTrimmedIconSourceRect(iconPayload.trimBounds, sourceWidth, sourceHeight);
        ctx.drawImage(
          iconSource,
          iconSourceRect.x,
          iconSourceRect.y,
          iconSourceRect.w,
          iconSourceRect.h,
          iconBox.x,
          iconBox.y,
          iconBox.w,
          iconBox.h
        );
      } catch (error) {
        // Ignore icon rendering failure and continue rendering text context.
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
    const normalizedIcons = normalizeIconEntries(
      state.icons,
      layout,
      state.flowerIcon,
      state.iconLayout || createDefaultIconLayout(layout)
    );
    const renderableIcons = normalizedIcons
      .map((entry) => ({
        value: entry.value,
        url: getSelectedFlowerIconUrl(entry.value),
        layout: sanitizeIconLayout(entry.layout),
      }))
      .filter((entry) => entry.url);
    const fonts = getStateFontFamilies({ ...state, style });
    const contextPayload = await buildDeterministicContextImagePayload(
      style,
      styleImagePayload,
      String(state.lastName || '').trim(),
      String(state.date || '').trim(),
      layout,
      fonts,
      renderableIcons
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

    let requiresCustomOption =
      triggers.some((trigger) => String(trigger.dataset.personalizationRequiresCustomOption || '') === 'true') ||
      contexts.some((context) => String(context.dataset.personalizationRequiresCustomOption || '') === 'true');
    const scopeForm = resolveScopeForm(scope);
    if (!requiresCustomOption && scopeForm) {
      requiresCustomOption = formHasCustomEngravingOption(scopeForm);
    }

    let isPersonalizationEnabledForScope = true;
    if (requiresCustomOption) {
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
      trigger.dataset.personalizationRequiresCustomOption = requiresCustomOption ? 'true' : 'false';
      trigger.dataset.personalizationCustomSelected = isPersonalizationEnabledForScope ? 'true' : 'false';
      trigger.toggleAttribute('hidden', !isPersonalizationEnabledForScope);
      trigger.disabled = !isPersonalizationEnabledForScope;
    });

    contexts.forEach((context) => {
      context.dataset.personalizationRequiresCustomOption = requiresCustomOption ? 'true' : 'false';
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
    const boundsIssue = options.boundsIssue || null;
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

    if (boundsIssue && boundsIssue.message) {
      return boundsIssue.message;
    }

    const activeBoundsIssue = getTextBoundsValidationIssue();
    if (activeBoundsIssue && activeBoundsIssue.message) {
      return activeBoundsIssue.message;
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
  }

  function armEngravingWarningState() {
    hasUserMovedTextInCurrentSession = true;
    shouldValidateEngravingBounds = false;
    clipSurface.classList.remove('is-warning-armed');
    clipSurface.classList.remove('is-out-of-bounds');
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
    const boxKey = parent instanceof HTMLElement ? String(parent.dataset.personalizationTextbox || '').trim() : '';
    const boxPadding = getTextboxPaddingPx(boxKey, lineElement);
    const insetXValue = Number(options.insetX);
    const insetYValue = Number(options.insetY);
    const insetX = Number.isFinite(insetXValue) ? Math.max(0, insetXValue) : 0;
    const insetY = Number.isFinite(insetYValue) ? Math.max(0, insetYValue) : 0;
    const maxWidth = Math.max(24, (parent ? parent.clientWidth : lineElement.clientWidth) - boxPadding.x - insetX);
    const maxHeight = Math.max(12, (parent ? parent.clientHeight : lineElement.clientHeight) - boxPadding.y - insetY);
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

  function getTextboxLabel(boxKey) {
    return boxKey === 'date' ? 'Date' : 'Last name';
  }

  function getTextboxPaddingPx(boxKey, lineElement) {
    const parentElement =
      (lineElement && lineElement.parentElement) ||
      (boxKey === 'date' || boxKey === 'lastName' ? getTextboxByKey(boxKey) : null);
    if (!(parentElement instanceof HTMLElement)) {
      return { x: 0, y: 0 };
    }
    const computedStyles = window.getComputedStyle(parentElement);
    const paddingLeft = Number.parseFloat(computedStyles.paddingLeft || '0');
    const paddingRight = Number.parseFloat(computedStyles.paddingRight || '0');
    const paddingTop = Number.parseFloat(computedStyles.paddingTop || '0');
    const paddingBottom = Number.parseFloat(computedStyles.paddingBottom || '0');
    return {
      x: Math.max(0, paddingLeft) + Math.max(0, paddingRight),
      y: Math.max(0, paddingTop) + Math.max(0, paddingBottom),
    };
  }

  function getTextboxTypographyConfig(boxKey, styleValue, layoutOverride) {
    const selectedStyle = normalizeStyle(styleValue || getSelectedStyle());
    const stylePreset = getStylePreset(selectedStyle);
    const styleLayoutSettings = getStyleLayoutSettings(selectedStyle);
    const activeFonts = getActiveFontFamilies(selectedStyle);
    const constraintBox = sanitizeTextLayout({
      lastName: boxKey === 'lastName' ? layoutOverride || activeTextLayout.lastName : activeTextLayout.lastName,
      date: boxKey === 'date' ? layoutOverride || activeTextLayout.date : activeTextLayout.date,
    })[boxKey];
    const frameHeight = Math.max(40, clipSurface.clientHeight || 0);
    const maxSize = Math.max(
      boxKey === 'date' ? 12 : 14,
      Math.round((frameHeight * constraintBox.h) / 100 * styleLayoutSettings.previewScale)
    );
    const minSize = boxKey === 'date' ? 7 : 8;
    return {
      constraintBox,
      stylePreset,
      styleLayoutSettings,
      fontFamily:
        boxKey === 'date'
          ? activeFonts.date || stylePreset.dateFamily
          : activeFonts.lastName || stylePreset.nameFamily,
      fontWeight: boxKey === 'date' ? stylePreset.dateWeight || '600' : '600',
      minSize,
      maxSize,
    };
  }

  function resolveTextboxRenderSnapshot(boxKey, options = {}) {
    const value = String(options.text ?? getTextboxValueByKey(boxKey)).trim();
    if (!value) return null;

    const typography = getTextboxTypographyConfig(boxKey, options.styleValue, options.layout);
    const frameWidth = Math.max(1, clipSurface.clientWidth || 1);
    const frameHeight = Math.max(1, clipSurface.clientHeight || 1);
    const boxPadding = getTextboxPaddingPx(boxKey);
    const insetX = Math.max(0, Number(typography.styleLayoutSettings.previewInsetX || 0));
    const insetY = Math.max(0, Number(typography.styleLayoutSettings.previewInsetY || 0));
    const maxWidth = Math.max(24, (frameWidth * typography.constraintBox.w) / 100 - boxPadding.x - insetX);
    const maxHeight = Math.max(12, (frameHeight * typography.constraintBox.h) / 100 - boxPadding.y - insetY);
    const providedFontSize = Number(options.fontSize);
    const fontSize =
      Number.isFinite(providedFontSize) && providedFontSize > 0
        ? providedFontSize
        : textMeasureContext
          ? resolveBestFitFontSize(textMeasureContext, value, {
              minSize: typography.minSize,
              maxSize: typography.maxSize,
              maxWidth,
              maxHeight,
              fontFamily: typography.fontFamily,
              fontWeight: typography.fontWeight,
            })
          : typography.minSize;
    const textMetrics = measureTextBounds(value, {
      fontFamily: typography.fontFamily,
      fontWeight: typography.fontWeight,
      fontSize,
    });
    const opticalOffsetPct = (getTextOpticalOffsetPx(textMetrics) / frameWidth) * 100;
    const desiredWidth = clampNumber(
      ((textMetrics.width + boxPadding.x + insetX) / frameWidth) * 100,
      MIN_RENDERED_TEXTBOX_WIDTH,
      100
    );
    const desiredHeight = clampNumber(
      ((textMetrics.height + boxPadding.y + insetY) / frameHeight) * 100,
      MIN_RENDERED_TEXTBOX_HEIGHT,
      100
    );
    const centerX = typography.constraintBox.x + typography.constraintBox.w / 2;
    const centerY = typography.constraintBox.y + typography.constraintBox.h / 2;

    return {
      value,
      fontSize,
      textMetrics,
      constraintBox: typography.constraintBox,
      maxWidth,
      maxHeight,
      safeAreaTolerance: typography.styleLayoutSettings.safeAreaTolerance,
      renderedLayout: {
        x: Number((centerX - desiredWidth / 2 - opticalOffsetPct).toFixed(3)),
        y: Number((centerY - desiredHeight / 2).toFixed(3)),
        w: Number(desiredWidth.toFixed(3)),
        h: Number(desiredHeight.toFixed(3)),
      },
      fitsWithinConstraint:
        textMetrics.width <= maxWidth + 0.5 &&
        textMetrics.height <= maxHeight + 0.5,
    };
  }

  function buildRenderedTextboxLayout(boxKey, lineElement, fontSize) {
    if (!lineElement) return null;
    const snapshot = resolveTextboxRenderSnapshot(boxKey, {
      text: lineElement.textContent,
      styleValue: getSelectedStyle(),
      layout: activeTextLayout[boxKey],
      fontSize,
    });
    if (!snapshot) return null;
    return snapshot.renderedLayout;
  }

  function getTextboxValueByKey(boxKey) {
    return boxKey === 'date' ? dateInput.value.trim() : lastNameInput.value.trim();
  }

  function getTextboxLayoutForDisplay(boxKey) {
    return renderedTextLayout[boxKey] || activeTextLayout[boxKey] || null;
  }

  function getTextboxLayoutForValidation(boxKey) {
    return getTextboxLayoutForDisplay(boxKey);
  }

  function getTextBoundsValidationIssue() {
    const safeArea = getTextboxSafeArea();
    const selectedStyle = getSelectedStyle();

    for (const boxKey of ['lastName', 'date']) {
      const snapshot = resolveTextboxRenderSnapshot(boxKey, { styleValue: selectedStyle });
      if (!snapshot) continue;

      if (!isLayoutWithinBounds(snapshot.constraintBox, safeArea, snapshot.safeAreaTolerance)) {
        return {
          boxKey,
          message: `${getTextboxLabel(boxKey)} must stay inside the engravable area.`,
        };
      }

      if (!snapshot.fitsWithinConstraint) {
        return {
          boxKey,
          message: `${getTextboxLabel(boxKey)} does not fit inside the engravable area. Resize its box or shorten the text.`,
        };
      }

      if (!isLayoutWithinBounds(snapshot.renderedLayout, safeArea, snapshot.safeAreaTolerance)) {
        return {
          boxKey,
          message: `${getTextboxLabel(boxKey)} extends outside the engravable area. Reposition it or shorten the text.`,
        };
      }
    }

    return null;
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
    renderedTextLayout = cloneTextLayout(activeTextLayout);

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

    const renderedNameLayout = buildRenderedTextboxLayout('lastName', deterministicLastName, lastNameFontSize);
    const renderedDateLayout = buildRenderedTextboxLayout('date', deterministicDate, dateFontSize);
    if (renderedNameLayout) {
      renderedTextLayout.lastName = renderedNameLayout;
    }
    if (renderedDateLayout) {
      renderedTextLayout.date = renderedDateLayout;
    }
    applyTextboxLayout('lastName', getTextboxLayoutForDisplay('lastName'));
    applyTextboxLayout('date', getTextboxLayoutForDisplay('date'));

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

    if (boxInteraction.mode === 'resize') {
      const resizeSafeArea = getTextboxResizeSafeArea();
      const clampedStartBox = clampTextboxToSafeArea(boxInteraction.startBox, resizeSafeArea);
      const maxWidth = Math.max(MIN_TEXTBOX_WIDTH, resizeSafeArea.x + resizeSafeArea.w - clampedStartBox.x);
      const maxHeight = Math.max(MIN_TEXTBOX_HEIGHT, resizeSafeArea.y + resizeSafeArea.h - clampedStartBox.y);
      const nextWidth = clampNumber(
        clampedStartBox.w + deltaXPct,
        MIN_TEXTBOX_WIDTH,
        maxWidth
      );
      const nextHeight = clampNumber(
        clampedStartBox.h + deltaYPct,
        MIN_TEXTBOX_HEIGHT,
        maxHeight
      );
      box.x = clampedStartBox.x;
      box.y = clampedStartBox.y;
      box.w = nextWidth;
      box.h = nextHeight;
      setTextboxCenterSnapState(boxInteraction.boxKey, false);
    } else {
      const dragSafeArea = getTextboxResizeSafeArea();
      box.w = boxInteraction.startBox.w;
      box.h = boxInteraction.startBox.h;
      box.x = clampNumber(
        boxInteraction.startBox.x + deltaXPct,
        dragSafeArea.x,
        Math.max(dragSafeArea.x, dragSafeArea.x + dragSafeArea.w - boxInteraction.startBox.w)
      );
      box.y = clampNumber(
        boxInteraction.startBox.y + deltaYPct,
        dragSafeArea.y,
        Math.max(dragSafeArea.y, dragSafeArea.y + dragSafeArea.h - boxInteraction.startBox.h)
      );
      setTextboxCenterSnapState(boxInteraction.boxKey, false);
    }

    activeTextLayout = clampTextLayoutToSafeArea(nextLayout);
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
    const activeBox = activeTextLayout[boxKey];
    if (!activeBox) return;
    const displayBox = getTextboxLayoutForDisplay(boxKey);
    const interactionBox = clampTextboxToSafeArea(
      mode === 'drag' && displayBox ? displayBox : activeBox,
      getTextboxResizeSafeArea()
    );
    setSelectedTextbox(boxKey);
    setIconSelected(false);

    boxInteraction = {
      boxKey,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startBox: { ...interactionBox },
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
    const iconEntry = getIconEntryById(iconInteraction.iconId);
    if (!iconEntry) {
      onIconPointerUp();
      return;
    }
    const nextLayout = { ...iconInteraction.startLayout };

    if (iconInteraction.mode === 'resize') {
      const dominantDelta = Math.abs(deltaXPct) >= Math.abs(deltaYPct) ? deltaXPct : deltaYPct;
      nextLayout.size = iconInteraction.startLayout.size + dominantDelta;
    } else {
      nextLayout.x = iconInteraction.startLayout.x + deltaXPct;
      nextLayout.y = iconInteraction.startLayout.y + deltaYPct;
    }

    const sanitizedNextLayout = clampIconLayoutToSafeArea(sanitizeIconLayout(nextLayout), iconInteraction.aspectRatio);
    updateIconEntryLayout(iconInteraction.iconId, sanitizedNextLayout);
    if (
      Math.abs(sanitizedNextLayout.x - iconInteraction.startLayout.x) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(sanitizedNextLayout.y - iconInteraction.startLayout.y) > ICON_LAYOUT_CHANGE_EPSILON ||
      Math.abs(sanitizedNextLayout.size - iconInteraction.startLayout.size) > ICON_LAYOUT_CHANGE_EPSILON
    ) {
      iconInteraction.layoutChanged = true;
      invalidateGeneratedPreview();
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

  function beginIconInteraction(event, mode, iconId) {
    if (isGenerating) return;
    if (event.button !== 0) return;
    const iconEntry = getIconEntryById(iconId) || getSelectedIconEntry();
    if (!iconEntry) return;
    onBoxPointerUp();

    setSelectedTextbox('');
    selectedIconId = iconEntry.id;
    setIconSelected(true);
    iconInteraction = {
      iconId: iconEntry.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      aspectRatio: getIconAspectRatioForEntry(iconEntry),
      startLayout: { ...sanitizeIconLayout(iconEntry.layout) },
      dragActivated: false,
      layoutChanged: false,
      sessionId: activeEditorSessionId,
    };
    window.addEventListener('pointermove', onIconPointerMove);
    window.addEventListener('pointerup', onIconPointerUp);
    window.addEventListener('pointercancel', onIconPointerUp);
    renderDeterministicOverlay();
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
    clipSurface.classList.remove('is-warning-armed');
    clipSurface.classList.remove('is-out-of-bounds');
    safeAreaWarning.setAttribute('hidden', '');

    const boundsIssue = getTextBoundsValidationIssue();
    if (boundsIssue) {
      clipSurface.classList.add('is-warning-armed');
      clipSurface.classList.add('is-out-of-bounds');
      safeAreaWarning.removeAttribute('hidden');
    }

    const validationError = getValidationError({ boundsIssue });
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

  function serializeIconsPropertyValue(iconEntries, textLayout) {
    const normalizedEntries = normalizeIconEntries(iconEntries, textLayout || activeTextLayout);
    if (!normalizedEntries.length) return '';
    return JSON.stringify(
      normalizedEntries.map((entry) => ({
        value: entry.value,
        x: Number(entry.layout.x.toFixed(3)),
        y: Number(entry.layout.y.toFixed(3)),
        size: Number(entry.layout.size.toFixed(3)),
      }))
    );
  }

  function parseIconsPropertyValue(rawValue, textLayout, fallbackIconValue, fallbackIconLayout) {
    const normalizedRawValue = String(rawValue || '').trim();
    if (!normalizedRawValue) {
      return normalizeIconEntries([], textLayout, fallbackIconValue, fallbackIconLayout);
    }
    try {
      const parsed = JSON.parse(normalizedRawValue);
      if (!Array.isArray(parsed)) {
        return normalizeIconEntries([], textLayout, fallbackIconValue, fallbackIconLayout);
      }
      const parsedEntries = parsed.map((entry) => ({
        value: entry?.value,
        layout: {
          x: entry?.x,
          y: entry?.y,
          size: entry?.size,
        },
      }));
      return normalizeIconEntries(parsedEntries, textLayout, fallbackIconValue, fallbackIconLayout);
    } catch (error) {
      return normalizeIconEntries([], textLayout, fallbackIconValue, fallbackIconLayout);
    }
  }

  function applyStateToContext(context, state) {
    const primaryProperty = context.querySelector('[data-personalization-property="primary"]');
    const secondaryProperty = context.querySelector('[data-personalization-property="secondary"]');
    const styleProperty = context.querySelector('[data-personalization-property="style"]');
    const name1Property = context.querySelector('[data-personalization-property="name1"]');
    const name2Property = context.querySelector('[data-personalization-property="name2"]');
    const dateProperty = context.querySelector('[data-personalization-property="date"]');
    const iconProperty = context.querySelector('[data-personalization-property="icon"]');
    const iconsProperty = context.querySelector('[data-personalization-property="icons"]');
    const geminiSummaryProperty = context.querySelector('[data-personalization-property="gemini_summary"]');
    const scopeProperty = context.querySelector('[data-personalization-property="scope"]');
    const normalizedIcons = normalizeIconEntries(state?.icons, state?.textLayout, state?.flowerIcon, state?.iconLayout);
    const primaryIcon = getPrimaryIconEntry(normalizedIcons);

    if (primaryProperty) primaryProperty.value = state.lastName || '';
    if (secondaryProperty) secondaryProperty.value = '';
    if (styleProperty) styleProperty.value = state.style || DEFAULT_STYLE;
    if (name1Property) name1Property.value = state.lastName || '';
    if (name2Property) name2Property.value = '';
    if (dateProperty) dateProperty.value = state.date || '';
    if (iconProperty) iconProperty.value = primaryIcon ? primaryIcon.value : '';
    if (iconsProperty) iconsProperty.value = serializeIconsPropertyValue(normalizedIcons, state?.textLayout);
    if (geminiSummaryProperty) geminiSummaryProperty.value = state.geminiSummary || '';
    if (scopeProperty) scopeProperty.value = context.dataset.personalizationScope || '';
  }

  function isConfiguredState(state) {
    if (!state) return false;
    return Boolean(
      state.lastName ||
        state.date ||
        normalizeIconEntries(state.icons, state.textLayout, state.flowerIcon, state.iconLayout).length ||
        state.geminiSummary ||
        state.generatedImage
    );
  }

  function isSavedState(state) {
    return Boolean(state && state.isSaved);
  }

  function buildSavedPreviewMeta(state) {
    if (!state) return '';
    const segments = [];
    if (state.style) segments.push(`Style: ${state.style}`);
    if (state.lastName) segments.push(`Name: ${state.lastName}`);
    if (state.date) segments.push(`Date: ${state.date}`);
    return segments.join(' | ');
  }

  function renderSavedPreviewPanels(scope, state, previewImageDataUrl) {
    if (!scope) return;

    const escapedScope = selectorEscape(scope);
    const savedPreviewBlocks = document.querySelectorAll(
      `[data-personalization-saved-preview][data-personalization-scope="${escapedScope}"]`
    );
    if (!savedPreviewBlocks.length) return;

    const shouldShowPreview = isSavedState(state);
    const normalizedPreviewDataUrl = resolveStagePreviewDataUrl(previewImageDataUrl);
    const metaText = shouldShowPreview ? buildSavedPreviewMeta(state) : '';

    savedPreviewBlocks.forEach((previewBlock) => {
      const previewImage = previewBlock.querySelector('[data-personalization-saved-preview-image]');
      const previewMeta = previewBlock.querySelector('[data-personalization-saved-preview-meta]');

      previewBlock.toggleAttribute('hidden', !shouldShowPreview);
      if (!shouldShowPreview) {
        if (previewImage instanceof HTMLImageElement) {
          previewImage.removeAttribute('src');
          previewImage.setAttribute('hidden', '');
        }
        if (previewMeta instanceof HTMLElement) {
          previewMeta.textContent = '';
          previewMeta.setAttribute('hidden', '');
        }
        return;
      }

      if (previewImage instanceof HTMLImageElement) {
        if (normalizedPreviewDataUrl) {
          previewImage.src = normalizedPreviewDataUrl;
          previewImage.removeAttribute('hidden');
        } else {
          previewImage.removeAttribute('src');
          previewImage.setAttribute('hidden', '');
        }
      }

      if (previewMeta instanceof HTMLElement) {
        previewMeta.textContent = metaText;
        previewMeta.toggleAttribute('hidden', !metaText);
      }
    });
  }

  async function syncSavedPreviewPanels(scope) {
    if (!scope) return;

    const state = getScopeState(scope);
    if (!state || !isSavedState(state)) {
      renderSavedPreviewPanels(scope, state, '');
      return;
    }

    const existingPreviewDataUrl = resolveStagePreviewDataUrl(state.stagePreviewDataUrl || state.generatedImage);
    if (existingPreviewDataUrl) {
      renderSavedPreviewPanels(scope, state, existingPreviewDataUrl);
      return;
    }

    let generatedStagePreviewDataUrl = '';
    try {
      generatedStagePreviewDataUrl = await ensureScopeStagePreviewDataUrl(scope, state);
    } catch (error) {
      generatedStagePreviewDataUrl = '';
    }

    const latestState = getScopeState(scope) || state;
    const resolvedPreviewDataUrl = resolveStagePreviewDataUrl(
      generatedStagePreviewDataUrl || latestState.stagePreviewDataUrl || latestState.generatedImage
    );
    renderSavedPreviewPanels(scope, latestState, resolvedPreviewDataUrl);
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
      if (isTriggerEligible(trigger) && isConfiguredState(state)) {
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
    void syncSavedPreviewPanels(scope);
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
      const contextNameValue =
        (context.querySelector('[data-personalization-property="name1"]') || {}).value ||
        (context.querySelector('[data-personalization-property="primary"]') || {}).value ||
        '';
      const contextDateValue = (context.querySelector('[data-personalization-property="date"]') || {}).value || '';
      const contextIconValue = (context.querySelector('[data-personalization-property="icon"]') || {}).value || '';
      const contextIconsValue = (context.querySelector('[data-personalization-property="icons"]') || {}).value || '';
      const contextGeminiSummary =
        (context.querySelector('[data-personalization-property="gemini_summary"]') || {}).value || '';
      const contextIcons = parseIconsPropertyValue(
        contextIconsValue,
        defaultState.textLayout,
        contextIconValue || defaultState.flowerIcon,
        defaultState.iconLayout
      );
      const hasPersistedPersonalization = Boolean(
        String(contextNameValue).trim() ||
          String(contextDateValue).trim() ||
          contextIcons.length ||
          String(contextGeminiSummary).trim()
      );
      setScopeState(scope, {
        style: initialStyle,
        lastName: contextNameValue || defaultState.lastName,
        date: contextDateValue || defaultState.date,
        lastNameFont: getStylePreset(
          initialStyle
        ).nameFamily,
        dateFont: getStylePreset(
          initialStyle
        ).dateFamily,
        icons: contextIcons,
        textLayout: defaultState.textLayout,
        geminiSummary: contextGeminiSummary,
        generatedImage: '',
        stagePreviewDataUrl: '',
        maxLastName: DEFAULT_LAST_NAME_MAX,
        maxDate: DEFAULT_DATE_MAX,
        isSaved: hasPersistedPersonalization,
      });
    }

    syncScope(scope);
  }

  function hydrateContexts(root) {
    root.querySelectorAll('[data-personalization-context]').forEach((context) => {
      hydrateContext(context);
    });
  }

  async function openEditor(trigger) {
    if (!isTriggerEligible(trigger)) {
      const scope = String(trigger?.dataset?.personalizationScope || '').trim();
      if (scope) {
        syncScopePersonalizationEligibility(scope);
        updateTriggerLabels(scope);
      }
      return;
    }

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
    setActiveStageImageUrl(trigger.dataset.personalizationStageImageUrl);
    setActiveSafeAreaImageUrl(trigger.dataset.personalizationSafeAreaUrl);
    await ensureSafeAreaBounds();

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
    activeTextLayout = clampTextLayoutToSafeArea(existingState.textLayout);
    initialTextLayout = cloneTextLayout(activeTextLayout);
    activeIcons = normalizeIconEntries(
      existingState.icons,
      activeTextLayout,
      existingState.flowerIcon,
      existingState.iconLayout || createDefaultIconLayout(activeTextLayout)
    );
    resetEngravingWarningState();
    selectedTextboxKey = '';
    syncTextboxSelectionState();
    setIconSelected(false);
    syncFlowerIconPickerValue();
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
    void refreshPreviewAfterFontsReady({ syncInitialPlacement: true });
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

  function resolveAssociatedAddToCartForm(target) {
    if (!(target instanceof Element)) return null;
    const formFromAncestor = target.closest('form[data-type="add-to-cart-form"]');
    if (formFromAncestor instanceof HTMLFormElement) return formFromAncestor;

    if (target instanceof HTMLElement) {
      if (target.form instanceof HTMLFormElement && target.form.dataset.type === 'add-to-cart-form') {
        return target.form;
      }

      const associatedFormId = String(target.getAttribute('form') || '').trim();
      if (associatedFormId) {
        const associatedForm = document.getElementById(associatedFormId);
        if (associatedForm instanceof HTMLFormElement && associatedForm.dataset.type === 'add-to-cart-form') {
          return associatedForm;
        }
      }
    }

    const variantSelects = target.closest('variant-selects[data-section]');
    if (variantSelects instanceof HTMLElement) {
      const sectionId = String(variantSelects.dataset.section || '').trim();
      if (sectionId) {
        const sectionForm = document.getElementById(`product-form-${sectionId}`);
        if (sectionForm instanceof HTMLFormElement && sectionForm.dataset.type === 'add-to-cart-form') {
          return sectionForm;
        }
      }
    }

    return null;
  }

  function isTriggerEligible(trigger) {
    if (!(trigger instanceof HTMLButtonElement)) return false;
    if (trigger.disabled) return false;

    const requiresCustomOption = String(trigger.dataset.personalizationRequiresCustomOption || '') === 'true';
    if (!requiresCustomOption) {
      return true;
    }

    const form = resolveAssociatedAddToCartForm(trigger);
    if (form) {
      return isCustomEngravingSelectedForForm(form);
    }

    return String(trigger.dataset.personalizationCustomSelected || '') === 'true';
  }

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const form = resolveAssociatedAddToCartForm(target);
    if (!form) return;
    scheduleFormPersonalizationEligibilitySync(form);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    let form = resolveAssociatedAddToCartForm(target);
    if (!form && target instanceof HTMLLabelElement && target.htmlFor) {
      const labelledControl = document.getElementById(target.htmlFor);
      if (labelledControl instanceof Element) {
        form = resolveAssociatedAddToCartForm(labelledControl);
      }
    }
    if (!form) return;
    scheduleFormPersonalizationEligibilitySync(form);
  });

  document.addEventListener('variant:change', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      syncAllScopePersonalizationEligibility();
      return;
    }

    const form = resolveAssociatedAddToCartForm(target);
    if (form) {
      scheduleFormPersonalizationEligibilitySync(form);
      return;
    }

    syncAllScopePersonalizationEligibility();
  });

  if (
    typeof subscribe === 'function' &&
    typeof PUB_SUB_EVENTS !== 'undefined' &&
    PUB_SUB_EVENTS &&
    PUB_SUB_EVENTS.variantChange
  ) {
    subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      const sectionId = String(event?.data?.sectionId || '').trim();
      if (sectionId) {
        const sectionForm = document.getElementById(`product-form-${sectionId}`);
        if (sectionForm instanceof HTMLFormElement && sectionForm.dataset.type === 'add-to-cart-form') {
          scheduleFormPersonalizationEligibilitySync(sectionForm);
          return;
        }
      }

      syncAllScopePersonalizationEligibility();
    });
  }

  function handleStyleSelectionChange() {
    setGeneratedImage('');
    setGenerationError('');
    resetEngravingWarningState();
    applyStyleDefaultFonts(getSelectedStyle());
    void refreshPreviewAfterFontsReady({ syncInitialPlacement: true });
  }

  styleFamilySelect.addEventListener('change', () => {
    const currentStyle = getSelectedStyle();
    populateStyleVariantOptions(styleFamilySelect.value, currentStyle);
    handleStyleSelectionChange();
  });

  styleVariantSelect.addEventListener('change', () => {
    setSelectedStyle(styleVariantSelect.value);
    handleStyleSelectionChange();
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
      void refreshPreviewAfterFontsReady({ syncInitialPlacement: true });
    });
  });
  flowerIconSelect.addEventListener('change', () => {
    if (suppressFlowerIconSelectChange) return;
    onIconPointerUp();
    setIconDropdownOpen(false);
    const nextValue = normalizeFlowerIcon(flowerIconSelect.value);
    if (!nextValue) return;
    addIconToClip(nextValue);
  });
  iconDropdownToggle.addEventListener('click', () => {
    if (!isIconDropdownOpen) {
      renderFlowerIconDropdownOptions();
    }
    setIconDropdownOpen(!isIconDropdownOpen);
  });
  iconDropdownMenu.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const optionButton = target.closest('[data-personalization-icon-option-value]');
    if (!(optionButton instanceof HTMLButtonElement)) return;
    const nextValue = normalizeIconValue(optionButton.dataset.personalizationIconOptionValue);
    if (!nextValue) return;
    addIconToClip(nextValue);
    setIconDropdownOpen(false);
    iconDropdownToggle.focus();
  });
  iconDropdownMenu.addEventListener('dragstart', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const optionButton = target.closest('[data-personalization-icon-option-value]');
    if (!(optionButton instanceof HTMLButtonElement)) return;
    const iconValue = normalizeIconValue(optionButton.dataset.personalizationIconOptionValue);
    if (!iconValue || !event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', iconValue);
    event.dataTransfer.effectAllowed = 'copy';
    setIconDropdownOpen(false);
  });
  clipSurface.addEventListener('dragover', (event) => {
    if (isGenerating) return;
    const draggedValue = event.dataTransfer?.getData('text/plain');
    if (!normalizeFlowerIcon(draggedValue)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  });
  clipSurface.addEventListener('drop', (event) => {
    if (isGenerating) return;
    const draggedValue = normalizeFlowerIcon(event.dataTransfer?.getData('text/plain'));
    if (!draggedValue) return;
    event.preventDefault();
    const clipBounds = clipSurface.getBoundingClientRect();
    const defaultLayout = createDefaultIconLayout(activeTextLayout);
    let nextLayout = { ...defaultLayout };
    if (clipBounds.width > 0 && clipBounds.height > 0) {
      const relativeX = ((event.clientX - clipBounds.left) / clipBounds.width) * 100;
      const relativeY = ((event.clientY - clipBounds.top) / clipBounds.height) * 100;
      nextLayout = {
        ...nextLayout,
        x: relativeX,
        y: relativeY,
      };
    }
    addIconToClip(draggedValue, nextLayout);
  });
  document.addEventListener('pointerdown', (event) => {
    if (!isIconDropdownOpen) return;
    const target = event.target;
    if (!(target instanceof Element)) {
      setIconDropdownOpen(false);
      return;
    }
    if (iconDropdown.contains(target)) return;
    setIconDropdownOpen(false);
  });
  removeIconButton.addEventListener('click', () => {
    clearSelectedFlowerIcon();
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
  iconLayer.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const iconElement = target.closest('[data-personalization-icon-id]');
    if (!(iconElement instanceof HTMLElement)) return;
    const iconId = String(iconElement.dataset.personalizationIconId || '').trim();
    if (!iconId) return;
    if (target.closest('[data-personalization-icon-resize]')) {
      beginIconInteraction(event, 'resize', iconId);
      event.stopPropagation();
      return;
    }
    beginIconInteraction(event, 'drag', iconId);
  });

  modal.addEventListener('pointerdown', (event) => {
    if (event.target.closest('[data-personalization-textbox]')) return;
    if (event.target.closest('[data-personalization-resize]')) return;
    if (event.target.closest('[data-personalization-icon-id]')) return;
    if (event.target.closest('[data-personalization-icon-resize]')) return;
    setSelectedTextbox('');
    setIconSelected(false);
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isIconDropdownOpen) {
      setIconDropdownOpen(false);
      event.preventDefault();
      return;
    }

    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    if (!selectedIconId) return;
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }
    clearSelectedFlowerIcon();
    event.preventDefault();
  });

  document.body.addEventListener('modalClosed', () => {
    if (modal.hasAttribute('open')) return;
    onBoxPointerUp();
    onIconPointerUp();
    setIconDropdownOpen(false);
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
        setIconDropdownOpen(false);
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
      icons: cloneIconEntries(activeIcons),
      textLayout: cloneTextLayout(activeTextLayout),
      geminiSummary: getGeneratedSummary(),
      generatedImage: getGeneratedImageData(),
      stagePreviewDataUrl: resolveStagePreviewDataUrl(getGeneratedImageData()),
      previewOpened: true,
      maxLastName: activeLastNameMax,
      maxDate: activeDateMax,
      isSaved: true,
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
    const renderableIcons = getRenderableIconEntries(activeIcons);
    const selectedFlowerIcon = renderableIcons.length ? renderableIcons[0].value : '';
    const payload = {
      style: selectedStyle,
      lastName: lastNameInput.value.trim(),
      date: dateInput.value.trim(),
      lastNameFont: activeFonts.lastName,
      dateFont: activeFonts.date,
      flowerIcon: selectedFlowerIcon,
      flowerIcons: renderableIcons.map((entry) => entry.value),
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
        renderableIcons
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
        icons: cloneIconEntries(activeIcons),
        textLayout: cloneTextLayout(activeTextLayout),
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

  saveButton.addEventListener('click', async () => {
    const scopeToSave = activeScope;
    const committed = commitActiveState(false);
    if (!committed || !scopeToSave) return;

    try {
      await ensureScopeStagePreviewDataUrl(scopeToSave);
    } catch (error) {
      // Keep save flow non-blocking if stage preview generation fails.
    }

    syncScope(scopeToSave);
    closeEditor();
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
    renderedTextLayout = cloneTextLayout(activeTextLayout);
    initialTextLayout = cloneTextLayout(activeTextLayout);
    activeIcons = normalizeIconEntries(activeIcons, activeTextLayout);
    if (activeScope) {
      renderEditorState();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
