#!/bin/bash
set -e

echo "Building @kanjiku/ui package..."

# Find repo root (where pnpm-workspace.yaml exists)
REPO_ROOT="$(pwd)"
while [ "$REPO_ROOT" != "/" ] && [ ! -f "$REPO_ROOT/pnpm-workspace.yaml" ]; do
    REPO_ROOT="$(dirname "$REPO_ROOT")"
done

if [ ! -f "$REPO_ROOT/packages/ui/package.json" ]; then
    echo "ERROR: Could not find packages/ui from $REPO_ROOT"
    exit 1
fi

cd "$REPO_ROOT/packages/ui"
npm run build
echo "@kanjiku/ui built successfully"

echo "Post-install hook completed"