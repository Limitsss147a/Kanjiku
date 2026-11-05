#!/bin/bash
set -e

echo "Building @kanjiku/ui package..."
cd ../../packages/ui
npm run build
echo "@kanjiku/ui built successfully"

cd ../..
echo "Post-install hook completed"