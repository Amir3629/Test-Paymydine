#!/bin/bash

echo "🔍 Scanning for hardcoded colors..."

# Count hardcoded hex colors in frontend components (excluding theme CSS files)
HARDCODED_COLORS=$(grep -r "#[0-9a-fA-F]\{3,8\}" frontend/app frontend/components --include="*.tsx" --include="*.ts" | grep -v "var(" | grep -v "frontend/public/themes" | wc -l)

if [ $HARDCODED_COLORS -gt 0 ]; then
  echo "❌ Found $HARDCODED_COLORS hardcoded colors:"
  grep -r "#[0-9a-fA-F]\{3,8\}" frontend/app frontend/components --include="*.tsx" --include="*.ts" | grep -v "var(" | grep -v "frontend/public/themes"
  exit 1
else
  echo "✅ No hardcoded colors found in components"
  exit 0
fi