param(
  [string]$SshKeyPath = ".\ssh-key-2026-04-14.key",
  [string]$RemoteUser = "ubuntu",
  [string]$RemoteHost = "150.136.172.105",
  [string]$RemoteRepoDir = "/home/ubuntu/coki-app",
  [switch]$DryRun
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

function Write-DryRunCommand {
  param(
    [Parameter(Mandatory = $true)][string]$Command
  )

  Write-Host "[DRY RUN] $Command" -ForegroundColor Yellow
}

if ((-not $DryRun) -and (-not (Test-Path $resolvedSshKeyPath))) {
  throw "SSH key not found at $resolvedSshKeyPath"
}

Run-Step "Run server backend deploy" {
  if ($DryRun) {
    Write-DryRunCommand "ssh -i `"$resolvedSshKeyPath`" $remote `"sudo bash '$remoteDeployScript'`""
  }
  else {
    ssh -i $resolvedSshKeyPath $remote "sudo bash '$remoteDeployScript'"
  }
}
