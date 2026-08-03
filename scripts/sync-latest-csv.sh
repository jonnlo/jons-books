#!/usr/bin/env bash
#
# Picks the newest personal_library_catalog_*.csv from the CSV/ folder and copies
# it to catalog.csv in the repo root. The HTML app fetches catalog.csv at runtime,
# so this is the bridge between the CSV folder (source of truth) and the
# published site (catalog.csv).
#
# Runs locally (after you export a new CSV) and automatically in GitHub Actions
# on every push, so the published site always shows the latest library.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CSV_DIR="$REPO_ROOT/CSV"
OUT_FILE="$REPO_ROOT/catalog.csv"

# Newest catalog CSV by modification time (skips .DS_Store and other files).
# Note: filenames with spaces or parentheses (e.g. "...(1).csv") are handled
# correctly because the glob expands before ls, and cp uses quotes.
LATEST="$(ls -t "$CSV_DIR"/personal_library_catalog_*.csv 2>/dev/null | head -n 1)"

if [[ -z "$LATEST" ]]; then
  echo "ERROR: no CSV/personal_library_catalog_*.csv found in $CSV_DIR" >&2
  exit 1
fi

cp "$LATEST" "$OUT_FILE"
echo "Copied $(basename "$LATEST") -> catalog.csv"
