param(
  [string]$SshKeyPath = ".\deployment\keys\ssh-key-2026-04-14.key",
  [string]$RemoteUser = "ubuntu",
  [string]$RemoteHost = "150.136.172.105",
  [string]$RemoteRepoDir = "/home/ubuntu/coki-app",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Resolve-Path (Join-Path $scriptDir "..\..\..")
$frontendDir = Join-Path $repoDir "frontend"
$distPath = Join-Path $frontendDir "dist"
$resolvedSshKeyPath = if ([System.IO.Path]::IsPathRooted($SshKeyPath)) {
  $SshKeyPath
}
else {
  Join-Path $repoDir $SshKeyPath
}
$remote = "$RemoteUser@$RemoteHost"
$remoteFrontendDir = "$RemoteRepoDir/frontend"
$remoteDeployScript = "$RemoteRepoDir/deployment/scripts/linux/frontend-deploy.sh"

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

Run-Step "Build frontend with prod env" {
  if ($DryRun) {
    Write-DryRunCommand "Push-Location `"$frontendDir`"; pnpm run build:prod; Pop-Location"
  }
  else {
    Push-Location $frontendDir
    try {
      pnpm run build:prod
    }
    finally {
      Pop-Location
    }
  }
}

Run-Step "Copy dist to server" {
  if ((-not $DryRun) -and (-not (Test-Path (Join-Path $distPath "assets")))) {
    throw "Build output not found at $distPath"
  }

  if ($DryRun) {
    Write-DryRunCommand "ssh -i `"$resolvedSshKeyPath`" $remote `"bash '$remoteDeployScript' prepare-staging`""
    Write-DryRunCommand "scp -i `"$resolvedSshKeyPath`" -r `"$distPath`" `"${remote}:$remoteFrontendDir/`""
  }
  else {
    ssh -i $resolvedSshKeyPath $remote "bash '$remoteDeployScript' prepare-staging"
    scp -i $resolvedSshKeyPath -r $distPath "${remote}:$remoteFrontendDir/"
  }
}

Run-Step "Run server frontend deploy" {
  if ($DryRun) {
    Write-DryRunCommand "ssh -i `"$resolvedSshKeyPath`" $remote `"sudo bash '$remoteDeployScript' publish`""
  }
  else {
    ssh -i $resolvedSshKeyPath $remote "sudo bash '$remoteDeployScript' publish"
  }
}
