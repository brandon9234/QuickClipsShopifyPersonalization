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
   - `.\scripts\start-shopify-theme-dev.ps1 -Store <your-store> -Port 9393`
5. Start Gemini preview server in another terminal:
   - `.\scripts\start-gemini-preview-server.ps1`

## Localhost Launch Rules

Use these rules every time you start local preview to avoid `ERR_CONNECTION_REFUSED`:

1. Start preview using the managed launcher:
   - `.\scripts\start-shopify-theme-dev.ps1 -Store <your-store> -Port 9393`
2. Open exactly `http://127.0.0.1:9393` after the script prints success.
3. Never open bare `127.0.0.1` without a port.
4. To restart cleanly:
   - `.\scripts\stop-shopify-theme-dev.ps1 -All`
   - `.\scripts\start-shopify-theme-dev.ps1 -Store <your-store> -Port 9393`
5. Optional: if `<your-store>` is omitted, the launcher reads `SHOPIFY_FLAG_STORE` from `.env`.

## Localhost Troubleshooting

- Symptom: `This site can't be reached` / `ERR_CONNECTION_REFUSED` on `127.0.0.1:<port>`
  - Cause: no active process is listening on that port.
  - Fix:
    1. Stop stale preview processes:
       - `.\scripts\stop-shopify-theme-dev.ps1 -All`
    2. Start preview on the known port:
       - `.\scripts\start-shopify-theme-dev.ps1 -Store <your-store> -Port 9393`
    3. Re-open `http://127.0.0.1:9393`

- Symptom: `401` on localhost preview
  - Cause: stale Shopify auth/session.
  - Fix:
    1. `.\scripts\shopify-cli.ps1 auth logout`
    2. `.\scripts\shopify-cli.ps1 auth login --store <your-store>`
    3. Re-run `theme dev` and use the freshly served localhost URL.

- Symptom: `http://127.0.0.1:9393` opens but keeps loading forever
  - Cause: a stuck Shopify `theme dev` node process is still listening on the port but not returning a response.
  - Fix:
    1. Hard stop all local theme dev processes:
       - `.\scripts\stop-shopify-theme-dev.ps1 -All`
    2. Confirm the port is clear:
       - `Get-NetTCPConnection -LocalPort 9393 -ErrorAction SilentlyContinue`
       - Expect no results.
    3. Start a fresh process:
       - `.\scripts\start-shopify-theme-dev.ps1 -Store <your-store> -Port 9393`
    4. Re-open `http://127.0.0.1:9393`

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
- `snippets/personalization-product-enabled.liquid`
- `snippets/personalization-line-item-properties.liquid`
- `assets/personalization-preview.js`
- `assets/personalization-preview.css`
- `QuickClipsPersonalization/gemini-preview-server.mjs`
- `QuickClipsPersonalization/README.md`

## Product Eligibility (Customize Button)

`Customize Now` / `Edit Customization` only renders for products that are explicitly eligible:

- `product.metafields.custom.personalization_enabled = true`
- OR product has one of these tags: `customizable`, `personalized`, `personalization`

To remove the button from a non-custom product (for example a logo-only product), remove those tags and keep the metafield false/blank.

## Order-Saved Stage Preview

Personalized products now attach a file line-item property:

- `properties[Personalization Stage Preview]`

At add-to-cart, the script generates or reuses the current stage preview image, attaches it as a file property, and Shopify stores that file URL on the order line item.

## Custom Icon Uploads (Repo)

You can upload your own engraving icons into the repo and have them appear in the `Flower icon` dropdown.

1. Add an icon file using the helper script:
   - `.\scripts\add-personalization-icon.ps1 -SourcePath "C:\path\to\my-icon.svg" -Label "My Icon"`
2. The script will:
   - Copy the file into `assets/` as `quickclip-icon-<key>.<ext>`
   - Update `assets/quickclip-icons.json`
3. Refresh your theme preview and reopen the personalization modal.

Notes:
- Supported formats: `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`
- Icon picker options are loaded from `assets/quickclip-icons.json`

## Agent-Friendly Docs

- `AGENTS.md`: repo operating rules for coding agents.
- `skills/quickclips-shopify-theme/SKILL.md`: reusable agent skill for this theme.
- `QuickClipsPersonalization/ARCHITECTURE.md`: live personalization architecture, compatibility notes, and refactor safety rails.

## Theme Safety Rules

- Keep core Shopify directories and file names intact.
- Do not move personalization files without updating all Liquid references.
- Treat `.tools-local-backup/` as local-only; do not include it in commits.
- Validate changed JS syntax and run theme checks before shipping.
- Use `.\scripts\shopify-theme-check.ps1` for repeatable theme linting.

## Agent Workflow

1. Read `AGENTS.md`.
2. Use `skills/quickclips-shopify-theme/SKILL.md` for implementation workflow.
3. Run `.\.tools\node-v20.19.5-win-x64\node.exe scripts/test-personalization-contract.mjs`.
4. Run `.\scripts\shopify-theme-check.ps1` plus the syntax checks before creating a commit.
