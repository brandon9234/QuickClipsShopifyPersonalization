# QuickClips Personalization Architecture

This document captures the live personalization contract in this repo so future refactors can stay compatible with the storefront, line-item properties, and local Gemini preview flow.

## Source Of Truth

- Theme shell and asset loading: `layout/theme.liquid`
- Trigger + scope metadata: `snippets/personalization-preview-trigger.liquid`
- Modal markup: `snippets/personalization-preview-modal.liquid`
- Hidden cart properties contract: `snippets/personalization-line-item-properties.liquid`
- Frontend state, rendering, persistence, and Gemini request flow: `assets/personalization-preview.js`
- Personalization styling: `assets/personalization-preview.css`
- Gemini preview server: `QuickClipsPersonalization/gemini-preview-server.mjs`

## Active Runtime Flow

1. The theme always loads `personalization-preview.js` and `personalization-preview.css`, and renders the shared modal once in `layout/theme.liquid`.
2. Product and quick-add forms render scoped trigger buttons plus hidden line-item property inputs.
3. The frontend keeps per-scope personalization state in memory and synchronizes that state back into hidden inputs.
4. The visible stage preview is browser-rendered and deterministic; Gemini generation is used as a backend validation/generation step, but the shopper-facing saved preview comes from the browser-rendered stage snapshot.
5. Saved personalization is displayed back in trigger panels and written to Shopify line-item properties, including the stage preview file property and any uploaded artwork file used for engraving preview.

## Compatibility And Deprecated Paths

These items are still present for compatibility, but they are no longer the primary live feature surface:

- `properties[Personalization Primary Text]` and `properties[Personalization Secondary Text]`
  These are compatibility properties retained alongside the newer expanded property set. Do not remove them without a migration plan.
- `properties[_Personalization Gemini Preview]`
  This property remains in the payload contract, but the current UI no longer shows a standalone Gemini summary/result panel.
- `generatedImage` and `geminiSummary` frontend state fields
  These remain as compatibility plumbing, not as the primary shopper-visible preview output.
- `preview-demo.html`
  This is a standalone legacy mock/sandbox file. It is not loaded by Shopify theme runtime and should not be treated as the live storefront implementation.

## Live CSS Surface

The shipped theme CSS should only contain selectors used by the live Liquid/JS integration. Older modal variants previously used:

- mode toggle styles
- range/range-value styles
- character count/helper styles
- tile-style picker styles from an earlier modal shape

Those belong to older UI iterations or the standalone `preview-demo.html` reference and should not be reintroduced into the live asset unless the corresponding markup is restored.

## Cart And Order Display Contract

Shopper-facing personalization display in cart, cart notification, and order views should use shared helper snippets so legacy property hiding and stage-preview rendering stay consistent:

- `snippets/personalization-property-hidden.liquid`
- `snippets/personalization-property-value.liquid`

## Safety Checks

Run these after personalization refactors:

```powershell
.\.tools\node-v20.19.5-win-x64\node.exe scripts/test-personalization-contract.mjs
.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js
.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs
rg -n "^<<<<<<<|^=======|^>>>>>>>" .
.\scripts\shopify-theme-check.ps1
```

The contract test is intentionally lightweight. It protects the shared Liquid/JS selector contract so agents can refactor internals without accidentally breaking the integration surface.
