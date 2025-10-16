<#
Stops and removes containers created by the compose file.
Defaults to Docker/docker.yml and Docker/.env.

Usage:
  .\scripts\docker-down.ps1
  .\scripts\docker-down.ps1 -ComposeFile Docker/docker.yml -EnvFile Docker/.env -RemoveVolumes
#>

[CmdletBinding()]
param(
    [string]$ComposeFile = "Docker/docker.yml",
    [string]$EnvFile = "Docker/.env",
    [switch]$RemoveVolumes,
    [switch]$CheckOnly
)

$volFlag = if ($RemoveVolumes) { '--volumes' } else { '' }

# Validate docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
  Write-Host "docker-compose is not found on PATH. Please install Docker Compose or ensure it's available." -ForegroundColor Red
  exit 2
}

# Validate files exist
if (-not (Test-Path $ComposeFile)) {
  Write-Host "Compose file not found: $ComposeFile" -ForegroundColor Red
  exit 2
}
if (-not (Test-Path $EnvFile)) {
  Write-Host "Env file not found: $EnvFile" -ForegroundColor Yellow
  Write-Host "Proceeding, docker-compose may still read environment variables from the shell." -ForegroundColor Yellow
}

Write-Host "Stopping containers defined in '$ComposeFile'..."
Write-Host "Stopping containers defined in '$ComposeFile'..."

# Build argument array
$dockerCmd = 'docker-compose'
$args = @('-f', $ComposeFile, '--env-file', $EnvFile, 'down')
if ($RemoveVolumes) { $args += '--volumes' }

Write-Host "Command: $dockerCmd $($args -join ' ')"

if ($CheckOnly) {
  Write-Host 'CheckOnly specified — not executing.' -ForegroundColor Cyan
  exit 0
}

& $dockerCmd @args

if ($LASTEXITCODE -ne 0) {
    Write-Host "docker-compose reported an error (exit code $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host 'Containers stopped and removed.' -ForegroundColor Green
