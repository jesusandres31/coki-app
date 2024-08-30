## start pocketbase

1 - open powershell

2 - exec `.\pocketbase-win.exe serve`

## credentials

- admin:

```
admin@admin.com
admpsswd.rsync
```

- test user:

```
test@test.com
usrpsswd.rsync
```

## migration

https://github.com/pocketbase/pocketbase/discussions/3963

```
./pocketbase-win migrate collections
./pocketbase-win migrate history-sync
```

## rclone for backups

```
sudo apt install rclone
rclone config
rclone copy /local/path gdrive:remote_path
```

## set cronjob

- open crontab

```
EDITOR=nano crontab -e
```

- set bkp every day at 3am

```
0 3 * * * /path/to/script/automate-db-dump.sh
```
