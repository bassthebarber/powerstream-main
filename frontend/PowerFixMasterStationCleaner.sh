#!/bin/bash

echo "🧹 PowerFix: Starting full TV station cleanup..."

# Official safe folders (only these should remain)
OFFICIAL_FOLDERS=(
  "./src/components/tv/stations/SouthernPowerNetwork"
  "./src/components/tv/stations/TexasGotTalent"
  "./src/components/tv/stations/NoLimitEastHouston"
  "./src/components/tv/stations/CivicConnect"
)

# Keywords to search for
KEYWORDS=("SouthernPower" "TexasGotTalent" "NoLimitEastHouston" "CivicConnect")

# Loop through each keyword and clean up duplicates
for keyword in "${KEYWORDS[@]}"; do
  echo "🔍 Scanning for $keyword duplicates..."
  FOUND=$(find . -type d -iname "*$keyword*" ! -path "${OFFICIAL_FOLDERS[0]}" ! -path "${OFFICIAL_FOLDERS[0]}/*" \
                                                       ! -path "${OFFICIAL_FOLDERS[1]}" ! -path "${OFFICIAL_FOLDERS[1]}/*" \
                                                       ! -path "${OFFICIAL_FOLDERS[2]}" ! -path "${OFFICIAL_FOLDERS[2]}/*" \
                                                       ! -path "${OFFICIAL_FOLDERS[3]}" ! -path "${OFFICIAL_FOLDERS[3]}/*")

  if [ -z "$FOUND" ]; then
    echo "✅ No duplicates found for $keyword."
  else
    echo "$FOUND" | while read -r folder; do
      echo "⚠️ Deleting duplicate: $folder"
      rm -rf "$folder"
    done
  fi
done

echo "✅ All duplicate station folders removed. Only official folders remain."
