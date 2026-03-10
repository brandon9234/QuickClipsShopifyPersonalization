param(
  [switch]$All
)

$ErrorActionPreference = 'Stop'

function Get-ThemeDevProcesses {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -match '^node(\.exe)?$' -and
      $_.CommandLine -match '@shopify\\cli\\bin\\run\.js"?\s+theme\s+dev'
    }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$statePath = Join-Path $repoRoot '.tools-local-backup\shopify-theme-dev-state.json'
$stopped = @()

if ((-not $All) -and (Test-Path $statePath)) {
  try {
    $state = Get-Content $statePath | ConvertFrom-Json
    if ($state.pid) {
      Stop-Process -Id ([int]$state.pid) -Force -ErrorAction SilentlyContinue
      $stopped += [int]$state.pid
    }
  } catch {
    Write-Warning "Could not parse state file at ${statePath}: $($_.Exception.Message)"
  }
}

if ($All -or $stopped.Count -eq 0) {
  $existing = Get-ThemeDevProcesses
  foreach ($proc in $existing) {
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
    $stopped += $proc.ProcessId
  }
}

$uniquePids = $stopped | Sort-Object -Unique
if ($uniquePids.Count -eq 0) {
  Write-Output 'No Shopify theme dev processes were running.'
} else {
  Write-Output ("Stopped Shopify theme dev process IDs: " + ($uniquePids -join ', '))
}
