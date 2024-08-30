#!/bin/bash

# get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# source and destination directories
SOURCE_DIR="$SCRIPT_DIR/../backup"
DEST_DIR="$SCRIPT_DIR/../pb_data"
TEMP_DIR="$SCRIPT_DIR/../temp_restore"

# create temporary directory for restoring if it does not exist
mkdir -p "$TEMP_DIR"

# find the most recent backup file
LATEST_BACKUP=$(ls -t "$SOURCE_DIR"/data.*.db.tar.gz | head -n 1)

if [ -f "$LATEST_BACKUP" ]; then
    echo "Restoring from backup file: $LATEST_BACKUP"
    
    # extract the backup file to temporary directory
    tar xvf "$LATEST_BACKUP" -C "$TEMP_DIR"
    
    # find the extracted database file
    EXTRACTED_DB=$(find "$TEMP_DIR" -name 'data.*.db' | head -n 1)
    
    if [ -f "$EXTRACTED_DB" ]; then
        # move the extracted database file to the destination directory
        mv "$EXTRACTED_DB" "$DEST_DIR/data.db"
        echo "Database restored to $DEST_DIR/data.db"
    else
        echo "Error: No database file found after extraction."
        exit 1
    fi
    
    # clean up temporary directory
    rm -rf "$TEMP_DIR"
else
    echo "Error: No backup file found in $SOURCE_DIR."
    exit 1
fi
