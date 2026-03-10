param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,
  [string]$Label,
  [string]$Key
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-Slug {
  param([Parameter(Mandatory = $true)][string]$InputValue)
  $slug = $InputValue.ToLowerInvariant()
  $slug = $slug -replace '[^a-z0-9_-]+', '-'
  $slug = $slug -replace '(^-+|-+$)', ''
  return $slug
}

function To-TitleCaseLabel {
  param([Parameter(Mandatory = $true)][string]$InputValue)
  $spaced = ($InputValue -replace '[-_]+', ' ').Trim()
  if ([string]::IsNullOrWhiteSpace($spaced)) {
    return $InputValue
  }
  return [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($spaced)
}

$resolvedSourcePath = Resolve-Path -Path $SourcePath -ErrorAction Stop
$sourceFile = $resolvedSourcePath.Path

$allowedExtensions = @('.svg', '.png', '.jpg', '.jpeg', '.webp')
$extension = [System.IO.Path]::GetExtension($sourceFile).ToLowerInvariant()
if (-not $allowedExtensions.Contains($extension)) {
  throw "Unsupported icon format '$extension'. Allowed: $($allowedExtensions -join ', ')."
}

$baseName = if ($Key) { $Key } else { [System.IO.Path]::GetFileNameWithoutExtension($sourceFile) }
$slug = New-Slug -InputValue $baseName
if ([string]::IsNullOrWhiteSpace($slug)) {
  throw 'Could not derive a valid icon key. Use -Key with letters/numbers.'
}

$repoRoot = Resolve-Path -Path (Join-Path $PSScriptRoot '..')
$assetsDirectory = Join-Path $repoRoot 'assets'
$registryPath = Join-Path $assetsDirectory 'quickclip-icons.json'
$assetFileName = "quickclip-icon-$slug$extension"
$destinationPath = Join-Path $assetsDirectory $assetFileName

Copy-Item -Path $sourceFile -Destination $destinationPath -Force

$displayLabel = if ($Label) { $Label.Trim() } else { To-TitleCaseLabel -InputValue $slug }

$registryEntries = @()
if (Test-Path -Path $registryPath) {
  $rawJson = Get-Content -Path $registryPath -Raw
  if (-not [string]::IsNullOrWhiteSpace($rawJson)) {
    $parsed = $rawJson | ConvertFrom-Json
    if ($parsed -is [System.Collections.IEnumerable]) {
      $registryEntries = @($parsed)
    }
  }
}

$normalizedEntries = @()
foreach ($entry in $registryEntries) {
  if ($null -eq $entry) { continue }
  $value = New-Slug -InputValue ([string]$entry.value)
  if ([string]::IsNullOrWhiteSpace($value)) { continue }
  if ($value -eq $slug) { continue }
  $entryLabel = ([string]$entry.label).Trim()
  if ([string]::IsNullOrWhiteSpace($entryLabel)) {
    $entryLabel = To-TitleCaseLabel -InputValue $value
  }
  $entryAsset = ([string]$entry.asset).Trim()
  if ([string]::IsNullOrWhiteSpace($entryAsset)) { continue }
  $normalizedEntries += [PSCustomObject]@{
    value = $value
    label = $entryLabel
    asset = $entryAsset
  }
}

$normalizedEntries += [PSCustomObject]@{
  value = $slug
  label = $displayLabel
  asset = $assetFileName
}

$sortedEntries = $normalizedEntries | Sort-Object -Property label, value -Unique
$json = $sortedEntries | ConvertTo-Json -Depth 4
Set-Content -Path $registryPath -Value $json -Encoding UTF8

Write-Host "Added icon asset: $assetFileName"
Write-Host "Updated registry: $registryPath"
