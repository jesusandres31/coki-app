#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/home/ubuntu/coki-app"
BACKEND_DIR="$REPO_DIR/backend"
PB_BINARY="$BACKEND_DIR/pocketbase"
SERVICE="cokiapp.pocketbase.service"
PB_PORT="8091"

echo "##### RUN BACKEND DEPLOY SCRIPT #####"

echo "update repository:"
cd "$REPO_DIR"
git checkout master
git pull --ff-only

echo "prepare BACKEND binary:"
chmod +x "$PB_BINARY"

echo "restart BACKEND:"
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

echo "verify BACKEND port:"
for attempt in {1..10}; do
  if ss -ltnp | grep -q ":$PB_PORT"; then
    ss -ltnp | grep ":$PB_PORT"
    break
  fi

  if [ "$attempt" -eq 10 ]; then
    echo "PocketBase did not open port $PB_PORT after 10 attempts."
    sudo systemctl status "$SERVICE" --no-pager
    exit 1
  fi

  sleep 1
done

echo "Done!"
