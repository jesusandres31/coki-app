# Coki App

App with a Vite/React frontend and PocketBase backend.

## Frontend

```powershell
cd frontend
pnpm install
pnpm run dev
```

Env files:

- `frontend/.env.dev` is used by `pnpm run dev`.
- `frontend/.env.prod` is used by production builds.

## Deploy

From the repo root on Windows:

```powershell
.\deployment\scripts\win\deploy-all.ps1
```

Useful alternatives:

```powershell
.\deployment\scripts\win\frontend-deploy.ps1
.\deployment\scripts\win\backend-deploy.ps1
```

Test the deployment flow without building, copying files, or running remote commands:

```powershell
.\deployment\scripts\win\deploy-all.ps1 -DryRun
.\deployment\scripts\win\frontend-deploy.ps1 -DryRun
.\deployment\scripts\win\backend-deploy.ps1 -DryRun
```

Dry run mode prints the `pnpm`, `ssh`, and `scp` commands that would run. It also skips SSH key and build output checks so the scripts can be tested locally.

Frontend deploy builds with `.env.prod`, copies `frontend/dist` to the server, and publishes it with nginx. Backend deploy pulls `master` on the server and restarts PocketBase.
