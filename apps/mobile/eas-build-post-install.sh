#!/bin/bash
set -e

echo "Building @kanjiku/ui package..."
cd ../..
pnpm --filter @kanjiku/ui run build
echo "@kanjiku/ui built successfully"
echo "Post-install hook completed"