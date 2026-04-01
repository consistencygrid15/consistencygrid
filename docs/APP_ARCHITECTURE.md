# ConsistencyGrid - Complete Architecture Guide

## System Overview

ConsistencyGrid is a fullstack habit-tracking web application with mobile WebView support. It visualizes user progress through animated wallpapers and provides real-time streak tracking, goal management, and customizable habits.

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER DEVICES                                 │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Web Browser │ Mobile App   │  Android App │  Desktop Sync      │
│  (Next.js)   │ (WebView)    │  (WebView)   │  (Wallpaper Rend)  │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              CDN + Caching Layer                                 │
│  (1-hour cache on images, 5-min server cache)                   │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS APP SERVER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Routes (20+ endpoints)                              │   │
│  │  ├─ Authentication (login, signup, JWT)                 │   │
│  │  ├─ Habits (CRUD, logs, streaks)                        │   │
│  │  ├─ Goals (CRUD, progress tracking)                     │   │
│  │  ├─ Reminders (scheduling, notifications)              │   │
│  │  ├─ Payment (order creation, webhook verification)     │   │
│  │  ├─ Wallpaper (PNG generation, caching)                │   │
│  │  ├─ Settings (user preferences, theme)                 │   │
│  │  └─ Analytics (tracking, dashboard data)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend Routes (15+ pages)                             │   │
│  │  ├─ Auth (login, signup, forgot password)               │   │
│  │  ├─ Dashboard (overview, wallpaper display)             │   │
│  │  ├─ Habits (list, add, edit, logs)                      │   │
│  │  ├─ Goals (list, progress, completion)                 │   │
│  │  ├─ Streaks (visualization, history)                   │   │
│  │  ├─ Reminders (schedule, manage)                       │   │
│  │  ├─ Payment (pricing, checkout)                        │   │
│  │  ├─ Settings (preferences, export)                     │   │
│  │  └─ Onboarding (tutorial, first setup)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware (Security Layer)                             │   │
│  │  ├─ Security Headers (CSP, X-Frame-Options)            │   │
│  │  ├─ CSRF Protection                                     │   │
│  │  ├─ Request Logging                                     │   │
│  │  └─ Rate Limiting (Payment endpoints)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           ▼                    ▼                    ▼
    ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐
    │  PostgreSQL DB  │  │  Redis Cache │  │  Payment GW    │
    │  (Prisma ORM)   │  │  (Sessions)  │  │  (Razorpay+    │
    │  (100k users)   │  │              │  │   Stripe)      │
    └─────────────────┘  └──────────────┘  └────────────────┘
           ▼
    ┌──────────────────────────┐
    │  Monitoring & Analytics  │
    │  ├─ Sentry (errors)     │
    │  ├─ Database Logs       │
    │  ├─ Performance Metrics │
    │  └─ User Analytics      │
    └──────────────────────────┘
```

---

## DIRECTORY STRUCTURE

```
consistencygrid/
├── src/
│   ├── app/
│   │   ├── layout.js                          # Root layout, providers setup
│   │   ├── page.js                            # Home page
│   │   ├── globals.css                        # Global styles, Tailwind
│   │   ├── providers.js                       # React providers (themes, auth)
│   │   ├── not-found.js                       # 404 page
│   │   ├── sitemap.js                         # SEO sitemap generation
│   │   │
│   │   ├── api/                               # Next.js API Routes
│   │   │   ├── health/route.js                # Health check endpoint
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js
│   │   │   │   ├── signup/route.js
│   │   │   │   ├── logout/route.js
│   │   │   │   └── [...nextauth]/route.js
│   │   │   ├── habits/
│   │   │   │   ├── route.js                   # GET (list), POST (create)
│   │   │   │   ├── [id]/route.js              # GET, PATCH, DELETE
│   │   │   │   └── [id]/logs/route.js         # Habit logs
│   │   │   ├── goals/
│   │   │   │   ├── route.js                   # GET, POST
│   │   │   │   └── [id]/route.js              # GET, PATCH, DELETE
│   │   │   ├── reminders/
│   │   │   │   ├── route.js                   # GET, POST
│   │   │   │   └── [id]/route.js              # GET, PATCH, DELETE
│   │   │   ├── payment/
│   │   │   │   ├── create-order/route.js      # Razorpay order creation
│   │   │   │   ├── verify/route.js            # Payment verification
│   │   │   │   └── webhook/route.js           # Payment webhooks
│   │   │   ├── settings/
│   │   │   │   └── route.js                   # User settings
│   │   │   ├── analytics/
│   │   │   │   └── route.js                   # Analytics data
│   │   │   └── wallpaper/
│   │   │       └── image.png/route.js         # Wallpaper PNG generation
│   │   │
│   │   ├── dashboard/                          # Dashboard page
│   │   │   ├── page.js
│   │   │   └── layout.js
│   │   ├── habits/                             # Habits management
│   │   │   ├── page.js
│   │   │   ├── [id]/page.js
│   │   │   └── add/page.js
│   │   ├── goals/                              # Goals page
│   │   ├── streaks/                            # Streaks visualization
│   │   ├── reminders/                          # Reminders management
│   │   ├── settings/                           # User settings page
│   │   ├── payment/
│   │   │   ├── pricing/page.js
│   │   │   ├── checkout/page.js
│   │   │   └── success/page.js
│   │   ├── login/page.js                       # Auth pages
│   │   ├── signup/page.js
│   │   ├── forgot-password/page.js
│   │   ├── reset-password/page.js
│   │   ├── onboarding/                         # Onboarding flow
│   │   ├── privacy/page.js
│   │   ├── terms/page.js
│   │   ├── help/page.js
│   │   └── w/                                  # Wallpaper download endpoint
│   │
│   ├── components/
│   │   ├── README.md                           # Components documentation
│   │   ├── CanvasWallpaperEngine.js           # Wallpaper Canvas rendering
│   │   ├── CanvasWallpaperRenderer.js         # PNG generation utility
│   │   ├── auth/
│   │   │   ├── LoginForm.js
│   │   │   ├── SignupForm.js
│   │   │   └── ProtectedRoute.js
│   │   ├── dashboard/
│   │   │   ├── DashboardOverview.js
│   │   │   ├── WallpaperDisplay.js
│   │   │   ├── StatsWidget.js
│   │   │   └── QuickActions.js
│   │   ├── habits/
│   │   │   ├── HabitList.js
│   │   │   ├── HabitForm.js
│   │   │   ├── HabitLog.js
│   │   │   └── StreakCounter.js
│   │   ├── goals/
│   │   │   ├── GoalList.js
│   │   │   ├── GoalForm.js
│   │   │   └── ProgressBar.js
│   │   ├── payment/
│   │   │   ├── PricingCards.js
│   │   │   ├── CheckoutForm.js
│   │   │   └── PaymentStatus.js
│   │   ├── common/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Button.js
│   │   │   └── LoadingSpinner.js
│   │   ├── ui/
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   └── Badge.js
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Layout.js
│   │   │   └── MobileNav.js
│   │   ├── reminders/
│   │   ├── settings/
│   │   ├── skeletons/
│   │   │   └── [loading skeletons]
│   │   ├── modals/
│   │   │   ├── ConfirmModal.js
│   │   │   ├── EditModal.js
│   │   │   └── ExportModal.js
│   │   ├── analytics/
│   │   ├── wallpaper/
│   │   │   ├── WallpaperEditor.js
│   │   │   └── ColorPicker.js
│   │   ├── landing/
│   │   │   ├── Hero.js
│   │   │   ├── Features.js
│   │   │   ├── Testimonials.js
│   │   │   └── CTA.js
│   │   ├── onboarding/
│   │   │   ├── OnboardingFlow.js
│   │   │   ├── Step1.js
│   │   │   └── Step2.js
│   │   └── generator/
│   │       └── WallpaperGenerator.js
│   │
│   ├── hooks/
│   │   ├── useLimitCheck.js                    # Check subscription limits
│   │   ├── useAuth.js                          # Authentication hook
│   │   ├── usePayment.js                       # Payment processing
│   │   ├── useHabits.js                        # Habits data fetching
│   │   ├── useGoals.js                         # Goals data fetching
│   │   ├── useDarkMode.js                      # Theme management
│   │   └── [custom hooks]
│   │
│   └── lib/
│       ├── analytics.js                        # Analytics tracking
│       ├── api-cache.js                        # Cache management
│       ├── api-rate-limit.js                   # Rate limiting utility ⭐
│       ├── api-security.js                     # Security utilities
│       ├── apiHelpers.js                       # API request helpers
│       ├── apiResponse.js                      # Standardized API responses
│       ├── cache-invalidation.js               # Cache busting strategy
│       ├── csrf.js                             # CSRF token generation
│       ├── dashboard-cache.js                  # Dashboard data caching
│       ├── db-indexes.js                       # Database index documentation
│       ├── db-optimization.js                  # Query optimization
│       ├── validation-utils.js                 # Input validation ⭐
│       ├── payment-config.js                   # Payment settings
│       ├── constants.js                        # App constants
│       ├── logger.js                           # Logging utility
│       └── auth.js                             # Authentication helpers
│
├── prisma/
│   ├── schema.prisma                           # Database schema
│   └── migrations/
│       └── [database migrations]
│
├── public/
│   ├── manifest.json                           # PWA manifest
│   ├── robots.txt                              # SEO robots
│   ├── offline.html                            # Offline fallback
│   ├── sw.js                                   # Service Worker
│   ├── images/                                 # Static images
│   └── wallpapers/                             # Sample wallpapers
│
├── scripts/
│   ├── pre-launch-verify.sh                    # Pre-launch checklist ⭐
│   ├── validate-phase2.js
│   ├── verify-postgres-setup.js
│   └── [utility scripts]
│
├── docs/
│   ├── INCIDENT_RESPONSE_PLAYBOOK.md           # This file ⭐
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PRODUCTION_CHECKLIST.md
│   ├── QUICK_REFERENCE.md
│   ├── deployment/
│   │   ├── vercel-checklist.md
│   │   ├── vercel-quickstart.md
│   │   └── wallpaper-deployment.md
│   ├── development/
│   │   ├── developer-guide.md
│   │   ├── codebase-reference.md
│   │   └── src-lib-documentation.md
│   └── guides/
│       ├── resend-setup.md
│       └── [feature guides]
│
├── cypress/
│   ├── e2e/                                    # E2E tests
│   │   ├── 01-auth.cy.js
│   │   ├── 02-dashboard.cy.js
│   │   ├── 03-goals.cy.js
│   │   ├── 04-habits.cy.js
│   │   ├── 05-streaks.cy.js
│   │   └── 06-settings.cy.js
│   └── support/
│       ├── commands.js
│       ├── e2e.js
│       └── test-data.js
│
├── android/
│   └── app/src/                                # Android WebView wrapper
│
├── config/
│   ├── monitoring-alerts.json                  # Monitoring setup ⭐
│   └── [other configs]
│
├── middleware.js                               # Next.js middleware ⭐
├── next.config.mjs                             # Next.js configuration
├── package.json                                # Dependencies
├── package-lock.json
├── postcss.config.mjs                          # Tailwind CSS config
├── eslint.config.mjs                           # Code linting
├── tailwind.config.js                          # Tailwind theme
├── jsconfig.json                               # JS path aliases
├── netlify.toml                                # Netlify deployment
├── vercel.json                                 # Vercel deployment
├── cypress.config.js                           # Cypress testing
├── sentry.client.config.js                     # Client-side error tracking
├── sentry.server.config.js                     # Server-side error tracking
├── .env.example                                # Environment template
├── .gitignore
├── README.md
└── [deployment files]
```

---

## DATA FLOW DIAGRAMS

### 1. Authentication Flow
```
User
  ↓
SignupForm / LoginForm
  ↓
POST /api/auth/signup or /api/auth/login
  ↓
Validation (email format, password strength)
  ↓
Hash password (bcrypt)
  ↓
Store in PostgreSQL (users table)
  ↓
Generate JWT token
  ↓
Set NextAuth session
  ↓
Redirect to Dashboard
  ↓
Browser stores session cookie (HttpOnly)
```

### 2. Habit Creation Flow
```
User clicks "Add Habit"
  ↓
HabitForm component renders
  ↓
User fills: name, description, color, category
  ↓
Form validates input (client-side)
  ↓
POST /api/habits {name, description, ...}
  ↓
Server validates (authentication, rate limit)
  ↓
Prisma creates habit record
  ↓
Cache invalidated (dashboard, habits list)
  ↓
Return {habitId, ...}
  ↓
Component updates UI
  ↓
User sees new habit in list
```

### 3. Wallpaper Generation Flow
```
User opens Dashboard
  ↓
Dashboard component mounts
  ↓
Fetch recent habits + logs for current month
  ↓
Fetch user settings (theme, colors)
  ↓
GET /api/wallpaper/image.png (with query params)
  ↓
Server checks cache (Redis, 5 min TTL)
  ↓
If cache hit: Return PNG from cache
  ↓
If cache miss:
  ├─ Create Canvas object
  ├─ Render grid based on habit logs
  ├─ Draw cells as colored squares (done/not done)
  ├─ Add streak indicators, labels
  ├─ Convert Canvas to PNG buffer
  ├─ Store in cache (5 min server, 1 hour CDN)
  └─ Return PNG
  ↓
Browser displays wallpaper image
  ↓
(Optional) User downloads wallpaper for device
```

### 4. Payment Flow
```
User clicks "Upgrade Plan"
  ↓
Pricing page displays plans
  ↓
User selects plan, clicks "Subscribe"
  ↓
Redirect to checkout page
  ↓
User enters payment details
  ↓
POST /api/payment/create-order
  ├─ Rate limit check
  ├─ Validate plan exists
  ├─ Validate amount matches plan
  └─ Create Razorpay order
  ↓
Razorpay returns orderId
  ↓
Frontend opens Razorpay payment modal
  ↓
User completes payment in Razorpay
  ↓
Razorpay sends webhook to /api/payment/webhook
  ├─ Verify webhook signature
  ├─ Check payment status
  ├─ Update user subscription in database
  ├─ Set subscription end date
  └─ Log payment transaction
  ↓
Webhook returns 200 OK
  ↓
Razorpay redirects user to success page
  ↓
Frontend shows "Subscription active"
  ↓
User can now access premium features
```

### 5. Reminder Notification Flow
```
User creates reminder (time: 9am, habit: Exercise)
  ↓
POST /api/reminders stores in database
  ↓
Daily cron job at 8:50am checks database
  ├─ SELECT reminders WHERE time=9am AND active=true
  ├─ Filter: only users in their timezone
  └─ Send email via Resend
  ↓
User receives email notification
  ↓
User clicks link in email
  ↓
Logs habit for that day
```

---

## Key Technologies

### Frontend
- **Next.js 16.1**: React framework, server-side rendering, API routes
- **React 19.2**: UI component framework, hooks
- **Tailwind CSS 4**: Utility-first CSS framework
- **NextAuth.js**: Authentication (JWT, sessions)
- **Canvas API**: Wallpaper rendering (browser-side + server-side)
- **Axios**: HTTP client for API calls
- **React Query**: Data fetching and caching

### Backend
- **Node.js**: JavaScript runtime
- **Prisma ORM**: Database abstraction and migrations
- **PostgreSQL**: Relational database (production)
- **Redis**: Caching and session storage
- **Razorpay**: Payment gateway (India)
- **Stripe**: Payment gateway (Global)
- **Resend**: Email delivery service

### DevOps & Monitoring
- **Vercel**: Frontend hosting and deployment
- **AWS/GCP**: Backend hosting (scalable)
- **PostgreSQL Cloud**: Managed database
- **Sentry**: Error tracking and performance monitoring
- **Docker**: Containerization
- **Kubernetes**: Container orchestration (production)

### Testing & Quality
- **Cypress**: End-to-end testing
- **Jest**: Unit testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## API ENDPOINTS

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | - | Create new account |
| POST | `/api/auth/login` | - | Login and get JWT |
| POST | `/api/auth/logout` | ✓ | Logout, clear session |
| POST | `/api/auth/forgot-password` | - | Send reset email |
| POST | `/api/auth/reset-password` | - | Reset password |

### Habits
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/habits` | ✓ | List user's habits |
| POST | `/api/habits` | ✓ | Create new habit |
| GET | `/api/habits/:id` | ✓ | Get habit details |
| PATCH | `/api/habits/:id` | ✓ | Update habit |
| DELETE | `/api/habits/:id` | ✓ | Delete habit |
| POST | `/api/habits/:id/logs` | ✓ | Log habit completion |
| GET | `/api/habits/:id/logs` | ✓ | Get habit logs |

### Goals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/goals` | ✓ | List user's goals |
| POST | `/api/goals` | ✓ | Create new goal |
| GET | `/api/goals/:id` | ✓ | Get goal details |
| PATCH | `/api/goals/:id` | ✓ | Update goal |
| DELETE | `/api/goals/:id` | ✓ | Delete goal |

### Reminders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reminders` | ✓ | List reminders |
| POST | `/api/reminders` | ✓ | Create reminder |
| PATCH | `/api/reminders/:id` | ✓ | Update reminder |
| DELETE | `/api/reminders/:id` | ✓ | Delete reminder |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | ✓ | Create payment order |
| POST | `/api/payment/verify` | ✓ | Verify payment |
| POST | `/api/payment/webhook` | - | Razorpay webhook |

### Wallpaper
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallpaper/image.png` | ✓ | Get wallpaper PNG |
| GET | `/w/:token` | - | Download wallpaper (public) |

### Settings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/settings` | ✓ | Get user settings |
| PATCH | `/api/settings` | ✓ | Update settings |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics` | ✓ | Get user analytics |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | - | Health check |

---

## DATABASE SCHEMA (Key Tables)

### Users
```
id (UUID)
email (unique)
passwordHash
name
publicToken (for wallpaper sharing)
plan (free/pro/premium)
subscriptionEndDate
createdAt
updatedAt
```

### Habits
```
id (UUID)
userId (FK → users)
name
description
color
category
active
createdAt
updatedAt
deletedAt (soft delete)
```

### HabitLogs
```
id (UUID)
habitId (FK → habits)
userId (FK → users)
date
done (boolean)
notes
createdAt
```

### Goals
```
id (UUID)
userId (FK → users)
title
targetDate
completed
priority
category
createdAt
updatedAt
```

### Reminders
```
id (UUID)
userId (FK → users)
habitId (FK → habits)
time
active
createdAt
updatedAt
```

### PaymentTransactions
```
id (UUID)
userId (FK → users)
provider (razorpay/stripe)
providerOrderId
amount
plan
status
createdAt
updatedAt
```

### Settings
```
id (UUID)
userId (FK → users, unique)
theme (light/dark)
language
timezone
emailNotifications
createdAt
updatedAt
```

---

## PERFORMANCE OPTIMIZATIONS

### 1. Database Level
- **Indexes** on frequently queried columns (21 indexes)
- **Connection pooling** (30 max connections)
- **Query optimization** with EXPLAIN ANALYZE
- **Partitioning** for large tables (HabitLogs by month)
- **Archive old records** monthly

### 2. Application Level
- **Server-side caching**: 5-minute Redis cache for wallpapers
- **CDN caching**: 1-hour cache for static images
- **Image optimization**: PNG compression, lazy loading
- **Query batching**: Fetch related data in one query
- **Rate limiting**: Prevent abuse (10 req/min payment, 100 req/min general)
- **Minification**: CSS and JS files minified
- **Code splitting**: Lazy load components

### 3. Frontend Level
- **Next.js Image optimization**: Automatic format conversion, resizing
- **Service Worker**: Offline support, background sync
- **Skeleton screens**: Better perceived performance
- **Intersection Observer**: Lazy load images and components
- **Local storage caching**: Cache user preferences

### 4. Infrastructure Level
- **Load balancing**: Distribute traffic across multiple instances
- **Auto-scaling**: Scale up during peak hours
- **Regional deployment**: Serve from closest region
- **Edge caching**: CloudFlare or similar

---

## SECURITY IMPLEMENTATION

### Authentication & Authorization
- JWT tokens with 7-day expiration
- NextAuth.js session management
- Password hashing (bcrypt, 10 rounds)
- Refresh token rotation
- CSRF token validation

### API Security
- Rate limiting on payment endpoints
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS protection (React auto-escaping)
- CORS headers configured

### Network Security
- HTTPS/TLS enforced
- Security headers (CSP, X-Frame-Options, etc.)
- Webhook signature verification
- API key encryption in environment variables

### Data Protection
- Database encryption at rest
- User data isolation (userId-based filtering)
- Soft deletes for data retention
- Audit logging for sensitive operations

---

## DEPLOYMENT ARCHITECTURE

### Development
```
Local Machine
├─ Next.js dev server (localhost:3000)
├─ SQLite database (local)
├─ Fake Razorpay (test mode)
└─ Cypress tests
```

### Staging
```
Vercel Staging
├─ Deployed Next.js app
├─ PostgreSQL staging database
├─ Razorpay test keys
└─ Sentry staging project
```

### Production (100k Users)
```
Vercel + AWS/GCP
├─ Next.js app × 3 replicas (load balanced)
├─ CloudFlare CDN (image caching)
├─ PostgreSQL RDS (managed, auto-backup)
├─ Redis cluster (session + cache)
├─ Razorpay + Stripe live keys
├─ Sentry production monitoring
└─ Route 53 / CloudDNS for DNS
```

---

## MONITORING & OBSERVABILITY

### Error Tracking
- **Sentry**: Real-time error alerts
- **Error Rate Threshold**: >1% triggers alert
- **Stack traces**: Captured with source maps
- **User context**: Email, user ID, browser info

### Performance Monitoring
- **Response times**: P50, P95, P99 tracked
- **Database query times**: Slow query log
- **API endpoint metrics**: Requests/second, latency
- **Resource usage**: CPU, memory, disk

### User Analytics
- **Session tracking**: Duration, pages visited
- **Funnel analysis**: Signup → Payment conversion
- **Feature usage**: Which habits, goals most used
- **Device breakdown**: Mobile vs Desktop vs Android

### Health Checks
- **Database health**: Connection pool status
- **Cache health**: Redis ping, hit rate
- **API health**: Endpoint response status
- **Webhook health**: Payment webhook success rate

---

## SCALABILITY STRATEGY

### Current (10k users)
- Single Next.js instance
- Managed PostgreSQL
- Redis for caching

### Target (100k users)
- 3+ replicas with load balancing
- Database read replicas
- Distributed caching (Redis cluster)
- CDN for static/image delivery
- Message queue for async jobs (wallpaper generation)

### Future (1M+ users)
- Microservices (payments, habits, notifications)
- Database sharding (by userId)
- Message brokers (RabbitMQ, Kafka)
- Elasticsearch for analytics
- Separate analytics database (OLAP)

---

## KEY FILES LOCATIONS

| Task | File |
|------|------|
| Start app | `src/app/page.js` |
| API routes | `src/app/api/` |
| Components | `src/components/` |
| Database models | `prisma/schema.prisma` |
| Rate limiting | `src/lib/api-rate-limit.js` |
| Security headers | `middleware.js` |
| Validation | `src/lib/validation-utils.js` |
| Database indexes | `prisma/migrations/*/migration.sql` |
| Tests | `cypress/e2e/` |
| Monitoring | `config/monitoring-alerts.json` |
| Incident response | `docs/INCIDENT_RESPONSE_PLAYBOOK.md` |

---

**Last Updated**: 2025-01-XX
**Architecture Version**: 1.0.0
**For Questions**: Review docs/ or contact team-lead@consistencygrid.com
