#!/usr/bin/env bash
set -euo pipefail

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "Generating fresh ts-rs bindings into $TEMP_DIR..."
cd src-tauri
TS_RS_EXPORT_DIR="$TEMP_DIR" cargo test --quiet 2>/dev/null

GENERATED_DIR="../src/schema/generated"

if [ ! -d "$GENERATED_DIR" ]; then
  echo "ERROR: $GENERATED_DIR does not exist. Run 'pnpm generate:schema' first."
  exit 1
fi

echo "Comparing generated types..."
DIFF=$(diff -rq "$GENERATED_DIR" "$TEMP_DIR" 2>&1 || true)

if [ -n "$DIFF" ]; then
  echo "ERROR: Generated TypeScript types are out of sync with Rust source."
  echo ""
  echo "$DIFF"
  echo ""
  echo "Run 'pnpm generate:schema' and commit the updated files."
  exit 1
fi

echo "Schema types are in sync."
