#!/usr/bin/env bash
set -euo pipefail

message="${1:-chore: auto commit changes}"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "No changes to commit."
  exit 0
fi

git add -A
git commit -m "$message"
