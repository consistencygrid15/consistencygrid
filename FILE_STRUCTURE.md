# 📁 CONSISTENCYGRID - PROJECT FILE STRUCTURE

**Status:** ✅ Production Ready  
**Updated:** March 1, 2026  
**Total Files:** 400+

---

## 📋 QUICK NAVIGATION

### 🚀 **To Deploy (Start Here)**
- [`README_PRODUCTION.md`](README_PRODUCTION.md) - Production entry point (2 min)
- [`PRODUCTION_DEPLOYMENT_GUIDE.md`](PRODUCTION_DEPLOYMENT_GUIDE.md) - Deployment steps (30 min)
- [`LAUNCH_DAY_REFERENCE.md`](LAUNCH_DAY_REFERENCE.md) - Quick reference (5 min)
- [`PRODUCTION_LAUNCH_CHECKLIST.md`](PRODUCTION_LAUNCH_CHECKLIST.md) - Launch checklist (15 min)

### 📚 **To Understand the Code**
- [`docs/APP_ARCHITECTURE.md`](docs/APP_ARCHITECTURE.md) - System architecture
- [`docs/development/developer-guide.md`](docs/development/developer-guide.md) - Development guide
- [`docs/SECURITY_HARDENING.md`](docs/SECURITY_HARDENING.md) - Security details

### ⚠️ **For Emergencies**
- [`LAUNCH_DAY_REFERENCE.md`](LAUNCH_DAY_REFERENCE.md) - Emergency procedures
- [`docs/INCIDENT_RESPONSE_PLAYBOOK.md`](docs/INCIDENT_RESPONSE_PLAYBOOK.md) - Incident procedures

---

## 📁 COMPLETE DIRECTORY STRUCTURE

```
consistencygrid/
│
├── 📄 PRODUCTION & LAUNCH (Essential)
│   ├── README_PRODUCTION.md .................. Main production guide
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md ....... Complete deployment instructions
│   ├── PRODUCTION_LAUNCH_CHECKLIST.md ....... 90+ item launch checklist
│   ├── LAUNCH_DAY_REFERENCE.md .............. Quick 30-min reference card
│   ├── .env.production.example .............. Environment template
│   ├── pre-launch-verify.bat ................ Windows verification
│   └── production-setup.sh .................. Linux/Mac setup
│
├── ⚙️  CONFIGURATION FILES
│   ├── package.json ......................... Dependencies & build scripts
│   ├── next.config.mjs ...................... Next.js optimization & security
│   ├── middleware.js ........................ Authentication & security
│   ├── netlify.toml ......................... Netlify deployment config
│   ├── vercel.json .......................... Vercel deployment config
│   ├── jsconfig.json ........................ JavaScript configuration
│   ├── eslint.config.mjs .................... ESLint rules
│   ├── postcss.config.mjs ................... PostCSS configuration
│   ├── cypress.config.js .................... E2E testing configuration
│   ├── .nvmrc ............................... Node version specification
│   └── .gitignore ........................... Git ignore rules
│
├── 🔐 MONITORING & SECURITY
│   ├── sentry.server.config.js .............. Server error tracking
│   ├── sentry.client.config.js .............. Client error tracking
│   └── config/monitoring-alerts.json ........ Alert configuration
│
├── 🌍 ENVIRONMENT FILES
│   ├── .env ................................. Development environment
│   ├── .env.local ........................... Local overrides
│   ├── .env.example ......................... Development template
│   ├── .env.production ...................... Production (NOT committed)
│   ├── .env.production.example .............. Production template
│   └── .env.production.template ............. Production template (backup)
│
├── 📁 src/ .................................. SOURCE CODE (250+ files)
│   │
│   ├── app/ ................................. Next.js App Router
│   │   ├── api/ ............................. API Routes (21 categories)
│   │   │   ├── auth/ ........................ Authentication endpoints
│   │   │   ├── payment/ ..................... Payment processing
│   │   │   ├── health/ ..................... Health check
│   │   │   ├── user/ ....................... User management
│   │   │   ├── habits/ ..................... Habit CRUD
│   │   │   ├── goals/ ...................... Goal CRUD
│   │   │   ├── analytics/ .................. Analytics
│   │   │   ├── export-data/ ................ GDPR export
│   │   │   ├── gdpr/ ....................... GDPR endpoints
│   │   │   ├── wallpaper-data/ ............. Wallpaper API
│   │   │   ├── admin/ ...................... Admin endpoints
│   │   │   ├── reminders/ .................. Reminders API
│   │   │   ├── streaks/ .................... Streaks API
│   │   │   ├── subscription/ ............... Subscriptions
│   │   │   ├── milestones/ ................. Milestones
│   │   │   ├── subgoals/ ................... Subgoals
│   │   │   ├── onboarding/ ................. Onboarding API
│   │   │   ├── dashboard/ .................. Dashboard API
│   │   │   ├── native-auth/ ................ Native auth
│   │   │   └── README.md ................... API docs
│   │   │
│   │   ├── auth/ ........................... Authentication Pages (4)
│   │   │   ├── login/page.js
│   │   │   ├── signup/page.js
│   │   │   ├── forgot-password/page.js
│   │   │   └── reset-password/page.js
│   │   │
│   │   ├── dashboard/ ...................... Dashboard Section (8)
│   │   │   ├── page.js ..................... Dashboard home
│   │   │   ├── habits/page.js .............. Habits management
│   │   │   ├── goals/page.js ............... Goals management
│   │   │   ├── streaks/page.js ............. Streaks view
│   │   │   ├── reminders/page.js ........... Reminders
│   │   │   ├── calendar/page.js ............ Calendar view
│   │   │   ├── analytics/page.js ........... Analytics
│   │   │   └── settings/page.js ............ Settings
│   │   │
│   │   ├── generator/page.js ............... Wallpaper Generator
│   │   ├── pricing/page.js ................. Pricing Page
│   │   ├── w/[token]/image.png/route.js ... Wallpaper Image
│   │   ├── onboarding/page.js .............. Onboarding
│   │   ├── privacy/page.js ................. Privacy Policy
│   │   ├── terms/page.js ................... Terms of Service
│   │   ├── help/page.js .................... Help Center
│   │   ├── test-oauth/page.js .............. OAuth Testing
│   │   ├── mobile-auth-callback/page.js ... Mobile Auth
│   │   │
│   │   ├── layout.js ....................... Root layout
│   │   ├── page.js ......................... Home page
│   │   ├── globals.css ..................... Global styles
│   │   ├── providers.js .................... Context providers
│   │   ├── sitemap.js ...................... Sitemap
│   │   ├── not-found.js .................... 404 page
│   │   ├── global-error.js ................. Error page
│   │   └── favicon.ico ..................... Favicon
│   │
│   ├── components/ ......................... React Components (50+)
│   │   ├── auth/ ........................... Auth forms & components
│   │   ├── dashboard/ ...................... Dashboard components
│   │   ├── habits/ ......................... Habit components
│   │   ├── goals/ .......................... Goal components
│   │   ├── payment/ ........................ Payment components
│   │   ├── wallpaper/ ...................... Wallpaper components
│   │   ├── layout/ ......................... Layout components
│   │   ├── ui/ ............................. UI components (Button, Modal, etc.)
│   │   ├── skeletons/ ...................... Skeleton loaders
│   │   ├── modals/ ......................... Modal dialogs
│   │   ├── common/ ......................... Common components
│   │   ├── onboarding/ ..................... Onboarding flow
│   │   ├── settings/ ....................... Settings components
│   │   ├── streaks/ ........................ Streaks components
│   │   ├── reminders/ ...................... Reminders components
│   │   ├── landing/ ........................ Landing page
│   │   ├── generator/ ...................... Generator components
│   │   ├── CanvasWallpaperEngine.js ........ Wallpaper engine
│   │   ├── CanvasWallpaperRenderer.js ...... Wallpaper renderer
│   │   └── README.md ....................... Component guide
│   │
│   ├── lib/ ................................ Libraries & Utilities (30+)
│   │   ├── auth/
│   │   │   ├── authOptions.js ............. NextAuth config
│   │   │   ├── getAndroidAuth.js .......... Android auth
│   │   │   └── token.js ................... JWT utilities
│   │   │
│   │   ├── payment/
│   │   │   ├── payment-config.js .......... Provider config
│   │   │   ├── razorpay.js ................ Razorpay integration
│   │   │   ├── stripe.js .................. Stripe integration
│   │   │   └── payment-utils.js ........... Payment helpers
│   │   │
│   │   ├── wallpaper/
│   │   │   ├── wallpaper-cache.js ......... Caching logic
│   │   │   ├── wallpaper-renderer.js ...... Rendering engine
│   │   │   └── wallpaper-utils.js ......... Wallpaper helpers
│   │   │
│   │   ├── prisma.js ....................... Prisma client
│   │   ├── rate-limit.js ................... Rate limiting
│   │   ├── validation.js ................... Input validation
│   │   ├── apiSecurity.js .................. API protection
│   │   ├── mail.js ......................... Email service
│   │   ├── apiResponse.js .................. Response helpers
│   │   ├── errorResponse.js ................ Error helpers
│   │   ├── apiHelpers.js ................... API utilities
│   │   ├── analytics.js .................... Analytics utilities
│   │   ├── habits.js ....................... Habit utilities
│   │   ├── export-data.js .................. Data export
│   │   ├── gdpr.js ......................... GDPR utilities
│   │   ├── sentry-server.js ................ Sentry server
│   │   ├── sentry-client.js ................ Sentry client
│   │   ├── subscription-utils.js ........... Subscription helpers
│   │   ├── performance.js .................. Performance monitoring
│   │   ├── platform-utils.js ............... Platform detection
│   │   ├── csrf.js ......................... CSRF protection
│   │   ├── pwa.js .......................... PWA utilities
│   │   ├── seo.js .......................... SEO utilities
│   │   └── README.md ....................... Library documentation
│   │
│   ├── hooks/ .............................. React Hooks (10)
│   │   ├── useAuth.js
│   │   ├── useUser.js
│   │   ├── useHabits.js
│   │   ├── useGoals.js
│   │   ├── usePayment.js
│   │   ├── useLocalStorage.js
│   │   ├── useFetch.js
│   │   ├── useDebounce.js
│   │   ├── useTheme.js
│   │   └── [other hooks]
│   │
│   ├── utils/ .............................. Utilities (10)
│   │   ├── date.js
│   │   ├── string.js
│   │   ├── number.js
│   │   ├── array.js
│   │   ├── object.js
│   │   ├── format.js
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   └── fonts/ .............................. Web Fonts
│       ├── GeistVF.woff
│       └── Geist Mono.woff
│
├── 📁 prisma/ .............................. DATABASE
│   ├── schema.prisma ....................... Database schema (8 tables)
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   └── 20260124130644_init/
│   │       └── migration.sql .............. Initial migration
│   └── seed.js (optional) .................. Database seeding
│
├── 📁 public/ .............................. STATIC FILES & ASSETS
│   ├── manifest.json ....................... PWA manifest
│   ├── robots.txt .......................... SEO robots
│   ├── offline.html ........................ Offline page
│   ├── sw.js .............................. Service worker
│   ├── favicon.ico ......................... Favicon
│   ├── images/ ............................ Images
│   │   ├── logo.png
│   │   ├── hero.png
│   │   ├── features/
│   │   ├── icons/
│   │   └── avatars/
│   ├── wallpapers/ ........................ Wallpaper samples
│   │   ├── sample-dark.png
│   │   ├── sample-light.png
│   │   └── sample-themes/
│   └── fonts/ ............................. Web fonts
│
├── 📁 docs/ ................................ DOCUMENTATION (40+)
│   ├── APP_ARCHITECTURE.md ................. System architecture
│   ├── SECURITY_HARDENING.md ............... Security guide
│   ├── INCIDENT_RESPONSE_PLAYBOOK.md ....... Incident procedures
│   ├── database-indexes.sql ................ Database indexes
│   │
│   ├── deployment/
│   │   ├── deployment-guide.md ............. Deployment procedures
│   │   ├── vercel-checklist.md ............. Vercel deployment
│   │   └── wallpaper-deployment.md ......... Wallpaper deployment
│   │
│   ├── development/
│   │   ├── developer-guide.md .............. Developer guide
│   │   ├── codebase-reference.md ........... Codebase overview
│   │   └── src-lib-documentation.md ........ Library documentation
│   │
│   ├── guides/
│   │   ├── razorpay-setup.md ............... Razorpay setup
│   │   ├── resend-setup.md ................. Email setup
│   │   └── sentry-setup.md ................. Error tracking setup
│   │
│   ├── ANDROID_INTEGRATION.md .............. Android integration
│   ├── RAZORPAY_SETUP_GUIDE.md ............. Payment setup
│   ├── PLAY_STORE_SUBMISSION.md ............ Play Store guide
│   ├── TESTING_GUIDE.md .................... Testing procedures
│   └── [other documentation]
│
├── 🧪 cypress/ ............................. E2E TESTS
│   ├── e2e/
│   │   ├── 01-auth.cy.js ................... Auth tests
│   │   ├── 02-dashboard.cy.js .............. Dashboard tests
│   │   ├── 03-goals.cy.js .................. Goals tests
│   │   ├── 04-habits.cy.js ................. Habits tests
│   │   ├── 05-streaks.cy.js ................ Streaks tests
│   │   └── 06-settings.cy.js ............... Settings tests
│   └── support/
│       ├── commands.js ..................... Custom commands
│       ├── e2e.js .......................... E2E setup
│       └── test-data.js .................... Test data
│
├── 📱 android/ ............................. ANDROID APP
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   ├── java/
│   │   │   │   └── res/
│   │   │   └── test/
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
│
├── 🔧 scripts/ .............................. BUILD & UTILITY SCRIPTS
│   ├── pre-launch-verify.sh ................ Pre-launch verification
│   ├── grant-access.js ..................... Database access
│   ├── validate-phase2.js .................. Phase 2 validation
│   └── verify-postgres-setup.js ............ PostgreSQL verification
│
├── 📁 config/ .............................. CONFIGURATION
│   └── monitoring-alerts.json .............. Alert configuration
│
├── 🌐 .github/ ............................. GITHUB
│   └── workflows/
│       ├── deploy.yml ...................... Deployment workflow
│       └── test.yml ........................ Test workflow
│
├── 💻 .vscode/ ............................. VS CODE
│   ├── settings.json ....................... Editor settings
│   ├── extensions.json ..................... Recommended extensions
│   └── launch.json ......................... Debug configuration
│
├── 🤖 .cursor/ ............................. CURSOR AI CONFIG
│
├── 📚 DOCUMENTATION FILES
│   ├── README.md ........................... Main README
│   ├── QUICK_REFERENCE.md .................. Quick reference
│   └── [other reference files]
│
└── 🔧 UTILITY SCRIPTS (Root)
    ├── check-db.js ......................... Database check
    ├── check-env.js ........................ Environment check
    ├── test-payment-api.js ................. Payment testing
    └── run_on_device.bat ................... Run on device
```

---

## 🗂️ KEY DIRECTORIES EXPLAINED

| Path | Purpose | Contains |
|------|---------|----------|
| `src/app/` | Next.js routes & pages | 40+ pages + 21 API categories |
| `src/components/` | Reusable React components | 50+ components by feature |
| `src/lib/` | Libraries & utilities | 30+ utility modules |
| `src/hooks/` | Custom React hooks | 10 custom hooks |
| `src/utils/` | Pure utility functions | 10 helper utilities |
| `prisma/` | Database schema & migrations | Schema + migrations |
| `public/` | Static assets | Images, fonts, manifests |
| `docs/` | Documentation | 40+ guide files |
| `cypress/` | E2E tests | 6 test files + support |
| `scripts/` | Build scripts | Verification & utilities |
| `config/` | Configuration | Monitoring alerts |
| `android/` | Mobile app | Android project |

---

## 📊 FILE STATISTICS

| Category | Count |
|----------|-------|
| **Production/Launch Files** | 7 |
| **Configuration Files** | 11 |
| **Environment Files** | 5 |
| **Source Code Files** | 250+ |
| **Component Files** | 50+ |
| **Library Files** | 30+ |
| **Documentation Files** | 40+ |
| **Test Files** | 10+ |
| **Build Scripts** | 10+ |
| **Static Assets** | 50+ |
| **TOTAL** | **500+** |

---

## ⚡ QUICK START

### **For Deployment (50 min)**
```bash
1. Read: README_PRODUCTION.md
2. Configure: .env.production
3. Verify: pre-launch-verify.bat
4. Deploy: git push origin main
```

### **For Development**
```bash
cd src/components/  # Add components
cd src/app/         # Add pages
cd src/lib/         # Add utilities
```

### **For Documentation**
```bash
docs/APP_ARCHITECTURE.md       # Understand system
docs/SECURITY_HARDENING.md     # Security details
docs/development/              # Dev guides
```

---

## ✅ VERIFICATION CHECKLIST

- [x] Routes organized (`src/app/api/` & pages)
- [x] Components organized by feature (`src/components/`)
- [x] Libraries organized by purpose (`src/lib/`)
- [x] Database schema ready (`prisma/schema.prisma`)
- [x] Configuration complete (all config files)
- [x] Documentation comprehensive (40+ files)
- [x] Tests organized (`cypress/e2e/`)
- [x] Build scripts ready (`scripts/`)
- [x] Production guides created (7 main guides)
- [x] Environment templates ready

---

## 🚀 STATUS: ✅ PRODUCTION READY

**Structure:** ✅ Complete  
**Configuration:** ✅ Complete  
**Documentation:** ✅ Complete  
**Security:** ✅ Hardened  
**Testing:** ✅ Ready  
**Deployment:** ✅ Ready

Ready for immediate production deployment.

---

**Last Updated:** March 1, 2026  
**Total Files:** 500+  
**Status:** ✅ Production Ready
