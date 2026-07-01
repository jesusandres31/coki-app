#!/usr/bin/env bash
set -Eeuo pipefail

# First server setup example.
#
# Run this on a fresh Ubuntu server as the deploy user, not as root:
#   REPO_URL="https://github.com/<user>/<repo>.git" bash first-deploy.sh
#
# Optional:
#   RUN_CERTBOT=true bash first-deploy.sh
#
# For a new project, update the variables below plus the files in deployment/nginx.

APP_NAME="${APP_NAME:-coki-app}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
DEPLOY_GROUP="${DEPLOY_GROUP:-ubuntu}"
REPO_URL="${REPO_URL:-https://github.com/jesusandres31/coki-app.git}"
REPO_BRANCH="${REPO_BRANCH:-master}"
REPO_DIR="${REPO_DIR:-/home/$DEPLOY_USER/$APP_NAME}"

FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"
PB_BINARY="$BACKEND_DIR/pocketbase"
WEB_ROOT="/var/www/$APP_NAME"
WEB_DIST="$WEB_ROOT/dist"

SERVICE_NAME="${SERVICE_NAME:-cokiapp.pocketbase.service}"
PB_PORT="${PB_PORT:-8091}"
NODE_VERSION="${NODE_VERSION:-20.11.1}"

PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-coki.ctes.dedyn.io}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin-coki.ctes.dedyn.io}"
RUN_CERTBOT="${RUN_CERTBOT:-false}"

NGINX_AVAILABLE_DIR="/etc/nginx/conf.d"
PUBLIC_NGINX_CONF="$REPO_DIR/deployment/nginx/$PUBLIC_DOMAIN.conf"
ADMIN_NGINX_CONF="$REPO_DIR/deployment/nginx/$ADMIN_DOMAIN.conf"

if [ "$(id -u)" -eq 0 ]; then
  echo "Run this script as $DEPLOY_USER or another sudo-enabled deploy user, not as root."
  exit 1
fi

echo "##### RUN FIRST DEPLOY SETUP SCRIPT #####"

echo "install system packages:"
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  certbot \
  curl \
  git \
  nginx \
  python3-certbot-nginx \
  unzip

echo "install Node.js $NODE_VERSION with nvm:"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install "$NODE_VERSION"
nvm alias default "$NODE_VERSION"
nvm use "$NODE_VERSION"

echo "enable pnpm:"
corepack enable
corepack prepare pnpm@latest --activate

echo "prepare repository:"
if [ -d "$REPO_DIR/.git" ]; then
  cd "$REPO_DIR"
  git fetch origin "$REPO_BRANCH"
  git checkout "$REPO_BRANCH"
  git pull --ff-only origin "$REPO_BRANCH"
else
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

echo "prepare PocketBase binary:"
test -f "$PB_BINARY"
chmod +x "$PB_BINARY"

echo "install PocketBase systemd service:"
sudo tee "/lib/systemd/system/$SERVICE_NAME" >/dev/null <<SERVICE
[Unit]
Description = pocketbase

[Service]
Type           = simple
User           = $DEPLOY_USER
Group          = $DEPLOY_GROUP
LimitNOFILE    = 4096
Restart        = always
RestartSec     = 5s
StandardOutput = append:$BACKEND_DIR/errors.log
StandardError  = append:$BACKEND_DIR/errors.log
ExecStart      = $PB_BINARY serve --http=127.0.0.1:$PB_PORT

[Install]
WantedBy = multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"

echo "build frontend:"
cd "$FRONTEND_DIR"
pnpm install --frozen-lockfile
pnpm run build

echo "deploy frontend files:"
sudo mkdir -p "$WEB_ROOT"
sudo rm -rf "$WEB_DIST"
sudo cp -a "$FRONTEND_DIR/dist" "$WEB_DIST"
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo find "$WEB_ROOT" -type d -exec chmod 755 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;

echo "install nginx configs:"
test -f "$PUBLIC_NGINX_CONF"
test -f "$ADMIN_NGINX_CONF"
sudo cp "$PUBLIC_NGINX_CONF" "$NGINX_AVAILABLE_DIR/"
sudo cp "$ADMIN_NGINX_CONF" "$NGINX_AVAILABLE_DIR/"

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "start PocketBase:"
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager

echo "verify PocketBase port:"
for attempt in {1..10}; do
  if ss -ltnp | grep -q ":$PB_PORT"; then
    ss -ltnp | grep ":$PB_PORT"
    break
  fi

  if [ "$attempt" -eq 10 ]; then
    echo "PocketBase did not open port $PB_PORT after 10 attempts."
    sudo systemctl status "$SERVICE_NAME" --no-pager
    exit 1
  fi

  sleep 1
done

if [ "$RUN_CERTBOT" = "true" ]; then
  echo "request SSL certificates:"
  sudo certbot --nginx -d "$PUBLIC_DOMAIN"
  sudo certbot --nginx -d "$ADMIN_DOMAIN"
  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "skip certbot. Run later with RUN_CERTBOT=true after DNS points at this server."
fi

echo "final service status:"
sudo systemctl status nginx --no-pager
sudo systemctl status "$SERVICE_NAME" --no-pager

echo "Done!"
