# QuickClips Shopify Theme

This repository is a Shopify theme with a QuickClips personalization workflow:
- Theme templates, sections, snippets, assets, and locale files live at the repo root.
- Personalization-specific server and implementation notes live in `QuickClipsPersonalization/`.

## Quick Start

1. Configure environment variables in `.env`:
   - `SHOPIFY_FLAG_STORE`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
2. Bootstrap Shopify CLI once:
   - `.\scripts\bootstrap-shopify-cli.ps1`
   - Optional override: set `SHOPIFY_CLI_RUNNER_DIR` to control where CLI is installed.
3. Authenticate Shopify CLI:
   - `.\scripts\shopify-cli.ps1 auth login --store <your-store>`
4. Start local theme preview:
   - `.\scripts\shopify-cli.ps1 theme dev --store <your-store> --path .`
5. Start Gemini preview server in another terminal:
   - `.\scripts\start-gemini-preview-server.ps1`

## Repository Layout

- `assets/`: Theme JavaScript, CSS, and image assets.
- `layout/`: Core theme layout files (`theme.liquid`).
- `sections/`: Section components and schema.
- `snippets/`: Reusable Liquid fragments (including personalization modal and trigger).
- `templates/`: JSON/Liquid template definitions.
- `config/`: Theme settings and defaults.
- `locales/`: Translation resources.
- `QuickClipsPersonalization/`: Gemini preview server and personalization docs.
- `skills/`: Local skills for coding agents working in this repo.

## Personalization Files (Primary)

- `snippets/personalization-preview-modal.liquid`
- `snippets/personalization-preview-trigger.liquid`
- `snippets/personalization-line-item-properties.liquid`
- `assets/personalization-preview.js`
- `assets/personalization-preview.css`
- `QuickClipsPersonalization/gemini-preview-server.mjs`
- `QuickClipsPersonalization/README.md`

## Agent-Friendly Docs

- `AGENTS.md`: repo operating rules for coding agents.
- `skills/quickclips-shopify-theme/SKILL.md`: reusable agent skill for this theme.

## Theme Safety Rules

- Keep core Shopify directories and file names intact.
- Do not move personalization files without updating all Liquid references.
- Treat `.tools-local-backup/` as local-only; do not include it in commits.
- Validate changed JS syntax and run theme checks before shipping.
- Use `.\scripts\shopify-theme-check.ps1` for repeatable theme linting.

## Agent Workflow

1. Read `AGENTS.md`.
2. Use `skills/quickclips-shopify-theme/SKILL.md` for implementation workflow.
3. Run `.\scripts\shopify-theme-check.ps1` plus the syntax checks before creating a commit.
