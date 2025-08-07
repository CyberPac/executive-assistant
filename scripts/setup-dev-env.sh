#!/bin/bash
# Local Development Environment Setup Script
# Matches GitHub Actions CI environment exactly

set -e

echo "🔧 Setting up local development environment to match GitHub Actions CI..."

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm not found. Please install nvm first:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   Then restart your terminal and run this script again."
    exit 1
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and use Node.js 18 (matching CI)
echo "📦 Installing Node.js 18 (matching GitHub Actions CI)..."
nvm install 18
nvm use 18

# Verify versions
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clean install dependencies (same as CI)
echo "📥 Installing dependencies with npm ci (same as GitHub Actions)..."
npm ci

# Run same checks as CI
echo "🔍 Running type checking (same as CI)..."
npm run typecheck

echo "🧹 Running linting (same as CI)..."
npm run lint

echo "🏗️  Running build (same as CI)..."
npm run build

echo "🎉 Local environment now matches GitHub Actions CI!"
echo ""
echo "💡 To use this environment in the future:"
echo "   nvm use 18"
echo ""
echo "📋 Environment Summary:"
echo "   Node.js: $(node --version) (CI uses: 18)"
echo "   npm: $(npm --version)"
echo "   Working Directory: $(pwd)"