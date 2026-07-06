[CmdletBinding()]
param(
    [string]$ProjectRoot = '',
    [string]$ToolsRoot = 'D:\1DEV\_tools',
    [string]$EnvFile = '',
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Resolve-EnvFile {
    param([string]$Root, [string]$ExplicitEnvFile)

    if (-not [string]::IsNullOrWhiteSpace($ExplicitEnvFile)) {
        return (Resolve-Path -LiteralPath $ExplicitEnvFile).Path
    }

    $localEnv = Join-Path $Root '.env'
    if (Test-Path -LiteralPath $localEnv -PathType Leaf) {
        return (Resolve-Path -LiteralPath $localEnv).Path
    }

    return 'D:\1DEV\_tools\.env'
}

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

function Invoke-HttpCheck {
    param(
        [string]$Url,
        [string]$Label
    )

    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    Write-Host "[$Label] $Url -> HTTP $($response.StatusCode)" -ForegroundColor Green
}

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Join-Path $scriptRoot '..'
}

$resolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$resolvedToolsRoot = (Resolve-Path -LiteralPath $ToolsRoot).Path
$resolvedEnvPath = Resolve-EnvFile -Root $resolvedProjectRoot -ExplicitEnvFile $EnvFile

$createDownloadScript = Join-Path $resolvedToolsRoot '31-create-download.ps1'
$publishUpdateScript = Join-Path $resolvedToolsRoot '32-publish-updateserver.ps1'
$projectJsonPath = Join-Path $resolvedProjectRoot 'project.json'

if (-not (Test-Path -LiteralPath $projectJsonPath -PathType Leaf)) {
    throw "project.json missing: $projectJsonPath"
}

$project = Get-Content -LiteralPath $projectJsonPath -Raw | ConvertFrom-Json
$updateUrl = [string]$project.project.updateServerUrl
if ([string]::IsNullOrWhiteSpace($updateUrl)) {
    [xml]$manifest = Get-Content -LiteralPath (Join-Path $resolvedProjectRoot '01_src\plg_system_r3diframescroll\r3diframescroll.xml') -Raw
    $updateUrl = [string]$manifest.extension.updateservers.server
}
$updateUrl = $updateUrl.Trim()

Write-Host '[1/3] Create Phoca release plan and upload ZIP...' -ForegroundColor Cyan
$createArgs = @{
    ProjectRoot = $resolvedProjectRoot
    EnvFile = $resolvedEnvPath
}
if ($DryRun) {
    $createArgs['DryRun'] = $true
}
Invoke-CheckedScript -ScriptPath $createDownloadScript -Arguments $createArgs

Write-Host '[2/3] Publish update XML...' -ForegroundColor Cyan
$updateArgs = @{
    ProjectRoot = $resolvedProjectRoot
    EnvFile = $resolvedEnvPath
}
if ($DryRun) {
    $updateArgs['DryRun'] = $true
}
Invoke-CheckedScript -ScriptPath $publishUpdateScript -Arguments $updateArgs

if (-not $DryRun) {
    $version = [string]$project.project.defaults.version
    $artifactName = [string]$project.project.artifactBaseName + '-' + $version + '.zip'
    $downloadUrl = [string]$project.project.updateServerUrl
    if ([string]::IsNullOrWhiteSpace($downloadUrl)) {
        $downloadUrl = 'https://extensions.r3d.de/phocadownload/' + $artifactName
    }
    else {
        $downloadUrl = 'https://extensions.r3d.de/phocadownload/' + $artifactName
    }

    Write-Host '[3/3] HTTP checks...' -ForegroundColor Cyan
    Invoke-HttpCheck -Url $downloadUrl -Label 'ZIP'
    Invoke-HttpCheck -Url $updateUrl -Label 'Update XML'
}
else {
    Write-Host 'DryRun active: HTTP checks skipped.' -ForegroundColor Yellow
}

Write-Host 'Publish workflow finished.' -ForegroundColor Green
