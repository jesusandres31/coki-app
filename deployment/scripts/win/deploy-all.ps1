param(
  [ValidateSet("FrontendFirst", "BackendFirst")]
  [string]$Order = "FrontendFirst",
  [string]$SshKeyPath = ".\ssh-key-2026-04-14.key",
  [string]$RemoteUser = "ubuntu",
  [string]$RemoteHost = "150.136.172.105",
  [string]$RemoteRepoDir = "/home/ubuntu/coki-app",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDeployScript = Join-Path $scriptDir "frontend-deploy.ps1"
$backendDeployScript = Join-Path $scriptDir "backend-deploy.ps1"

function Run-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )

  Write-Host ""
  Write-Host "##### $Name #####" -ForegroundColor Cyan
  & $Command
}

function Invoke-FrontendDeploy {
  Run-Step "Deploy frontend" {
    & $frontendDeployScript `
      -SshKeyPath $SshKeyPath `
      -RemoteUser $RemoteUser `
      -RemoteHost $RemoteHost `
      -RemoteRepoDir $RemoteRepoDir `
      -DryRun:$DryRun
  }
}

function Invoke-BackendDeploy {
  Run-Step "Deploy backend" {
    & $backendDeployScript `
      -SshKeyPath $SshKeyPath `
      -RemoteUser $RemoteUser `
      -RemoteHost $RemoteHost `
      -RemoteRepoDir $RemoteRepoDir `
      -DryRun:$DryRun
  }
}

if ($Order -eq "BackendFirst") {
  Invoke-BackendDeploy
  Invoke-FrontendDeploy
}
else {
  Invoke-FrontendDeploy
  Invoke-BackendDeploy
}
