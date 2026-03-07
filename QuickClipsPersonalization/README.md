# QuickClips Personalization Preview Server

This server handles Gemini preview generation so the API key is kept in environment variables.

## 1) Set environment variables

PowerShell example:

```powershell
$env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
$env:GEMINI_MODEL = "gemini-2.0-flash"   # optional
$env:PORT = "8788"                        # optional
```

## 2) Start the server

```powershell
node QuickClipsPersonalization/gemini-preview-server.mjs
```

API endpoint:

- `POST http://localhost:8788/api/personalization-preview`
- body: `{ "style": "Style 1", "name1": "...", "name2": "...", "date": "..." }`

## 3) Connect the theme UI

The theme JS checks `window.QuickClipsPersonalization.apiUrl`.

For local testing (browser console):

```js
window.QuickClipsPersonalization = {
  apiUrl: 'http://localhost:8788/api/personalization-preview',
};
```

If `window.QuickClipsPersonalization.apiUrl` is not set, the theme defaults to:

- `/apps/quickclips-personalization/preview`

Use that default path when routing through a Shopify app proxy in production.
