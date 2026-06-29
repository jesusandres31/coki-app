#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="coki-app"
REPO_DIR="/home/ubuntu/coki-app"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"
WEB_DIST="/var/www/$APP_NAME/dist"
SERVICE="cokiapp.pocketbase.service"
PB_PORT="8091"

echo "##### RUN DEPLOY SCRIPT #####"

echo "stop BACKEND:"
sudo systemctl stop "$SERVICE" || true

echo "update repository:"
cd "$REPO_DIR"
git checkout master
git pull --ff-only

echo "prepare BACKEND binary:"
chmod +x "$BACKEND_DIR/pocketbase-linux"

echo "rebuild FRONTEND:"
cd "$FRONTEND_DIR"
pnpm i
pnpm run build

echo "deploy FRONTEND:"
sudo rm -rf "$WEB_DIST"
sudo cp -a "$FRONTEND_DIR/dist" "$WEB_DIST"

sudo chown -R www-data:www-data "/var/www/$APP_NAME"
sudo find "/var/www/$APP_NAME" -type d -exec chmod 755 {} \;
sudo find "/var/www/$APP_NAME" -type f -exec chmod 644 {} \;

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager

echo "start BACKEND:"
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
