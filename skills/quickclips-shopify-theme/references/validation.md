# Validation Commands

Run from repo root.

## Syntax

```powershell
.\.tools\node-v20.19.5-win-x64\node.exe --check assets/personalization-preview.js
.\.tools\node-v20.19.5-win-x64\node.exe --check QuickClipsPersonalization/gemini-preview-server.mjs
```

## Conflict Markers

```powershell
rg -n "^<<<<<<<|^=======|^>>>>>>>" .
```

## Shopify Theme Check

```powershell
.\scripts\shopify-theme-check.ps1
```

If CLI dependencies are not installed:

```powershell
.\scripts\bootstrap-shopify-cli.ps1
.\scripts\shopify-theme-check.ps1
```

To run other Shopify CLI commands after bootstrap:

```powershell
.\scripts\shopify-cli.ps1 auth login --store <store>
.\scripts\shopify-cli.ps1 theme dev --store <store> --path .
```

CLI runner location defaults to `%LOCALAPPDATA%\QuickClips\shopify-cli-runner`.
Override with `SHOPIFY_CLI_RUNNER_DIR`.

## Optional Gemini Sanity Check

Validate model availability:

```powershell
$apiKey = (Get-Content .env | Where-Object { $_ -match '^GEMINI_API_KEY=' } | Select-Object -First 1).Split('=')[1]
Invoke-RestMethod -Method Get -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey"
```
