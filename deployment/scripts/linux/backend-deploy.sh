#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="/home/ubuntu/coki-app"
SERVICE="cokiapp.pocketbase.service"

echo "##### RUN BACKEND DEPLOY SCRIPT #####"

echo "update repository:"
cd "$REPO_DIR"
git checkout master
git pull --ff-only

echo "restart BACKEND:"
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

echo "Done!"
