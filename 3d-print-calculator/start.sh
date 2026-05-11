#!/bin/bash

# 3D Print Calculator Pro - Launcher Script
# This script starts the application in your default browser

echo "🖨️  Starting 3D Print Calculator Pro..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the 3d-print-calculator directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dist folder exists (production build)
if [ -d "dist" ]; then
    echo "✅ Production build found!"
    echo ""
    echo "To run the app, you have several options:"
    echo ""
    echo "1. Development mode (with hot reload):"
    echo "   npm run dev"
    echo ""
    echo "2. Preview production build:"
    echo "   npm run preview"
    echo ""
    echo "3. Open dist/index.html directly in your browser"
    echo ""
    echo "4. Package as Electron desktop app (requires additional setup)"
    echo ""
else
    echo "⚠️  No production build found. Running development server..."
    echo ""
    npm run dev
fi
