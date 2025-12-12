#!/bin/bash

echo "Ì∫Ä Setting up FAITH development environment..."
echo "================================================"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "‚ùå Node.js 20+ required. Current: $(node -v)"
    echo "Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "‚úÖ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "‚ùå npm not found. Please install Node.js"
    exit 1
fi

echo "‚úÖ npm $(npm -v) detected"
echo ""

# Install dependencies at root
echo "Ì≥¶ Installing root dependencies..."
npm install
echo ""

# Create .env files if they don't exist
echo "Ì¥ê Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "‚úÖ Created .env at root"
fi

if [ ! -f packages/backend/.env ]; then
    if [ -f packages/backend/.env.example ]; then
        cp packages/backend/.env.example packages/backend/.env
        echo "‚úÖ Created packages/backend/.env"
    fi
fi

if [ ! -f apps/web/.env.local ]; then
    if [ -f apps/web/.env.example ]; then
        cp apps/web/.env.example apps/web/.env.local
        echo "‚úÖ Created apps/web/.env.local"
    fi
fi

if [ ! -f apps/mobile/.env ]; then
    if [ -f apps/mobile/.env.example ]; then
        cp apps/mobile/.env.example apps/mobile/.env
        echo "‚úÖ Created apps/mobile/.env"
    fi
fi

echo ""
echo "‚úÖ Development environment ready!"
echo ""
echo "================================================"
echo "Ì≥ã Next steps:"
echo "================================================"
echo "1. Update .env files with your configuration:"
echo "   - packages/backend/.env"
echo "   - apps/web/.env.local"
echo "   - apps/mobile/.env"
echo ""
echo "2. Start development:"
echo "   npm run dev              # Start all services"
echo "   npm run dev:backend      # Backend only"
echo "   npm run dev:web          # Web dashboard only"
echo "   npm run dev:mobile       # Mobile app only"
echo ""
echo "3. Check individual README.md files in:"
echo "   - apps/mobile/README.md"
echo "   - apps/web/README.md"
echo "   - packages/backend/README.md"
echo ""
echo "Ìæâ Happy coding with FAITH!"
