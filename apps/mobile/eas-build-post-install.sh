#!/bin/bash
set -e

echo "Building @kanjiku/ui package..."
cd ../../packages/ui
npm run build
echo "@kanjiku/ui built successfully"
echo "Post-install hook completed"