param(
  [string]$SshKeyPath = ".\ssh-key-2026-04-14.key",
  [string]$RemoteUser = "ubuntu",
  [string]$RemoteHost = "150.136.172.105",
  [string]$RemoteRepoDir = "/home/ubuntu/coki-app"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Resolve-Path (Join-Path $scriptDir "..\..\..")
$resolvedSshKeyPath = if ([System.IO.Path]::IsPathRooted($SshKeyPath)) {
  $SshKeyPath
}
else {
  Join-Path $repoDir $SshKeyPath
}
$remote = "$RemoteUser@$RemoteHost"
$remoteDeployScript = "$RemoteRepoDir/deployment/scripts/linux/backend-deploy.sh"

function Run-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )

  Write-Host ""
  Write-Host "##### $Name #####" -ForegroundColor Cyan
  & $Command
}

if (-not (Test-Path $resolvedSshKeyPath)) {
  throw "SSH key not found at $resolvedSshKeyPath"
}

Run-Step "Run server backend deploy" {
  ssh -i $resolvedSshKeyPath $remote "sudo bash '$remoteDeployScript'"
}
