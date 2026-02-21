#!/bin/bash

# OpenClaw Mission Control - Deployment Script

set -e

echo "🚀 OpenClaw Mission Control - Deployment"
echo "=========================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. Please install it or create the repo manually."
    echo ""
    echo "Option 1: Install GitHub CLI"
    echo "  Visit: https://cli.github.com/"
    echo ""
    echo "Option 2: Create repo manually"
    echo "  1. Go to: https://github.com/new"
    echo "  2. Name: openclaw-mission-control"
    echo "  3. Create repository (DO NOT initialize with README)"
    echo "  4. Run: git remote add origin https://github.com/YOUR_USERNAME/openclaw-mission-control.git"
    echo "  5. Run: git push -u origin main"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub CLI:"
    gh auth login
fi

echo "📦 Creating GitHub repository..."

# Create the repository
gh repo create openclaw-mission-control \
    --public \
    --source=. \
    --description="Real-time dashboard for monitoring and controlling OpenClaw AI agents" \
    --remote=origin

echo ""
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Repository created and pushed successfully!"
echo ""
echo "🔗 Your repository: $(gh repo view --json url -q .url)"
echo ""
echo "📋 Next steps:"
echo "  1. Set up Convex: npx convex dev"
echo "  2. Copy .env.local.example to .env.local and add your Convex URL"
echo "  3. Seed sample data: npx convex run seed:seedAll"
echo "  4. Start dev server: npm run dev"
echo ""
echo "🎉 Happy building!"
