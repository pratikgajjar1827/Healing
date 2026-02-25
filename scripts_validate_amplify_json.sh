#!/usr/bin/env bash
set -euo pipefail

bad=0
while IFS= read -r -d '' file; do
  if ! python -m json.tool "$file" >/dev/null 2>&1; then
    echo "Invalid JSON: $file"
    bad=1
  fi
done < <(find amplify -name '*.json' -print0)

if [ "$bad" -ne 0 ]; then
  exit 1
fi

echo "All Amplify JSON files are valid."
