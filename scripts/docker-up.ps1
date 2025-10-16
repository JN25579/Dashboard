<#
Runs docker-compose using a compose file and env file.
Defaults to Docker/docker.yml and Docker/.env.

Usage:
  .\scripts\docker-up.ps1
  .\scripts\docker-up.ps1 -ComposeFile Docker/docker.yml -EnvFile Docker/.env -Detach
#>

[CmdletBinding()]
param(
  [string]$ComposeFile = "Docker/docker.yml",
  [string]$EnvFile = "Docker/.env",
  [switch]$Detach,
  [switch]$CheckOnly
)

$mode = if ($Detach) { '-d' } else { '' }

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

Write-Host "Starting containers using '$ComposeFile' with env file '$EnvFile'..."

# Build an argument array to avoid quoting problems
$dockerCmd = 'docker-compose'
$args = @('-f', $ComposeFile, '--env-file', $EnvFile, 'up')
if ($Detach) { $args += '-d' }

Write-Host "Command: $dockerCmd $($args -join ' ')"

if ($CheckOnly) {
  Write-Host 'CheckOnly specified — not executing.' -ForegroundColor Cyan
  exit 0
}

# Execute
& $dockerCmd @args

if ($LASTEXITCODE -ne 0) {
  Write-Host "docker-compose reported an error (exit code $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host 'Containers started. Use scripts\docker-down.ps1 to stop them.' -ForegroundColor Green
