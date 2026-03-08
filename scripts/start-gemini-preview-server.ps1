param(
  [string]$EnvPath = '.env',
  [int]$Port
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeExe = Join-Path $repoRoot '.tools\node-v20.19.5-win-x64\node.exe'
$serverPath = Join-Path $repoRoot 'QuickClipsPersonalization\gemini-preview-server.mjs'
$resolvedEnvPath = if ([System.IO.Path]::IsPathRooted($EnvPath)) { $EnvPath } else { Join-Path $repoRoot $EnvPath }

if (-not (Test-Path $nodeExe)) {
  throw "Node runtime not found at $nodeExe"
}

if (-not (Test-Path $serverPath)) {
  throw "Gemini preview server file not found at $serverPath"
}

if (Test-Path $resolvedEnvPath) {
  foreach ($line in Get-Content $resolvedEnvPath) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^\s*$') { continue }
    if ($line -match '^(?<key>[A-Z0-9_]+)=(?<value>.*)$') {
      [Environment]::SetEnvironmentVariable($matches.key, $matches.value, 'Process')
    }
  }
}

if ($Port -gt 0) {
  [Environment]::SetEnvironmentVariable('PORT', [string]$Port, 'Process')
}

if (-not $env:GEMINI_API_KEY) {
  throw 'GEMINI_API_KEY is not set. Add it to .env or set it in your shell.'
}

& $nodeExe $serverPath
