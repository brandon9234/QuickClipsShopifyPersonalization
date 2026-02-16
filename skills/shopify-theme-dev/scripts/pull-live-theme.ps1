[CmdletBinding()]
param(
    [string]$Store = "489d6f.myshopify.com",
    [string]$LiveThemeId = "137348907123",
    [string]$ThemePath = ".",
    [switch]$DryRun
)

# Fail early so agents do not miss intermediate command errors.
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

# Build CLI args as an array to avoid quoting bugs.
$cliArgs = @(
    "theme", "pull",
    "--store", $Store,
    "--theme", $LiveThemeId,
    "--path", $ThemePath
)

if ($DryRun) {
    Write-Host "[DRY RUN] $shopify $($cliArgs -join ' ')"
    return
}

& $shopify @cliArgs
