param(
  [string]$Store,
  [int]$Port = 9393,
  [string]$BindHost = '127.0.0.1',
  [switch]$KeepExisting,
  [switch]$OpenBrowser
)

$ErrorActionPreference = 'Stop'

function Resolve-RunnerDir {
  if ($env:SHOPIFY_CLI_RUNNER_DIR) {
    return [System.IO.Path]::GetFullPath($env:SHOPIFY_CLI_RUNNER_DIR)
  }
  if (-not $env:LOCALAPPDATA) {
    throw 'LOCALAPPDATA is not set. Set SHOPIFY_CLI_RUNNER_DIR to a writable path.'
  }
  return Join-Path $env:LOCALAPPDATA 'QuickClips\shopify-cli-runner'
}

function Resolve-StoreFromEnvFile([string]$EnvPath) {
  if (-not (Test-Path $EnvPath)) {
    return ''
  }

  foreach ($line in Get-Content $EnvPath) {
    if ($line -match '^\s*#') { continue }
    if ($line -match '^\s*$') { continue }
    if ($line -match '^SHOPIFY_FLAG_STORE=(?<value>.+)$') {
      return $matches.value.Trim()
    }
  }

  return ''
}

function Get-ThemeDevProcesses {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -match '^node(\.exe)?$' -and
      $_.CommandLine -match '@shopify\\cli\\bin\\run\.js"?\s+theme\s+dev'
    }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeExe = Join-Path $repoRoot '.tools\node-v20.19.5-win-x64\node.exe'
$runnerDir = Resolve-RunnerDir
$cliRunJs = Join-Path $runnerDir 'node_modules\@shopify\cli\bin\run.js'
$envFile = Join-Path $repoRoot '.env'

if (-not (Test-Path $nodeExe)) {
  throw "Node runtime not found at $nodeExe"
}
if (-not (Test-Path $cliRunJs)) {
  throw "Shopify CLI is not installed in $runnerDir. Run scripts/bootstrap-shopify-cli.ps1 first."
}

if (-not $Store) {
  if ($env:SHOPIFY_FLAG_STORE) {
    $Store = $env:SHOPIFY_FLAG_STORE.Trim()
  } else {
    $Store = Resolve-StoreFromEnvFile -EnvPath $envFile
  }
}
if (-not $Store) {
  throw 'Store is required. Pass -Store <store> or set SHOPIFY_FLAG_STORE in .env.'
}

if (-not $KeepExisting) {
  $existing = Get-ThemeDevProcesses
  foreach ($proc in $existing) {
    try {
      Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
    } catch {
      Write-Warning "Could not stop stale theme dev process PID $($proc.ProcessId): $($_.Exception.Message)"
    }
  }
}

$listeners = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($listeners) {
  foreach ($listener in $listeners) {
    if ($listener.OwningProcess -ne $PID) {
      try {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop
      } catch {
        Write-Warning "Could not stop listener PID $($listener.OwningProcess) on port ${Port}: $($_.Exception.Message)"
      }
    }
  }
}

$logDir = Join-Path $repoRoot '.tools-local-backup'
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outLog = Join-Path $logDir "shopify-theme-dev-$Port-$stamp.out.log"
$errLog = Join-Path $logDir "shopify-theme-dev-$Port-$stamp.err.log"

$args = @(
  $cliRunJs,
  'theme',
  'dev',
  '--store',
  $Store,
  '--host',
  $BindHost,
  '--port',
  [string]$Port,
  '--no-color'
)

$process = Start-Process `
  -FilePath $nodeExe `
  -ArgumentList $args `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -PassThru

$url = "http://$BindHost`:$Port"
$statusCode = $null
$deadline = (Get-Date).AddSeconds(60)

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 1
  if ($process.HasExited) {
    $outTail = if (Test-Path $outLog) { (Get-Content $outLog -Tail 40) -join [Environment]::NewLine } else { '' }
    $errTail = if (Test-Path $errLog) { (Get-Content $errLog -Tail 40) -join [Environment]::NewLine } else { '' }
    throw "theme dev exited early (code $($process.ExitCode)).`nSTDOUT:`n$outTail`nSTDERR:`n$errTail"
  }

  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 5
    $statusCode = [int]$response.StatusCode
    break
  } catch {
    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
      if ($statusCode -eq 401 -or $statusCode -eq 302) {
        break
      }
    }
  }
}

if (-not $statusCode) {
  throw "theme dev did not become reachable at $url within 60 seconds."
}

$state = [pscustomobject]@{
  pid = $process.Id
  store = $Store
  host = $BindHost
  port = $Port
  url = $url
  startedAt = (Get-Date).ToString('o')
  statusCode = $statusCode
  stdoutLog = $outLog
  stderrLog = $errLog
}

$statePath = Join-Path $logDir 'shopify-theme-dev-state.json'
$state | ConvertTo-Json | Set-Content -Path $statePath -NoNewline

Write-Output "Shopify theme dev started."
Write-Output "URL: $url"
Write-Output "HTTP status check: $statusCode"
Write-Output "PID: $($process.Id)"
Write-Output "State file: $statePath"
Write-Output "STDOUT log: $outLog"
Write-Output "STDERR log: $errLog"

if ($OpenBrowser) {
  Start-Process $url
}
