[CmdletBinding()]
param(
    [string]$Store = "489d6f.myshopify.com",
    [string]$ThemeId = "143456829555",
    [string]$ListenHost = "127.0.0.1",
    [int]$Port = 9292,
    [ValidateSet("hot-reload", "full-page", "off")]
    [string]$LiveReload = "hot-reload",
    [switch]$OpenBrowser,
    [switch]$DryRun
)

# Stop on any command failure to keep agent behavior deterministic.
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

# Use an argument array so values remain correctly escaped.
$cliArgs = @(
    "theme", "dev",
    "--store", $Store,
    "--theme", $ThemeId,
    "--host", $ListenHost,
    "--port", $Port.ToString(),
    "--live-reload", $LiveReload
)

if ($OpenBrowser) {
    $cliArgs += "--open"
}

if ($DryRun) {
    Write-Host "[DRY RUN] $shopify $($cliArgs -join ' ')"
    return
}

& $shopify @cliArgs
