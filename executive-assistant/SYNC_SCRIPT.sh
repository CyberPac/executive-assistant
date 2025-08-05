#!/bin/bash

# Personal Executive Assistant - Phase 2 Sync Script
# This script helps sync Phase 2 files to CyberPac/executive-assistant

echo "🚀 Personal Executive Assistant - Phase 2 Sync Script"
echo "=================================================="

# Check if target directory is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide the path to CyberPac/executive-assistant repository"
    echo "Usage: ./SYNC_SCRIPT.sh /path/to/CyberPac/executive-assistant"
    exit 1
fi

TARGET_DIR="$1"

# Verify target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Directory $TARGET_DIR does not exist"
    exit 1
fi

# Verify it's a git repository
if [ ! -d "$TARGET_DIR/.git" ]; then
    echo "❌ Error: $TARGET_DIR is not a git repository"
    exit 1
fi

echo "📂 Target directory: $TARGET_DIR"
echo "📋 Preparing to sync Phase 2 files..."

# Create backup branch
cd "$TARGET_DIR"
echo "💾 Creating backup branch..."
git checkout -b "backup-pre-phase2-$(date +%Y%m%d-%H%M%S)"
git push origin "backup-pre-phase2-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || echo "⚠️  Could not push backup branch (this is okay)"

# Switch back to main
git checkout main

# Create directories
echo "📁 Creating directory structure..."
mkdir -p agents/{cultural-intelligence,travel-logistics,financial-management,crisis-management}
mkdir -p src
mkdir -p tests

# Copy files from this codespace
CURRENT_DIR="$(dirname "$0")"

echo "📄 Copying Phase 2 files..."
cp "$CURRENT_DIR/src/index.ts" "$TARGET_DIR/src/"
cp "$CURRENT_DIR/agents/cultural-intelligence/index.ts" "$TARGET_DIR/agents/cultural-intelligence/"
cp "$CURRENT_DIR/agents/travel-logistics/index.ts" "$TARGET_DIR/agents/travel-logistics/"
cp "$CURRENT_DIR/agents/financial-management/index.ts" "$TARGET_DIR/agents/financial-management/"
cp "$CURRENT_DIR/agents/crisis-management/index.ts" "$TARGET_DIR/agents/crisis-management/"
cp "$CURRENT_DIR/package.json" "$TARGET_DIR/"
cp "$CURRENT_DIR/tsconfig.json" "$TARGET_DIR/"
cp "$CURRENT_DIR/README.md" "$TARGET_DIR/"
cp "$CURRENT_DIR/demo.ts" "$TARGET_DIR/"
cp "$CURRENT_DIR/DEPLOYMENT_GUIDE.md" "$TARGET_DIR/"

echo "📦 Installing dependencies..."
cd "$TARGET_DIR"
npm install

echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo "🧪 Running Phase 2 demo..."
npx tsx demo.ts 2>&1 | head -30

echo ""
echo "🎉 Phase 2 sync completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes: git status"
echo "2. Test the demo: npx tsx demo.ts"
echo "3. Commit changes: git add . && git commit -m 'Phase 2 complete'"
echo "4. Push to repository: git push origin main"
echo ""
echo "🚀 Ready for Phase 3: Production Hardening!"