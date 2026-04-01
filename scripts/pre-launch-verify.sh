#!/bin/bash

# ============================================================================
# ConsistencyGrid Pre-Launch Verification Script
# ============================================================================
# This script performs comprehensive checks before launching to production
# Run this 1 hour before launch to verify all systems are ready
# ============================================================================

set -e  # Exit on error

RESET='\033[0m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

# Counter for checks
PASSED=0
FAILED=0
WARNINGS=0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_pass() {
    echo -e "${GREEN}✅ PASS${RESET}: $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}❌ FAIL${RESET}: $1"
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN${RESET}: $1"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO${RESET}: $1"
}

section() {
    echo ""
    echo "============================================================================"
    echo "  $1"
    echo "============================================================================"
}

# ============================================================================
# SECTION 1: ENVIRONMENT VARIABLES
# ============================================================================

section "1. ENVIRONMENT VARIABLES CHECK"

check_env() {
    if [ -z "${!1}" ]; then
        log_fail "Missing environment variable: $1"
        return 1
    else
        log_pass "Environment variable exists: $1"
        return 0
    fi
}

check_env "NEXTAUTH_SECRET" || true
check_env "NEXTAUTH_URL" || true
check_env "DATABASE_URL" || true
check_env "RAZORPAY_KEY_ID" || true
check_env "RAZORPAY_KEY_SECRET" || true
check_env "STRIPE_SECRET_KEY" || true
check_env "SENTRY_DSN" || true

# ============================================================================
# SECTION 2: DATABASE CONNECTIVITY
# ============================================================================

section "2. DATABASE CONNECTIVITY CHECK"

# Extract database connection info
DB_URL="${DATABASE_URL}"
if [ -z "$DB_URL" ]; then
    log_fail "DATABASE_URL not set"
else
    log_info "Testing database connection..."
    
    # Try to connect using psql
    if command -v psql &> /dev/null; then
        if psql "$DB_URL" -c "SELECT 1" &> /dev/null; then
            log_pass "Database connection successful"
        else
            log_fail "Cannot connect to database"
        fi
    else
        log_warn "psql not installed, skipping database test"
    fi
fi

# ============================================================================
# SECTION 3: DATABASE INDEXES
# ============================================================================

section "3. DATABASE INDEXES CHECK"

if command -v psql &> /dev/null; then
    log_info "Checking if production indexes exist..."
    
    # Check for critical indexes
    indexes_to_check=(
        "idx_user_email"
        "idx_habit_userid_active"
        "idx_habitlog_habitid_date"
        "idx_payment_providerid"
        "idx_settings_userid"
    )
    
    for index in "${indexes_to_check[@]}"; do
        if psql "$DB_URL" -tc "SELECT indexname FROM pg_indexes WHERE indexname='$index';" | grep -q "$index"; then
            log_pass "Index exists: $index"
        else
            log_fail "CRITICAL: Missing index: $index"
        fi
    done
else
    log_warn "psql not available, cannot verify indexes"
fi

# ============================================================================
# SECTION 4: NODE & NPM
# ============================================================================

section "4. NODE & NPM CHECK"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_pass "Node.js installed: $NODE_VERSION"
else
    log_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_pass "npm installed: $NPM_VERSION"
else
    log_fail "npm not installed"
fi

# ============================================================================
# SECTION 5: PROJECT BUILD
# ============================================================================

section "5. PROJECT BUILD CHECK"

if [ -f "package.json" ]; then
    log_pass "package.json found"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        log_pass "Dependencies installed (node_modules exists)"
    else
        log_warn "Dependencies not installed - run 'npm install'"
    fi
    
    # Check if build exists
    if [ -d ".next" ]; then
        log_pass "Production build exists (.next directory)"
    else
        log_warn "No production build yet - run 'npm run build'"
    fi
else
    log_fail "package.json not found"
fi

# ============================================================================
# SECTION 6: CRITICAL FILES
# ============================================================================

section "6. CRITICAL FILES CHECK"

files_to_check=(
    "src/app/layout.js"
    "src/app/page.js"
    "src/app/api/health/route.js"
    "src/app/api/payment/create-order/route.js"
    "src/app/api/payment/verify/route.js"
    "src/app/api/payment/webhook/route.js"
    "prisma/schema.prisma"
    "next.config.mjs"
    ".env.example"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        log_pass "File exists: $file"
    else
        log_fail "Missing critical file: $file"
    fi
done

# ============================================================================
# SECTION 7: SECURITY FILES
# ============================================================================

section "7. SECURITY CONFIGURATION CHECK"

security_files=(
    "middleware.js"
    "src/lib/api-rate-limit.js"
    "src/lib/validation-utils.js"
)

for file in "${security_files[@]}"; do
    if [ -f "$file" ]; then
        log_pass "Security file exists: $file"
    else
        log_fail "Missing security file: $file"
    fi
done

# ============================================================================
# SECTION 8: PAYMENT CONFIGURATION
# ============================================================================

section "8. PAYMENT CONFIGURATION CHECK"

if [ -f "src/lib/payment/payment-config.js" ]; then
    log_pass "Payment config exists"
    
    if grep -q "PRICING_PLANS" "src/lib/payment/payment-config.js"; then
        log_pass "Pricing plans defined"
    else
        log_fail "Pricing plans not found in payment config"
    fi
else
    log_fail "Payment config file missing"
fi

# ============================================================================
# SECTION 9: TEST FILES
# ============================================================================

section "9. TEST CONFIGURATION CHECK"

if [ -f "cypress.config.js" ]; then
    log_pass "Cypress E2E tests configured"
else
    log_warn "Cypress not configured"
fi

if [ -d "cypress/e2e" ]; then
    test_count=$(find cypress/e2e -name "*.cy.js" 2>/dev/null | wc -l)
    log_pass "Found $test_count E2E test files"
else
    log_warn "No E2E tests found"
fi

# ============================================================================
# SECTION 10: PORT & SERVICES
# ============================================================================

section "10. SERVICES & PORTS CHECK"

# Check if port 3000 is available
if command -v lsof &> /dev/null; then
    if ! lsof -i :3000 &> /dev/null; then
        log_pass "Port 3000 is available"
    else
        log_warn "Port 3000 is already in use"
    fi
else
    log_info "Cannot check port availability (lsof not installed)"
fi

# ============================================================================
# SECTION 11: SECURITY HEADERS
# ============================================================================

section "11. SECURITY HEADERS CHECK"

if grep -q "X-Frame-Options" middleware.js; then
    log_pass "X-Frame-Options header configured"
else
    log_fail "X-Frame-Options header not configured"
fi

if grep -q "Content-Security-Policy" middleware.js; then
    log_pass "CSP header configured"
else
    log_fail "CSP header not configured"
fi

if grep -q "X-Content-Type-Options" middleware.js; then
    log_pass "X-Content-Type-Options header configured"
else
    log_fail "X-Content-Type-Options header not configured"
fi

# ============================================================================
# SECTION 12: RATE LIMITING
# ============================================================================

section "12. RATE LIMITING CHECK"

if [ -f "src/lib/api-rate-limit.js" ]; then
    log_pass "Rate limiting utility exists"
    
    if grep -q "isRateLimited" "src/app/api/payment/create-order/route.js"; then
        log_pass "Rate limiting enabled on create-order endpoint"
    else
        log_fail "Rate limiting not enabled on create-order"
    fi
    
    if grep -q "isRateLimited" "src/app/api/payment/verify/route.js"; then
        log_pass "Rate limiting enabled on verify endpoint"
    else
        log_fail "Rate limiting not enabled on verify"
    fi
else
    log_fail "Rate limiting utility missing"
fi

# ============================================================================
# SECTION 13: DOCUMENTATION
# ============================================================================

section "13. DOCUMENTATION CHECK"

docs=(
    "FINAL_SUMMARY.md"
    "DEPLOYMENT_GUIDE.md"
    "PRODUCTION_CHECKLIST.md"
    "QUICK_REFERENCE.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        log_pass "Documentation exists: $doc"
    else
        log_warn "Missing documentation: $doc"
    fi
done

# ============================================================================
# SECTION 14: GIT STATUS
# ============================================================================

section "14. GIT STATUS CHECK"

if command -v git &> /dev/null; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        log_pass "Git repository initialized"
        
        # Check for uncommitted changes
        if [ -z "$(git status --porcelain)" ]; then
            log_pass "All changes committed"
        else
            log_warn "Uncommitted changes exist"
        fi
    else
        log_fail "Not a git repository"
    fi
else
    log_info "Git not installed"
fi

# ============================================================================
# FINAL REPORT
# ============================================================================

section "VERIFICATION REPORT"

echo "Passed:  ${GREEN}$PASSED${RESET}"
echo "Failed:  ${RED}$FAILED${RESET}"
echo "Warnings: ${YELLOW}$WARNINGS${RESET}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL CHECKS PASSED!${RESET}"
    echo "Status: READY FOR PRODUCTION DEPLOYMENT"
    exit 0
else
    echo -e "${RED}❌ $FAILED CRITICAL CHECKS FAILED!${RESET}"
    echo "Status: NOT READY FOR DEPLOYMENT"
    exit 1
fi
