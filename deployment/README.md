## Scripts:

```
sh deploy.sh
```

## Util commands:

### node:

- v20.11.1

npm install -g pnpm

### nginx:

```
sudo nano /etc/nginx/conf.d/coki.ctes.dedyn.io.conf
sudo nano /etc/nginx/conf.d/admin-coki.ctes.dedyn.io.conf

sudo cp -r /home/ubuntu/coki-app/frontend/dist /var/www/coki-app/dist

sudo chown -R www-data:www-data /var/www/coki-app
sudo find /var/www/coki-app -type d -exec chmod 755 {} \;
sudo find /var/www/coki-app -type f -exec chmod 644 {} \;

sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx

sudo tail -n 50 /var/log/nginx/error.log
sudo tail -n 50 /var/log/nginx/access.log
```

sudo service nginx reload

- uncomment line: `# include /etc/nginx/default.d/*.conf;`

### certbot:

```
sudo certbot --nginx -d coki.ctes.dedyn.io
sudo certbot --nginx -d admin-coki.ctes.dedyn.io
```

### pocketbase

https://pocketbase.io/docs/going-to-production/

sudo nano /lib/systemd/system/cokiapp.pocketbase.service

chmod +x pocketbase

```
sudo systemctl enable cokiapp.pocketbase.service
sudo systemctl start cokiapp.pocketbase
sudo systemctl status cokiapp.pocketbase
```

---

scp -i ".\ssh-key-2026-04-14.key" -r "C:\Users\jesus\projects\mine\coki-app\frontend\dist" ubuntu@150.136.172.105:/home/ubuntu/coki-app/frontend/
scp -i ".\ssh-key-2026-04-14.key" -r "C:\Users\jesus\projects\mine\coki-app\backend\pb_data" ubuntu@150.136.172.105:/home/ubuntu/coki-app/backend/
