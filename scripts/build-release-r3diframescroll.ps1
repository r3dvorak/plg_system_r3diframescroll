[CmdletBinding()]
param(
    [string]$ProjectRoot = '',
    [string]$ToolsRoot = 'D:\1DEV\_tools',
    [switch]$SkipVerify
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-CheckedScript {
    param(
        [string]$ScriptPath,
        [hashtable]$Arguments
    )

    if (-not (Test-Path -LiteralPath $ScriptPath -PathType Leaf)) {
        throw "Script not found: $ScriptPath"
    }

    & $ScriptPath @Arguments
    $exitCode = if (Get-Variable -Name LASTEXITCODE -Scope Global -ErrorAction SilentlyContinue) { $global:LASTEXITCODE } else { if ($?) { 0 } else { 1 } }
    if ($exitCode -ne 0) {
        throw "Script failed: $ScriptPath (ExitCode: $exitCode)"
    }
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Join-Path $scriptRoot '..'
}

$resolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$resolvedToolsRoot = (Resolve-Path -LiteralPath $ToolsRoot).Path

$buildScript = Join-Path $resolvedToolsRoot '04-build-extension.ps1'
$verifyScript = Join-Path $scriptRoot 'verify-extension-archive-paths.ps1'

Write-Host '[1/2] Build extension...' -ForegroundColor Cyan
Push-Location $resolvedProjectRoot
try {
    Invoke-CheckedScript -ScriptPath $buildScript -Arguments @{
        All = $true
    }
}
finally {
    Pop-Location
}

if (-not $SkipVerify) {
    Write-Host '[2/2] Verify ZIP archive...' -ForegroundColor Cyan
    Invoke-CheckedScript -ScriptPath $verifyScript -Arguments @{}
}
else {
    Write-Host 'ZIP verification skipped.' -ForegroundColor Yellow
}

Write-Host 'Build workflow finished.' -ForegroundColor Green
