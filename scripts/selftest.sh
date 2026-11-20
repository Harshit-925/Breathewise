#!/bin/bash
set -e
echo "=== Lint ===" && npm run lint
echo "=== Type Check ===" && npm run typecheck
echo "=== Tests ===" && npm run test
echo "=== Build Client ===" && npm run build
echo "=== Build Server ===" && npm run build:server
echo "=== Generate Metadata ===" && npx tsx scripts/generate-metadata.ts
echo "=== All checks passed ==="
