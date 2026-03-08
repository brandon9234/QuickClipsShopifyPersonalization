import http from 'node:http';

const PORT = Number.parseInt(process.env.PORT || '8788', 10);
const API_KEY = process.env.GEMINI_API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const RAW_MODEL = String(process.env.GEMINI_IMAGE_MODEL || process.env.GEMINI_MODEL || '').trim();
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';
const ALLOWED_IMAGE_MODELS = new Set(['gemini-2.5-flash-image', 'nano-banana-pro-preview']);
const IMAGE_MODEL = ALLOWED_IMAGE_MODELS.has(RAW_MODEL) ? RAW_MODEL : DEFAULT_IMAGE_MODEL;
const STYLE_VALUES = new Set(['Style 1', 'Style 2', 'Style 3']);
const MAX_REQUEST_BODY_LENGTH = Number.parseInt(process.env.MAX_REQUEST_BODY_LENGTH || '12000000', 10);
const MAX_STYLE_IMAGE_BASE64_LENGTH = Number.parseInt(process.env.MAX_STYLE_IMAGE_BASE64_LENGTH || '10000000', 10);
const PREVIEW_PATHS = new Set(['/api/personalization-preview', '/preview', '/apps/quickclips-personalization/preview']);

function applyCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(response, statusCode, payload) {
  applyCorsHeaders(response);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function sanitize(value, maxLength) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > MAX_REQUEST_BODY_LENGTH) {
        reject(new Error('Payload is too large.'));
      }
    });

    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

function validatePayload(body) {
  const style = sanitize(body.style, 20);
  const lastName = sanitize(body.lastName || body.name1, 40);
  const date = sanitize(body.date, 20);
  let styleImage = null;
  let contextImage = null;

  if (body.styleImage && typeof body.styleImage === 'object') {
    const mimeType = sanitize(body.styleImage.mimeType, 64).toLowerCase();
    const imageData = String(body.styleImage.data || '').trim().replace(/\s+/g, '');
    const url = sanitize(body.styleImage.url, 500);

    if (
      mimeType.startsWith('image/') &&
      imageData &&
      imageData.length <= MAX_STYLE_IMAGE_BASE64_LENGTH &&
      /^[A-Za-z0-9+/=]+$/.test(imageData)
    ) {
      styleImage = { mimeType, data: imageData, url };
    }
  }

  if (body.contextImage && typeof body.contextImage === 'object') {
    const mimeType = sanitize(body.contextImage.mimeType, 64).toLowerCase();
    const imageData = String(body.contextImage.data || '').trim().replace(/\s+/g, '');
    const url = sanitize(body.contextImage.url, 500);

    if (
      mimeType.startsWith('image/') &&
      imageData &&
      imageData.length <= MAX_STYLE_IMAGE_BASE64_LENGTH &&
      /^[A-Za-z0-9+/=]+$/.test(imageData)
    ) {
      contextImage = { mimeType, data: imageData, url };
    }
  }

  if (!STYLE_VALUES.has(style)) {
    return { error: 'Style must be Style 1, Style 2, or Style 3.' };
  }
  if (!lastName) {
    return { error: 'Last name is required.' };
  }
  if (date && !/^[0-9/.-]+$/.test(date)) {
    return { error: 'Date may only include numbers plus / . or - characters.' };
  }
  if (!styleImage) {
    return { error: 'Style image is required for preview generation.' };
  }

  return {
    payload: {
      style,
      lastName,
      date,
      styleImage,
      contextImage,
    },
  };
}

function extractGeneratedImage(responseJson) {
  const parts = (responseJson?.candidates || []).flatMap((candidate) => candidate?.content?.parts || []);
  const inlinePart = parts.find((part) => part?.inlineData?.data);
  if (!inlinePart) return null;
  return {
    mimeType: inlinePart.inlineData.mimeType || 'image/png',
    data: inlinePart.inlineData.data,
  };
}

async function callGeminiImageEdit(payload) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set on the preview server.');
  }

  const engravedLastName = sanitize(payload.lastName, 44);
  const engravedDate = sanitize(payload.date, 20);
  const editMode = ['context-apply', 'date-only', 'surname-only'].includes(payload.editMode)
    ? payload.editMode
    : 'surname-only';
  const promptLines = [
    'Edit this exact QuickClip product image.',
    'Keep camera angle, lighting, background, colors, wood grain, and object layout unchanged.',
    'Do not add guide lines, overlays, logos, watermarks, or new objects.',
  ];

  if (editMode === 'context-apply') {
    promptLines.push(
      'Image 1 is the original clip photo. Image 2 is a deterministic staging preview with the desired text layout.',
      'Use Image 2 as context for text placement and style, but output only the edited version of Image 1.'
    );
    promptLines.push(
      `Surname line MUST be exactly: "${engravedLastName}".`,
      engravedDate
        ? `Date line MUST be exactly: "${engravedDate}" (preserve punctuation exactly as provided).`
        : 'Do not add or change any date text.'
    );
  } else if (editMode === 'date-only') {
    promptLines.push(
      'Change only the engraved date line on the clip face.',
      `Date line MUST be exactly: "${engravedDate}" (preserve punctuation exactly as provided).`,
      'Do not change the surname line.'
    );
  } else {
    promptLines.push(
      'Change only the engraved surname line on the clip face.',
      'Existing surname text may currently read "The Johnsons".',
      `Surname line MUST be exactly: "${engravedLastName}".`,
      'Do not change the date line.'
    );
  }

  promptLines.push('Return only the edited image.');
  const prompt = promptLines.join('\n');
  const requestParts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: payload.styleImage.mimeType,
        data: payload.styleImage.data,
      },
    },
  ];

  if (editMode === 'context-apply' && payload.contextImage) {
    requestParts.push({
      inlineData: {
        mimeType: payload.contextImage.mimeType,
        data: payload.contextImage.data,
      },
    });
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: requestParts,
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
      temperature: 0.1,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiError = json?.error?.message || `Gemini request failed with status ${response.status}.`;
    throw new Error(apiError);
  }

  const generatedImage = extractGeneratedImage(json);
  if (!generatedImage) {
    throw new Error('Gemini did not return an edited image.');
  }

  return generatedImage;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');

  if (request.method === 'OPTIONS') {
    applyCorsHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(response, 200, { ok: true, service: 'quickclips-gemini-preview', model: IMAGE_MODEL });
    return;
  }

  if (request.method === 'POST' && PREVIEW_PATHS.has(requestUrl.pathname)) {
    let body;
    try {
      body = await parseRequestBody(request);
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message });
      return;
    }

    const { payload, error } = validatePayload(body);
    if (error) {
      sendJson(response, 400, { ok: false, error });
      return;
    }

    try {
      let generatedImage;
      if (payload.contextImage) {
        generatedImage = await callGeminiImageEdit({
          ...payload,
          editMode: 'context-apply',
        });
      } else {
        generatedImage = await callGeminiImageEdit({
          ...payload,
          editMode: 'surname-only',
        });

        if (payload.date) {
          generatedImage = await callGeminiImageEdit({
            ...payload,
            styleImage: {
              mimeType: generatedImage.mimeType,
              data: generatedImage.data,
              url: payload.styleImage.url,
            },
            editMode: 'date-only',
          });
        }
      }

      const generatedImageDataUrl = `data:${generatedImage.mimeType};base64,${generatedImage.data}`;
      sendJson(response, 200, {
        ok: true,
        source: 'gemini-image-edit',
        model: IMAGE_MODEL,
        generatedImage,
        generatedImageDataUrl,
      });
    } catch (apiError) {
      sendJson(response, 502, {
        ok: false,
        error: apiError.message || 'Preview generation failed.',
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: 'Not found.' });
});

server.listen(PORT, () => {
  console.log(`QuickClips Gemini preview server listening on http://localhost:${PORT}`);
});
