#!/usr/bin/env bash
set -euo pipefail

SRC="/home/ubuntu/coki-app/frontend/dist"
DST="/var/www/coki-app/dist"

test -d "$SRC/assets"

sudo rm -rf "$DST"
sudo cp -a "$SRC" "$DST"

sudo chown -R www-data:www-data /var/www/coki-app
sudo find /var/www/coki-app -type d -exec chmod 755 {} \;
sudo find /var/www/coki-app -type f -exec chmod 644 {} \;

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx