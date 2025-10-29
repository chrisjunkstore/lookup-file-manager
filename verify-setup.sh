#!/bin/bash

# Dynatrace Gen3 App - Setup Verification Script
# This script verifies that your environment is ready for development

echo "🔍 Dynatrace Gen3 Application - Setup Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "1️⃣  Checking Node.js version..."
if command -v node &> /dev/null
then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "   ${GREEN}✓${NC} Node.js version: $(node -v) (Required: v20+)"
    else
        echo -e "   ${RED}✗${NC} Node.js version: $(node -v) (Required: v20+)"
        echo -e "   ${YELLOW}⚠${NC}  Please upgrade to Node.js 20 or higher"
        exit 1
    fi
else
    echo -e "   ${RED}✗${NC} Node.js is not installed"
    echo -e "   ${YELLOW}⚠${NC}  Please install Node.js 20 or higher"
    exit 1
fi

echo ""

# Check npm
echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null
then
    echo -e "   ${GREEN}✓${NC} npm version: $(npm -v)"
else
    echo -e "   ${RED}✗${NC} npm is not installed"
    exit 1
fi

echo ""

# Check project structure
echo "3️⃣  Checking project structure..."
REQUIRED_FILES=(
    "app.config.json"
    "package.json"
    "tsconfig.json"
    "ui/app/App.tsx"
    "ui/app/index.tsx"
    "src/functions/query-grail.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file (missing)"
    fi
done

echo ""

# Check app.config.json for environment URL
echo "4️⃣  Checking configuration..."
if grep -q "YOUR-ENVIRONMENT-ID" app.config.json; then
    echo -e "   ${YELLOW}⚠${NC}  Environment URL not configured"
    echo "   Please update 'environmentUrl' in app.config.json"
else
    echo -e "   ${GREEN}✓${NC} Environment URL configured"
fi

echo ""

# Check if node_modules exists
echo "5️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} Dependencies installed"
else
    echo -e "   ${YELLOW}⚠${NC}  Dependencies not installed"
    echo "   Run: npm install"
fi

echo ""

# Check available ports
echo "6️⃣  Checking port availability..."
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "   ${GREEN}✓${NC} Port 3000 is available"
else
    echo -e "   ${YELLOW}⚠${NC}  Port 3000 is in use"
    echo "   You may need to change the port in app.config.json"
fi

echo ""
echo "=================================================="
echo ""

# Summary
if [ "$NODE_VERSION" -ge 20 ] && [ -f "app.config.json" ]; then
    echo -e "${GREEN}✅ Your environment is ready for development!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update environment URL in app.config.json"
    echo "2. Run: npm install"
    echo "3. Run: npm run dev"
    echo ""
    echo "📚 Read QUICKSTART.md for detailed instructions"
else
    echo -e "${RED}❌ Please fix the issues above before proceeding${NC}"
    exit 1
fi
