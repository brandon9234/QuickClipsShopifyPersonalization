[CmdletBinding()]
param(
    [string]$Store = "489d6f.myshopify.com",
    [string]$ThemeName = "QuickClips Dev",
    [switch]$DryRun
)

# Fail immediately on errors so agents can react to the exact failed step.
$ErrorActionPreference = "Stop"

function Resolve-ShopifyCli {
    # Prefer shopify.cmd on Windows to avoid PowerShell execution-policy issues.
    $cmd = Get-Command "shopify.cmd" -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "shopify.cmd was not found in PATH. Install Shopify CLI first."
    }
    return $cmd.Source
}

$shopify = Resolve-ShopifyCli

# Push to an unpublished theme only; never publish live from this helper.
$cliArgs = @(
    "theme", "push",
    "--store", $Store,
    "--unpublished",
    "--theme", $ThemeName,
    "--json"
)

if ($DryRun) {
    Write-Host "[DRY RUN] $shopify $($cliArgs -join ' ')"
    return
}

& $shopify @cliArgs
