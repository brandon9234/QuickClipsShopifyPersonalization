---
name: shopify-theme-dev
description: Shopify theme workflow for QuickClips (`489d6f.myshopify.com`) with safe non-production development. Use when a chat needs to pull the live theme, run local preview, push updates to an unpublished theme, or commit/push theme code without affecting the live storefront.
---

# Shopify Theme Dev

Use this skill to execute repeatable Shopify CLI workflows for this repository.

Read `references/project-context.md` first to get the correct store and theme IDs.

## Quick Start

1. Verify prerequisites.
```powershell
shopify.cmd version
git status --short --branch
```
2. Authenticate once in an interactive terminal.
```powershell
shopify.cmd auth login
```
3. Start local preview against the dev theme.
```powershell
.\skills\shopify-theme-dev\scripts\start-preview.ps1
```

## Workflow

1. Pull from live theme before major edits.
```powershell
.\skills\shopify-theme-dev\scripts\pull-live-theme.ps1
```
2. Edit files in `assets/`, `sections/`, `snippets/`, `templates/`, or other theme folders.
3. Run local preview for instant feedback.
```powershell
.\skills\shopify-theme-dev\scripts\start-preview.ps1
```
4. Push to an unpublished theme only.
```powershell
.\skills\shopify-theme-dev\scripts\push-unpublished.ps1
```
5. Commit and push source changes.
```powershell
git add .
git commit -m "Describe the theme change"
git push origin main
```

## Guardrails

1. Use `shopify.cmd` instead of `shopify` on PowerShell hosts with script execution policy restrictions.
2. Avoid `--live` and `--allow-live` unless the user explicitly asks to modify production.
3. Prefer theme ID `143456829555` (`QuickClips Dev`) for preview and non-production pushes.
4. Keep repository and Shopify theme in sync: pull before large edits, push after validation.

## Scripts

1. `scripts/pull-live-theme.ps1`
Purpose: Pull the current live theme into the local repo.
2. `scripts/start-preview.ps1`
Purpose: Start `shopify theme dev` on `http://127.0.0.1:9292/`.
3. `scripts/push-unpublished.ps1`
Purpose: Push local files to an unpublished theme (`QuickClips Dev` by default).

Use `-DryRun` on each script to print the exact command without executing it.

## Common Requests To Handle

1. "Start local preview and keep production safe."
Action: Run `scripts/start-preview.ps1` and ensure theme ID is `143456829555`.
2. "Sync latest production theme code locally."
Action: Run `scripts/pull-live-theme.ps1` with live ID `137348907123`.
3. "Push my updates without publishing."
Action: Run `scripts/push-unpublished.ps1` and verify role remains `unpublished` via `shopify.cmd theme list`.
