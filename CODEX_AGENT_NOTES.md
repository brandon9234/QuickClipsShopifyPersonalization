# Codex Agent Notes

## Branch
`main` (current working branch as of 2026-03-18)

## Role
Codex is the active coding agent for this repository handoff state.
- This repo currently reflects direct Codex work on `main`.
- Do not assume there is a separate agent-owned worktree or parallel branch for the current changes.
- Preserve existing user changes and local in-progress work before starting unrelated edits.

## Safe Collaboration Checklist
- [ ] Confirm the current branch and whether work should continue on `main` or move to a feature branch
- [ ] Read coordination files before overwriting them
- [ ] Check the full working tree before making broader changes
- [ ] Decide whether branching is needed before unrelated feature work
- [ ] Check `git diff` and `git status` before any major refactor
- [ ] Leave a handoff note after completing significant work

---

## Coordination Rules
- This worktree is Codex-operated. Do not assume any separate agent-specific branch or worktree context.
- Do not discard or overwrite current local edits without explicit user instruction.
- Do not push to `main` or force-push anything.
- Commit messages should clearly label scope (for example `feat(preview):` or `fix(theme):`).
- If a merge conflict occurs: stop, summarize the conflicting files and areas, and wait for user guidance.

---

## Before Editing
1. Run `git status` to confirm clean state or note outstanding changes.
2. Run `git branch --show-current` to confirm the current branch and capture it in notes if handoff state changed.
3. Read the file before editing it; never overwrite blindly.
4. For coordination files specifically, check contents before any update.

---

## Before Merging main
1. Run `git fetch origin` to get latest remote state.
2. Review `git status` and `git diff` first so local work is understood before any merge.
3. Review `git log origin/main..HEAD` to understand divergence if working on a feature branch.
4. Run `git merge origin/main` when appropriate.
5. If conflicts arise: stop and summarize; do not guess at resolution.
6. After merge, verify the app still works before committing.

---

## Handoff Notes
_Update this section after completing significant work so the next agent session can resume safely._

- **2026-03-20**: Completed a repo-cohesion pass focused on active personalization contracts versus compatibility-only paths.
  Added `QuickClipsPersonalization/ARCHITECTURE.md` to document the runtime source of truth, deprecated-but-still-supported properties, and safe refactor boundaries.
  Added `scripts/test-personalization-contract.mjs` as a lightweight integration contract test that checks the theme still loads the personalization assets, renders the modal/trigger hooks, and preserves hidden property bindings.
  Extracted duplicated cart/order property display logic into `snippets/personalization-property-hidden.liquid` and `snippets/personalization-property-value.liquid`; `sections/main-cart-items.liquid`, `sections/cart-notification-product.liquid`, and `sections/main-order.liquid` now use the shared helpers.
  Removed unused live-theme CSS blocks from `assets/personalization-preview.css` that were only referenced by the standalone `preview-demo.html` mock (`__mode-options`, `__style-options`, range/helper/count/icon-clear blocks and related mobile overrides).
  Compatibility-only paths still intentionally remain in the runtime for now:
  `properties[Personalization Primary Text]`,
  `properties[Personalization Secondary Text]`,
  `properties[_Personalization Gemini Preview]`,
  and JS state fields such as `generatedImage` / `geminiSummary`.
  Validation run:
  `.\.tools\node-v20.19.5-win-x64\node.exe scripts/test-personalization-contract.mjs` passed,
  `.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js` passed,
  `.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs` passed,
  `rg -n "^<<<<<<<|^=======|^>>>>>>>" .` clean,
  `.\scripts\shopify-theme-check.ps1` passed with existing baseline warnings only.
  Best next step is a second-wave refactor inside `assets/personalization-preview.js`:
  isolate state, DOM wiring, and persistence helpers into clearly marked modules/functions while preserving the current Liquid data contract.
- **2026-03-20**: Added uploaded artwork support to the personalization modal.
  `snippets/personalization-preview-modal.liquid` now exposes a photo/logo file input with remove controls, and `snippets/personalization-line-item-properties.liquid` now includes `properties[Personalization Artwork Upload]` as a hidden file property.
  `assets/personalization-preview.js` now converts uploaded artwork into an engraved-brown preview layer, keeps it within the safe area using the same drag/resize/rotate interactions as icons, includes it in browser-rendered stage snapshots, and attaches the original upload file during save/submit.
  Validation run:
  `.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js` passed,
  `.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs` passed,
  `.\.tools\node-v20.19.5-win-x64\node.exe scripts/test-personalization-contract.mjs` passed,
  `rg -n "^<<<<<<<|^=======|^>>>>>>>" .` clean,
  `.\scripts\shopify-theme-check.ps1` returned exit code 0 with the repo baseline warnings/errors only (including long-standing `ImgWidthAndHeight` warnings and existing `MatchingTranslations` noise).
  Known limitation:
  the uploaded preview is an approximation of engraved output, not a physically accurate laser/wood simulation. White or very light areas are reduced to transparency so logos/photos read more like burned artwork on the clip surface.
- **2026-03-18**: Coordination docs updated from legacy agent naming to Codex-specific naming.
  The legacy agent notes file was replaced by `CODEX_AGENT_NOTES.md`.
  `AGENT_WORKTREE_RULES.md` and the repo map were updated to reflect that the current repo state is being handed off through Codex on `main`.
- **2026-03-18**: Personalization editor work is in progress across:
  `assets/personalization-preview.js`,
  `assets/personalization-preview.css`,
  `snippets/personalization-preview-modal.liquid`,
  `snippets/personalization-preview-trigger.liquid`,
  `snippets/personalization-line-item-properties.liquid`,
  `QuickClipsPersonalization/README.md`.
  Latest completed changes:
  merged style picker, textbox 1/2/3 workflow, textbox delete controls, icon mirror/delete controls, text/icon rotation controls, persisted rotation in saved layout JSON, broader icon scaling, and stricter trigger gating for QuickClips logo products so the customize button only appears when `Custom Engraving` is selected.
  Latest bugfixes:
  icon rotation no longer changes icon size, editor drag/rotate clamps use the full clip surface, bounds warnings are no longer always-on, and the engravable-area border was made more visible again.
  Validation run:
  `.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js` passed,
  `.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs` passed,
  `rg -n "^<<<<<<<|^=======|^>>>>>>>" .` clean.
  Theme check still reports the repo baseline issues, including existing `ImgWidthAndHeight` errors in `snippets/personalization-preview-modal.liquid` and `snippets/personalization-preview-trigger.liquid`; these were not cleaned up in this pass.
  Current working tree is dirty with the files above plus local-only `.tools-local-backup/` artifacts; do not treat `.tools-local-backup/` as source.
  Best next step is browser QA on the personalization modal to verify the safe-area border/warning behavior and the QuickClips-logo trigger gating on real product selections.
