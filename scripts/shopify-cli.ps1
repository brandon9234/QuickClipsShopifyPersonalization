[CmdletBinding(PositionalBinding = $false)]
param(
  [string]$RunnerDir,
  [Parameter(Mandatory = $true, Position = 0, ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeExe = Join-Path $repoRoot '.tools\node-v20.19.5-win-x64\node.exe'

if (-not (Test-Path $nodeExe)) {
  throw "Node runtime not found at $nodeExe"
}

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
$cliRunJs = Join-Path $runnerDir 'node_modules\@shopify\cli\bin\run.js'

if (-not (Test-Path $cliRunJs)) {
  throw "Shopify CLI is not installed in $runnerDir. Run scripts/bootstrap-shopify-cli.ps1 first."
}

& $nodeExe $cliRunJs @Args
