#!/usr/bin/env bash
set -euo pipefail

# Run from the mod directory regardless of where this is invoked from
cd "$(dirname "$0")"

# Read mod name and version from info.json
NAME=$(python3 -c "import json; print(json.load(open('info.json'))['name'])")
VERSION=$(python3 -c "import json; print(json.load(open('info.json'))['version'])")
PREFIX="${NAME}_${VERSION}"
OUTPUT="${PREFIX}.zip"

rm -f "$OUTPUT"

# Factorio expects the zip to contain a top-level folder named name_version
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT
mkdir "$tmpdir/$PREFIX"

# Copy every mod file. Unquoted * skips dotfiles, which is exactly the repo
# cruft (.git, .gitignore, .DS_Store, .busted); exclude the rest by name.
shopt -s nullglob
for f in *; do
    case "$f" in
        build.sh | tests | *.zip) continue ;;
    esac
    cp -R "$f" "$tmpdir/$PREFIX/"
done

(cd "$tmpdir" && zip -rq - "$PREFIX") > "$OUTPUT"

echo "Built $OUTPUT ($(du -h "$OUTPUT" | cut -f1 | tr -d ' '))"
