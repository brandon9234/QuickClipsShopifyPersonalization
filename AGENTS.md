# AGENTS: QuickClips Shopify Theme

This file defines how coding agents should operate in this repository.

## Scope

Use this repo as a Shopify theme project first, and a personalization app-integration project second.
All changes must preserve Shopify theme compatibility.

## Read First

1. `README.md`
2. `QuickClipsPersonalization/README.md`
3. This file

## Working Rules

- Keep edits minimal and scoped to the user request.
- Prefer existing patterns in `snippets/`, `assets/`, and `templates/`.
- Do not rename core Shopify folders (`assets`, `layout`, `sections`, `snippets`, `templates`, `config`, `locales`).
- Treat `.tools-local-backup/` as local-only and non-source.
- Do not remove existing line-item property keys unless explicitly requested.

## Personalization System Map

- UI trigger: `snippets/personalization-preview-trigger.liquid`
- Modal markup: `snippets/personalization-preview-modal.liquid`
- Hidden cart properties: `snippets/personalization-line-item-properties.liquid`
- Modal behavior: `assets/personalization-preview.js`
- Modal styling: `assets/personalization-preview.css`
- Gemini preview server: `QuickClipsPersonalization/gemini-preview-server.mjs`

## Expected Env Vars

- `SHOPIFY_FLAG_STORE`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `PORT` (optional for local preview server)

## Common Commands

- Bootstrap CLI: `.\scripts\bootstrap-shopify-cli.ps1`
- Shopify login: `.\scripts\shopify-cli.ps1 auth login --store <store>`
- Theme preview: `.\scripts\shopify-cli.ps1 theme dev --store <store> --path .`
- Start Gemini preview server: `.\scripts\start-gemini-preview-server.ps1`
- Theme lint/check: `.\scripts\shopify-theme-check.ps1`

## Validation Checklist

Run these after code changes:

1. JavaScript syntax:
   - `.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js`
   - `.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs`
2. Conflict markers:
   - `rg -n "^<<<<<<<|^=======|^>>>>>>>" .`
3. Theme check:
   - `.\scripts\shopify-theme-check.ps1`

If theme check tooling is missing:

1. `.\scripts\bootstrap-shopify-cli.ps1`
2. Re-run `.\scripts\shopify-theme-check.ps1`

Shopify CLI install location defaults to `%LOCALAPPDATA%\QuickClips\shopify-cli-runner`.
Set `SHOPIFY_CLI_RUNNER_DIR` to override it.

## Agent Skill

Use `skills/quickclips-shopify-theme/SKILL.md` for a repeatable workflow when working on this repo.
