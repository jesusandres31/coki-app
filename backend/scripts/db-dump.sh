#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the current date in format YYYYMMDD
DATE=$(date +'%Y%m%d') 

# Directories
SOURCE_DIR="$SCRIPT_DIR/../pb_data"
BACKUP_DIR="$SCRIPT_DIR/../backup"
BACKUP_FILE="data.$DATE.db"
COMPRESSED_BKP_FILE="data.$DATE.db.tar.gz" 

# Create the destination directory if it does not exist
mkdir -p "$BACKUP_DIR"

# Path to the database file
DB_FILE="$SOURCE_DIR/data.db"

# Check if the database file exists
if [ -f "$DB_FILE" ]; then
    # Copy the database file to the destination directory
    cd "$SOURCE_DIR"
    cp "data.db" "$BACKUP_DIR/$BACKUP_FILE"
    
    # Change to the backup directory and compress
    cd "$BACKUP_DIR"
    echo "Compressing file..."
    tar -czvf "$COMPRESSED_BKP_FILE" "$BACKUP_FILE"
    
    # Remove the uncompressed backup file
    rm -rf "$BACKUP_FILE"
    echo "Backup completed: $DB_FILE copied to $BACKUP_DIR/"
else
    echo "Error: Database file '$DB_FILE' does not exist."
    exit 1
fi
