(() => {
  const WIDGET_SELECTOR = '[data-nesting-preview-widget]';
  const DEFAULT_ENDPOINT = '/apps/nesting/render';
  const PROPERTY_KEYS = {
    preview: 'Generated Preview',
    previewUrl: 'Generated Preview URL',
    requestId: 'Request ID',
    text: 'Customization Text',
    color: 'Customization Color',
    size: 'Customization Size',
  };

  function findProductForm() {
    return (
      document.querySelector('product-info form[data-type="add-to-cart-form"]') ||
      document.querySelector('[id^="MainProduct-"] form[data-type="add-to-cart-form"]') ||
      document.querySelector('form[data-type="add-to-cart-form"]') ||
      document.querySelector('form[action*="/cart/add"]')
    );
  }

  function findInputByName(form, inputName) {
    return Array.from(form.querySelectorAll('[name]')).find((field) => field.name === inputName) || null;
  }

  function getOrCreatePropertyInput(form, key) {
    const propertyName = `properties[${key}]`;
    const existing = findInputByName(form, propertyName);
    if (existing) return existing;

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = propertyName;
    form.appendChild(hiddenInput);
    return hiddenInput;
  }

  function setLineItemProperty(form, key, value) {
    if (!form) return;
    const input = getOrCreatePropertyInput(form, key);
    input.value = value || '';
  }

  function getVariantId(form) {
    if (!form) return null;
    const variantInput = findInputByName(form, 'id');
    const parsed = Number.parseInt(variantInput ? variantInput.value : '', 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function setStatus(widget, message, state) {
    const status = widget.querySelector('[data-nesting-status]');
    if (!status) return;
    status.textContent = message || '';
    status.dataset.state = state || '';
  }

  function syncLineItemProperties(widget, form) {
    if (!form) return;

    const textValue = (widget.querySelector('[data-nesting-input="text"]')?.value || '').trim();
    const colorValue = widget.querySelector('[data-nesting-input="color"]')?.value || '';
    const sizeValue = widget.querySelector('[data-nesting-input="size"]')?.value || '';

    setLineItemProperty(form, PROPERTY_KEYS.text, textValue);
    setLineItemProperty(form, PROPERTY_KEYS.color, colorValue);
    setLineItemProperty(form, PROPERTY_KEYS.size, sizeValue);
    setLineItemProperty(form, PROPERTY_KEYS.preview, widget.dataset.generatedPreviewUrl || '');
    setLineItemProperty(form, PROPERTY_KEYS.previewUrl, widget.dataset.generatedPreviewUrl || '');
    setLineItemProperty(form, PROPERTY_KEYS.requestId, widget.dataset.generatedRequestId || '');
  }

  async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (error) {
      return { message: text };
    }
  }

  async function handleGeneratePreview(widget) {
    const form = findProductForm();
    const button = widget.querySelector('[data-nesting-generate]');
    const previewImage = widget.querySelector('[data-nesting-image]');
    const textValue = (widget.querySelector('[data-nesting-input="text"]')?.value || '').trim();
    const colorValue = widget.querySelector('[data-nesting-input="color"]')?.value || '';
    const sizeValue = widget.querySelector('[data-nesting-input="size"]')?.value || '';

    if (!textValue) {
      setStatus(widget, 'Enter customization text before generating a preview.', 'error');
      return;
    }

    const productId = Number.parseInt(widget.dataset.productId || '', 10);
    if (!Number.isFinite(productId)) {
      setStatus(widget, 'Product data is unavailable. Refresh and try again.', 'error');
      return;
    }

    const endpoint = widget.dataset.endpoint || DEFAULT_ENDPOINT;
    const options = {};
    if (colorValue) options.color = colorValue;
    if (sizeValue) options.size = sizeValue;

    const payload = {
      product_id: productId,
      variant_id: getVariantId(form),
      text: textValue,
      options,
    };

    if (button) button.disabled = true;
    setStatus(widget, 'Generating preview...', 'loading');
    syncLineItemProperties(widget, form);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const responseData = await parseResponseBody(response);

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            responseData.message ||
            `Preview generation failed with status ${response.status}.`
        );
      }

      if (!responseData.image_url) {
        throw new Error('Preview service did not return an image URL.');
      }

      widget.dataset.generatedPreviewUrl = String(responseData.image_url);
      widget.dataset.generatedRequestId = responseData.request_id ? String(responseData.request_id) : '';

      if (previewImage) {
        previewImage.src = responseData.image_url;
        previewImage.hidden = false;
      }

      syncLineItemProperties(widget, form);
      setStatus(widget, 'Preview generated. Add to cart to save this customization.', 'success');
    } catch (error) {
      const fallbackMessage = 'Unable to generate preview right now. You can still add the product to cart.';
      setStatus(widget, error instanceof Error ? error.message : fallbackMessage, 'error');
      syncLineItemProperties(widget, form);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function bindWidget(widget) {
    if (widget.dataset.nestingPreviewReady === 'true') return;

    const form = findProductForm();
    syncLineItemProperties(widget, form);
    if (form) {
      form.addEventListener('submit', () => syncLineItemProperties(widget, form));
    }

    const textInput = widget.querySelector('[data-nesting-input="text"]');
    const colorInput = widget.querySelector('[data-nesting-input="color"]');
    const sizeInput = widget.querySelector('[data-nesting-input="size"]');
    const generateButton = widget.querySelector('[data-nesting-generate]');

    [textInput, colorInput, sizeInput].forEach((field) => {
      if (!field) return;
      const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(eventName, () => {
        syncLineItemProperties(widget, findProductForm());
      });
    });

    if (generateButton) {
      generateButton.addEventListener('click', () => {
        handleGeneratePreview(widget);
      });
    }

    widget.dataset.nestingPreviewReady = 'true';
  }

  function mountAll(scope = document) {
    scope.querySelectorAll(WIDGET_SELECTOR).forEach(bindWidget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountAll());
  } else {
    mountAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    mountAll(event.target);
  });
})();
