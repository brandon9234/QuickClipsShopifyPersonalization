import http from 'node:http';

const PORT = Number.parseInt(process.env.PORT || '8788', 10);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const API_KEY = process.env.GEMINI_API_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const STYLE_VALUES = new Set(['Style 1', 'Style 2', 'Style 3']);

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
      if (raw.length > 20000) {
        reject(new Error('Payload is too large.'));
      }
    });

    request.on('end', () => {
      try {
        const body = raw ? JSON.parse(raw) : {};
        resolve(body);
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

function validatePayload(body) {
  const style = sanitize(body.style, 20);
  const name1 = sanitize(body.name1, 40);
  const name2 = sanitize(body.name2, 40);
  const date = sanitize(body.date, 32);

  if (!STYLE_VALUES.has(style)) {
    return { error: 'Style must be Style 1, Style 2, or Style 3.' };
  }
  if (!name1) {
    return { error: 'Name 1 is required.' };
  }
  if (!name2) {
    return { error: 'Name 2 is required.' };
  }
  if (!date) {
    return { error: 'Date is required.' };
  }

  return {
    payload: {
      style,
      name1,
      name2,
      date,
    },
  };
}

function extractJsonBlock(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
}

function buildFallbackPreview(payload) {
  return {
    headline: `${payload.name1} & ${payload.name2}`,
    subline: `${payload.style} engraving layout`,
    dateLine: payload.date,
    styleNotes: 'Balanced spacing with a centered date lockup.',
  };
}

function normalizePreview(rawPreview, payload) {
  const fallback = buildFallbackPreview(payload);

  return {
    headline: sanitize(rawPreview.headline, 60) || fallback.headline,
    subline: sanitize(rawPreview.subline, 90) || fallback.subline,
    dateLine: sanitize(rawPreview.dateLine, 60) || fallback.dateLine,
    styleNotes: sanitize(rawPreview.styleNotes, 160) || fallback.styleNotes,
  };
}

async function callGemini(payload) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set on the preview server.');
  }

  const prompt = [
    'You generate personalized QuickClip preview copy from storefront form fields.',
    'Use the selected style and the exact text-box values below to craft preview copy.',
    'Return strict JSON only with keys: headline, subline, dateLine, styleNotes.',
    'headline: primary engraving line based on Name 1 (max 60 chars).',
    'subline: secondary engraving line based on Name 2 (max 90 chars).',
    'dateLine: date line using the Date value exactly as provided (max 60 chars).',
    'styleNotes: short style-specific arrangement guidance for selected style (max 160 chars).',
    `Style: ${payload.style}`,
    `Name 1: ${payload.name1}`,
    `Name 2: ${payload.name2}`,
    `Date: ${payload.date}`,
  ].join('\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiError =
      json?.error?.message || `Gemini request failed with status ${response.status}.`;
    throw new Error(apiError);
  }

  const text = (json?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || '')
    .join('\n')
    .trim();

  const parsed = extractJsonBlock(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini response did not include valid JSON preview data.');
  }

  return normalizePreview(parsed, payload);
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
    sendJson(response, 200, { ok: true, service: 'quickclips-gemini-preview' });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/personalization-preview') {
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
      const preview = await callGemini(payload);
      sendJson(response, 200, {
        ok: true,
        source: 'gemini',
        model: MODEL,
        preview,
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
