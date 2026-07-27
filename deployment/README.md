# Deployment

Deploy scripts assume the SSH key is available at the repo root as `ssh-key-2026-04-14.key`.

## Windows

```powershell
.\deployment\scripts\win\frontend-deploy.ps1
.\deployment\scripts\win\backend-deploy.ps1
.\deployment\scripts\win\deploy-all.ps1
```

`frontend-deploy.ps1` builds with `frontend/.env.prod` locally and copies `frontend/dist` to the server. Remote cleanup and publishing are handled by `deployment/scripts/linux/frontend-deploy.sh`.

`backend-deploy.ps1` runs the Linux backend deploy script on the server. The server script pulls `master` and restarts `cokiapp.pocketbase.service`.

## Server Setup

For a fresh Ubuntu server:

```sh
REPO_URL="https://github.com/jesusandres31/coki-app.git" bash deployment/scripts/linux/setup/first-deploy.sh
```

After DNS points to the server, run with certbot enabled:

```sh
RUN_CERTBOT=true bash deployment/scripts/linux/setup/first-deploy.sh
```

## Server

- App dir: `/home/ubuntu/coki-app`
- Web root: `/var/www/coki-app/dist`
- PocketBase service: `cokiapp.pocketbase.service`
- Public domain: `coki.ctes.dedyn.io`
- PocketBase admin/API domain: `admin-coki.ctes.dedyn.io`
