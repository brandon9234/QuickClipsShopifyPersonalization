# Repo Map

## Shopify Core

- `layout/theme.liquid`: Theme shell and global includes.
- `assets/`: JS, CSS, and image assets.
- `sections/`: Page sections with schema.
- `snippets/`: Reusable Liquid fragments.
- `templates/`: JSON/Liquid templates.
- `config/`: Theme settings and defaults.
- `locales/`: Translation strings.

## Personalization Feature

- `snippets/personalization-preview-trigger.liquid`: Customize button trigger.
- `snippets/personalization-preview-modal.liquid`: Modal markup.
- `snippets/personalization-line-item-properties.liquid`: Hidden cart properties.
- `assets/personalization-preview.js`: Personalization state and generation logic.
- `assets/personalization-preview.css`: Personalization UI styles.
- `QuickClipsPersonalization/gemini-preview-server.mjs`: Server-side Gemini call.
- `QuickClipsPersonalization/README.md`: Behavior and setup details.

## Agent/Collaboration Docs

- `AGENTS.md`: Repository operating guide.
- `AGENT_WORKTREE_RULES.md`: Legacy parallel-worktree coordination notes.
- `CLAUDE_AGENT_NOTES.md`: Legacy handoff notes.
- `skills/quickclips-shopify-theme/`: Reusable skill for this repo.
- `scripts/bootstrap-shopify-cli.ps1`: Installs Shopify CLI in a local runner directory.
- `scripts/shopify-cli.ps1`: Wrapper for Shopify CLI commands.
- `scripts/shopify-theme-check.ps1`: Runs Shopify theme validation.
- `scripts/start-gemini-preview-server.ps1`: Starts the Gemini preview server with `.env` values.
