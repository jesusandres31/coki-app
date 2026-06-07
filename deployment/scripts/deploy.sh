#!/bin/bash

echo "##### RUN DEPLOY SCRIPT #####" 

APP_NAME="coki-app"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# BACKEND
echo "stop BACKEND:" 
sudo systemctl disable cokiapp.pocketbase.service
sudo systemctl stop cokiapp.pocketbase.service

git checkout master
git branch
git pull 

# FRONTEND
echo "rebuild FRONTEND:"

cd  "$SCRIPT_DIR/../../frontend"

sudo pnpm i
sudo pnpm run build
sudo cp -r "$SCRIPT_DIR/../../frontend/dist" "/var/www/$APP_NAME"

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx

# BACKEND
echo "start BACKEND:"
sudo systemctl enable cokiapp.pocketbase.service
sudo systemctl start cokiapp.pocketbase.service

echo "Done!"