#!/bin/bash

echo "🧹 PowerFix: Starting Southern Power folder cleanup..."

# Define official path (adjust if your root is different)
OFFICIAL_PATH="./src/components/tv/stations/SouthernPowerNetwork"

# Find all matching folders with 'SouthernPower' in the name
FOUND_FOLDERS=$(find . -type d -iname "*southernpower*" ! -path "$OFFICIAL_PATH" ! -path "$OFFICIAL_PATH/*")

# Delete duplicates
if [ -z "$FOUND_FOLDERS" ]; then
  echo "✅ No duplicate folders found."
else
  echo "$FOUND_FOLDERS" | while read -r folder; do
    echo "⚠️ Deleting duplicate folder: $folder"
    rm -rf "$folder"
  done
  echo "✅ Cleanup complete. Only the official SouthernPowerNetwork folder remains."
fi
