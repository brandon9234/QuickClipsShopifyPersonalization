---
name: quickclips-shopify-theme
description: Maintain and extend the QuickClips Shopify theme, including personalization modal UX, Liquid/JSON template wiring, asset updates, and Gemini preview server integration. Use when implementing or debugging Shopify theme behavior, preview issues, cart line-item properties, or personalization generation flow in this repository.
---

# QuickClips Shopify Theme Skill

Follow this workflow when modifying theme behavior.

## Workflow

1. Inspect change scope:
   - Run `git status --short`.
   - Identify target files using [references/repo-map.md](references/repo-map.md).
2. Make focused edits:
   - Keep Shopify directory conventions unchanged.
   - Update only related files for the feature/fix.
3. Validate behavior and syntax:
   - Use [references/validation.md](references/validation.md) commands.
4. Verify personalization integration:
   - Confirm modal, JS state, and line-item properties remain consistent.
   - Use [references/personalization-pipeline.md](references/personalization-pipeline.md) for the data flow.
5. Document meaningful workflow changes:
   - Update `README.md` or `QuickClipsPersonalization/README.md` when behavior changes.

## Constraints

- Do not rename core Shopify folders or break snippet includes.
- Do not remove existing line-item properties without explicit instruction.
- Do not commit local backup/tool artifacts like `.tools-local-backup/`.

