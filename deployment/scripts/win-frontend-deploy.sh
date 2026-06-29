#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$REPO_DIR/frontend"
KEY_FILE="$REPO_DIR/deployment/keys/ssh-key-2026-04-14.key"

REMOTE_USER="ubuntu"
REMOTE_HOST="150.136.172.105"
REMOTE_FRONTEND_DIR="/home/ubuntu/coki-app/frontend"
REMOTE_DEPLOY_SCRIPT="/home/ubuntu/coki-app/deployment/scripts/frontend-deploy.sh"

echo "##### RUN WINDOWS FRONTEND DEPLOY SCRIPT #####"

echo "validate SSH key:"
test -f "$KEY_FILE"
chmod 600 "$KEY_FILE" || true

if command -v cygpath >/dev/null 2>&1 && command -v icacls.exe >/dev/null 2>&1; then
  KEY_FILE_WIN="$(cygpath -w "$KEY_FILE")"
  USER_WIN="${USERDOMAIN:-$COMPUTERNAME}\\${USERNAME:-$USER}"
  icacls.exe "$KEY_FILE_WIN" //inheritance:r >/dev/null
  icacls.exe "$KEY_FILE_WIN" //grant:r "$USER_WIN:(R)" >/dev/null
fi

echo "build FRONTEND locally:"
cd "$FRONTEND_DIR"
pnpm build

echo "upload FRONTEND dist:"
ssh -i "$KEY_FILE" "$REMOTE_USER@$REMOTE_HOST" "rm -rf '$REMOTE_FRONTEND_DIR/dist'"
scp -i "$KEY_FILE" -r "$FRONTEND_DIR/dist" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_FRONTEND_DIR/"

echo "run remote FRONTEND deploy:"
ssh -i "$KEY_FILE" "$REMOTE_USER@$REMOTE_HOST" "sudo bash '$REMOTE_DEPLOY_SCRIPT'"

echo "Done!"
