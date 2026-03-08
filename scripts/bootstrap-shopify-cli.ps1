param(
  [switch]$Force,
  [string]$RunnerDir
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeExe = Join-Path $repoRoot '.tools\node-v20.19.5-win-x64\node.exe'
$nodeDir = Split-Path -Parent $nodeExe
$npmCmd = Join-Path $repoRoot '.tools\node-v20.19.5-win-x64\npm.cmd'

if (-not $RunnerDir) {
  if ($env:SHOPIFY_CLI_RUNNER_DIR) {
    $RunnerDir = $env:SHOPIFY_CLI_RUNNER_DIR
  } else {
    if (-not $env:LOCALAPPDATA) {
      throw 'LOCALAPPDATA is not set. Set SHOPIFY_CLI_RUNNER_DIR to a writable path.'
    }
    $RunnerDir = Join-Path $env:LOCALAPPDATA 'QuickClips\shopify-cli-runner'
  }
}

$runnerDir = [System.IO.Path]::GetFullPath($RunnerDir)
$npmCacheDir = if ($env:SHOPIFY_NPM_CACHE_DIR) { $env:SHOPIFY_NPM_CACHE_DIR } else { Join-Path $env:LOCALAPPDATA 'QuickClips\npm-cache' }

if (-not (Test-Path $nodeExe)) {
  throw "Node runtime not found at $nodeExe"
}

if (-not (Test-Path $npmCmd)) {
  throw "npm not found at $npmCmd"
}

if (-not (Test-Path $runnerDir)) {
  New-Item -ItemType Directory -Path $runnerDir -Force | Out-Null
}

if (-not (Test-Path $npmCacheDir)) {
  New-Item -ItemType Directory -Path $npmCacheDir -Force | Out-Null
}

$packageJsonPath = Join-Path $runnerDir 'package.json'
if (-not (Test-Path $packageJsonPath)) {
  @'
{
  "name": "shopify-cli-runner",
  "private": true,
  "version": "1.0.0"
}
'@ | Set-Content -Path $packageJsonPath -NoNewline
}

Push-Location $runnerDir
try {
  $originalPath = $env:PATH
  $env:PATH = "$nodeDir;$env:PATH"

  $installArgs = @('install', '--save-exact')
  $installArgs += @('--cache', $npmCacheDir)
  if ($Force) {
    $installArgs += '@shopify/cli@latest'
  } else {
    $installArgs += '@shopify/cli'
  }

  & $npmCmd @installArgs
  if ($LASTEXITCODE -ne 0) {
    throw "npm install failed with exit code $LASTEXITCODE"
  }
} finally {
  if ($originalPath) {
    $env:PATH = $originalPath
  }
  Pop-Location
}

Write-Output "Shopify CLI bootstrap completed at $runnerDir"
Write-Output "npm cache: $npmCacheDir"
