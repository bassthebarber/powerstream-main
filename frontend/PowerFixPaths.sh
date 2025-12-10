#!/bin/bash
echo "Fixing import paths..."
find ./src -type f -name "*.js" -o -name "*.jsx" | while read file; do
  sed -i 's|@/|./src/|g' "$file"
done
echo "✅ All import paths updated."
