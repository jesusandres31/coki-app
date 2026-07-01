#!/usr/bin/env bash
set -euo pipefail

# NOTE: We only deploy the built dist directory to the web root because
# the frontend is built on Windows and transferred to the server with scp.

SRC="/home/ubuntu/coki-app/frontend/dist"
DST="/var/www/coki-app/dist"

echo "##### RUN FRONTEND DEPLOY SCRIPT #####"

test -d "$SRC/assets"

sudo rm -rf "$DST"
sudo cp -a "$SRC" "$DST"

sudo chown -R www-data:www-data /var/www/coki-app
sudo find /var/www/coki-app -type d -exec chmod 755 {} \;
sudo find /var/www/coki-app -type f -exec chmod 644 {} \;

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx