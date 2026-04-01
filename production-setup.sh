#!/bin/bash
# ============================================================================
# CONSISTENCYGRID PRODUCTION LAUNCH SCRIPT
# ============================================================================
# This script automates the production setup process
# Run: bash production-setup.sh
# ============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║         ConsistencyGrid Production Launch Assistant                   ║"
echo "║              Automated Setup Script - Step by Step                    ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================
echo "[1/6] Checking prerequisites..."

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ ERROR: $1 is not installed"
        echo "   Install from: $2"
        exit 1
    fi
    echo "✅ $1 found"
}

check_command "node" "https://nodejs.org/"
check_command "npm" "https://npmjs.com/"
check_command "git" "https://git-scm.com/"

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "   Node.js: $NODE_VERSION"
echo "   NPM: $NPM_VERSION"
echo ""

# ============================================================================
# Step 2: Install Dependencies
# ============================================================================
echo "[2/6] Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed (node_modules exists)"
fi
echo ""

# ============================================================================
# Step 3: Environment Configuration
# ============================================================================
echo "[3/6] Setting up environment variables..."

if [ ! -f ".env.production" ]; then
    echo ""
    echo "⚠️  .env.production file not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Copy template: cp .env.production.example .env.production"
    echo "2. Open .env.production in your editor"
    echo "3. Fill in the required values:"
    echo "   - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - RAZORPAY_KEY_ID: From https://dashboard.razorpay.com/app/settings/api-keys"
    echo "   - RAZORPAY_KEY_SECRET: From same location"
    echo "   - RAZORPAY_WEBHOOK_SECRET: From Webhooks section"
    echo "   - NEXT_PUBLIC_SENTRY_DSN: From https://sentry.io/"
    echo ""
    echo "4. Run this script again once .env.production is configured"
    exit 1
else
    echo "✅ .env.production found"
fi

# Source env file
if [ -f ".env.production" ]; then
    set -a
    source .env.production
    set +a
fi

# Verify critical variables
REQUIRED_VARS=("NEXTAUTH_SECRET" "DATABASE_URL" "RAZORPAY_KEY_ID" "RAZORPAY_KEY_SECRET")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERROR: $var is not set in .env.production"
        exit 1
    fi
done

echo "✅ All required environment variables configured"
echo ""

# ============================================================================
# Step 4: Build Application
# ============================================================================
echo "[4/6] Building application..."

npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

# ============================================================================
# Step 5: Database Migration
# ============================================================================
echo "[5/6] Preparing database..."

echo "ℹ️  Database setup instructions:"
echo ""
echo "Run these commands to apply migrations and indexes:"
echo ""
echo "# Apply Prisma migrations"
echo "npx prisma db push --skip-generate"
echo ""
echo "# Apply production indexes"
echo "psql \$DATABASE_URL < docs/database-indexes.sql"
echo ""
echo "Once complete, press Enter to continue..."
read -p ""

echo "✅ Database setup instructions shown"
echo ""

# ============================================================================
# Step 6: Deployment
# ============================================================================
echo "[6/6] Ready for deployment..."

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                        PRE-DEPLOYMENT CHECKLIST                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

CHECKLIST=(
    "Environment variables configured in .env.production"
    "Database migrations applied (npx prisma db push)"
    "Database indexes created (docs/database-indexes.sql)"
    "Razorpay webhook configured with live URL"
    "Razorpay API keys verified (live mode, not test)"
    "Sentry project created and DSN configured"
    "Domain pointing to deployment platform"
    "SSL certificate auto-renewal configured"
)

for i in "${!CHECKLIST[@]}"; do
    echo "[ ] $((i+1)). ${CHECKLIST[$i]}"
done

echo ""
echo "Once all items above are complete, you can deploy:"
echo ""
echo "Option A: Deploy to Netlify"
echo "  git add . && git commit -m 'production deployment' && git push origin main"
echo ""
echo "Option B: Deploy to Vercel"
echo "  vercel --prod"
echo ""
echo "Option C: Check deployment guide"
echo "  cat PRODUCTION_DEPLOYMENT_GUIDE.md"
echo ""

read -p "Have you completed all checklist items above? (yes/no): " response
if [[ $response != "yes" ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "✅ All prerequisite checks complete!"
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║               🚀 READY FOR PRODUCTION DEPLOYMENT 🚀                   ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your application is ready to deploy to production."
echo ""
echo "Next Steps:"
echo "1. Deploy: git push origin main (for Netlify)"
echo "2. Verify: https://consistencygrid.netlify.app/api/health"
echo "3. Test: https://consistencygrid.netlify.app/pricing"
echo "4. Monitor: Check Sentry at https://sentry.io/"
echo ""
echo "See LAUNCH_DAY_REFERENCE.md for quick launch day procedures."
echo ""
