#!/bin/bash 
 
# current script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# run the backup script
"$SCRIPT_DIR/db-dump.sh"

# get the current date in format YYYYMMDD
DATE=$(date +'%Y%m%d')

# source and destination directory
SOURCE_DIR="$SCRIPT_DIR/../pb_data"
BACKUP_DIR="$SCRIPT_DIR/../backup"
BACKUP_FILE="$BACKUP_DIR/data.$DATE.db"
COMPRESSED_BKP_FILE="$BACKUP_DIR/data.$DATE.db.tar.gz" 
REMOTE_NAME=gdrive # Replace with your rclone remote name
DRIVE_PATH= # Replace with the path in your Google Drive where you want to store the backup
REMOTE_BKP_PATH="$REMOTE_NAME:$DRIVE_PATH"

echo "Uploading to Google Drive..."
# use rclone to copy the compressed backup to Google Drive
rclone copy "$COMPRESSED_BKP_FILE" "$REMOTE_BKP_PATH"

# Check the number of files in the backup folder
echo "Checking number of files in the backup folder..."
FILE_COUNT=$(rclone ls "$REMOTE_BKP_PATH" | wc -l)

If there are more than 10 files, delete the oldest one
if [ $FILE_COUNT -gt 10 ]; then
  echo "More than 10 files found. Deleting the oldest one..."
  OLDEST_FILE=$(rclone ls "$REMOTE_BKP_PATH" | sort -k 1,1n | head -n 1 | awk '{print $NF}')
  rclone delete "$REMOTE_BKP_PATH/$OLDEST_FILE"
fi

# remove temp files
echo "Removing temp files..." 
rm "$COMPRESSED_BKP_FILE"

echo "Done!"