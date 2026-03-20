import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function readRepoFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, expected, label) {
  assert(source.includes(expected), `${label} is missing expected text: ${expected}`);
}

function assertDataValue(source, attrName, expectedValue, label) {
  const matcher = new RegExp(`${attrName}="${expectedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
  assert(matcher.test(source), `${label} is missing ${attrName}="${expectedValue}"`);
}

const themeLayout = readRepoFile('layout/theme.liquid');
const modalSnippet = readRepoFile('snippets/personalization-preview-modal.liquid');
const triggerSnippet = readRepoFile('snippets/personalization-preview-trigger.liquid');
const propertiesSnippet = readRepoFile('snippets/personalization-line-item-properties.liquid');

assertIncludes(themeLayout, "personalization-preview.js", 'layout/theme.liquid');
assertIncludes(themeLayout, "personalization-preview.css", 'layout/theme.liquid');
assertIncludes(themeLayout, "{% render 'personalization-preview-modal' %}", 'layout/theme.liquid');

[
  'style',
  'lastName',
  'date',
  'thirdText',
  'lastNameFont',
  'dateFont',
  'thirdTextFont',
  'flowerIcon',
  'uploadedArtwork',
].forEach((inputKey) => {
  assertDataValue(modalSnippet, 'data-personalization-input', inputKey, 'snippets/personalization-preview-modal.liquid');
});

['lastName', 'date', 'thirdText'].forEach((textboxKey) => {
  assertDataValue(
    modalSnippet,
    'data-personalization-textbox',
    textboxKey,
    'snippets/personalization-preview-modal.liquid'
  );
});

[
  'data-personalization-deterministic-overlay',
  'data-personalization-icon-layer',
  'data-personalization-safe-area-boundary',
  'data-personalization-clip-guide-boundary',
  'data-personalization-safe-area-warning',
  'data-personalization-third-text-fields',
  'data-personalization-third-text-add-wrapper',
  'data-personalization-add-third-text',
  'data-personalization-picked-panel',
  'data-personalization-upload-meta',
  'data-personalization-upload-name',
  'data-personalization-upload-clear',
].forEach((attributeName) => {
  assertIncludes(modalSnippet, attributeName, 'snippets/personalization-preview-modal.liquid');
});

[
  'primary',
  'secondary',
  'style',
  'name1',
  'name2',
  'date',
  'icon',
  'icons',
  'last_name_font',
  'date_font',
  'third_text_font',
  'third_text_enabled',
  'text_layout',
  'gemini_summary',
  'scope',
  'stage_preview_file',
  'artwork_file',
].forEach((propertyKey) => {
  assertDataValue(
    propertiesSnippet,
    'data-personalization-property',
    propertyKey,
    'snippets/personalization-line-item-properties.liquid'
  );
});

[
  'data-personalization-trigger',
  'data-personalization-trigger-label',
  'data-personalization-saved-preview',
  'data-personalization-saved-preview-image',
  'data-personalization-saved-preview-meta',
].forEach((attributeName) => {
  assertIncludes(triggerSnippet, attributeName, 'snippets/personalization-preview-trigger.liquid');
});

[
  'data-personalization-stage-image-url',
  'data-personalization-safe-area-url',
  'data-personalization-primary-max',
  'data-personalization-secondary-max',
  'data-personalization-date-max',
  'data-personalization-requires-custom-option',
  'data-personalization-custom-selected',
].forEach((attributeName) => {
  assertIncludes(triggerSnippet, attributeName, 'snippets/personalization-preview-trigger.liquid');
});

console.log('Personalization contract checks passed.');
