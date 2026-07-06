[CmdletBinding()]
param(
    [string]$PackagePath = ""
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ZipEntries {
    param([Parameter(Mandatory = $true)][string]$ZipPath)

    $archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        return @($archive.Entries | ForEach-Object { $_.FullName })
    }
    finally {
        $archive.Dispose()
    }
}

function Assert-NoBackslashEntries {
    param(
        [Parameter(Mandatory = $true)][string]$ZipPath,
        [Parameter(Mandatory = $true)][string[]]$Entries
    )

    $badEntries = @($Entries | Where-Object { $_ -match '\\' })
    if ($badEntries.Count -gt 0) {
        Write-Host "BAD_BACKSLASH_PATHS in $ZipPath" -ForegroundColor Red
        $badEntries | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        throw "Archive contains Windows path separators: $ZipPath"
    }

    Write-Host "OK_NO_BACKSLASH_PATHS $ZipPath ($($Entries.Count) entries)" -ForegroundColor Green
}

function Assert-RequiredEntries {
    param(
        [Parameter(Mandatory = $true)][string]$ZipPath,
        [Parameter(Mandatory = $true)][string[]]$Entries
    )

    $required = @(
        'r3diframescroll.php',
        'r3diframescroll.xml',
        'media/joomla.asset.json',
        'media/js/r3diframescroll.js',
        'language/en-GB/en-GB.plg_system_r3diframescroll.ini',
        'language/en-GB/en-GB.plg_system_r3diframescroll.sys.ini',
        'language/de-DE/de-DE.plg_system_r3diframescroll.ini',
        'language/de-DE/de-DE.plg_system_r3diframescroll.sys.ini'
    )

    foreach ($entry in $required) {
        if ($Entries -notcontains $entry) {
            throw ("Missing required archive entry in {0}: {1}" -f $ZipPath, $entry)
        }
    }

    Write-Host "OK_REQUIRED_ENTRIES $ZipPath" -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($PackagePath)) {
    $distDir = Join-Path $PSScriptRoot '..\04_dist'
    $resolvedDist = Resolve-Path $distDir
    $latest = Get-ChildItem -Path $resolvedDist -Filter 'plg_system_r3diframescroll-*.zip' -File |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1

    if ($null -eq $latest) {
        throw 'No plugin ZIP found under 04_dist.'
    }

    $PackagePath = $latest.FullName
}
else {
    $PackagePath = (Resolve-Path $PackagePath).Path
}

if (-not (Test-Path -LiteralPath $PackagePath)) {
    throw "Package not found: $PackagePath"
}

$entries = Get-ZipEntries -ZipPath $PackagePath
Assert-NoBackslashEntries -ZipPath $PackagePath -Entries $entries
Assert-RequiredEntries -ZipPath $PackagePath -Entries $entries

Write-Host 'PLUGIN_ARCHIVE_PATH_VERIFICATION_OK' -ForegroundColor Green
