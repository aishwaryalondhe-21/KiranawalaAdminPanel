# Kiranawala Web Admin Panel - Architecture Diagrams

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     KIRANAWALA ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │  Android App         │         │  Web Admin Panel     │      │
│  │  (Customer)          │         │  (Store Owner)       │      │
│  │                      │         │                      │      │
│  │ - Browse Stores      │         │ - Manage Orders      │      │
│  │ - Place Orders       │         │ - Manage Inventory   │      │
│  │ - Track Orders       │         │ - View Analytics     │      │
│  │ - Rate Stores        │         │ - Store Settings     │      │
│  └──────────┬───────────┘         └──────────┬───────────┘      │
│             │                                 │                   │
│             └─────────────────┬───────────────┘                   │
│                               │                                   │
│                    ┌──────────▼──────────┐                       │
│                    │  Supabase Backend   │                       │
│                    │  (PostgreSQL)       │                       │
│                    │                     │                       │
│                    │ - Auth              │                       │
│                    │ - Database          │                       │
│                    │ - Storage           │                       │
│                    │ - Realtime          │                       │
│                    └─────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Web Admin Panel Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              UI LAYER (React Components)                 │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Orders    │  │  Inventory  │  │  Analytics  │     │   │
│  │  │   Module    │  │   Module    │  │   Module    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Store     │  │   Auth      │  │  Dashboard  │     │   │
│  │  │   Profile   │  │   Pages     │  │   Layout    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               ▲                                   │
│                               │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         STATE MANAGEMENT LAYER                           │   │
│  │                                                           │   │
│  │  ┌──────────────────┐      ┌──────────────────┐         │   │
│  │  │  React Query     │      │    Zustand       │         │   │
│  │  │  (Server State)  │      │  (Client State)  │         │   │
│  │  │                  │      │                  │         │   │
│  │  │ - Caching        │      │ - UI State       │         │   │
│  │  │ - Fetching       │      │ - Preferences    │         │   │
│  │  │ - Sync           │      │ - Notifications  │         │   │
│  │  └──────────────────┘      └──────────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               ▲                                   │
│                               │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           SERVICE LAYER (Business Logic)                 │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ OrderService │  │ProductService│  │ StoreService │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               ▲                                   │
│                               │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        SUPABASE CLIENT LAYER                             │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │  Postgrest   │  │    Auth      │  │   Storage    │   │   │
│  │  │  (Database)  │  │  (Sessions)  │  │  (Images)    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │         Realtime Subscriptions                   │   │   │
│  │  │    (Live Order Updates & Notifications)          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               ▲                                   │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  SUPABASE BACKEND      │
                    │  (PostgreSQL)          │
                    │                        │
                    │ - Database             │
                    │ - Auth                 │
                    │ - Storage              │
                    │ - Realtime             │
                    └────────────────────────┘
```

---

## 3. Data Flow Architecture

```
USER ACTION (Click Button)
        │
        ▼
COMPONENT EVENT HANDLER
        │
        ▼
MUTATION HOOK (React Query)
        │
        ├─→ Optimistic Update (UI)
        │
        ▼
SERVICE LAYER
        │
        ├─→ Validation (Zod)
        │
        ├─→ Error Handling
        │
        ▼
SUPABASE CLIENT
        │
        ├─→ Authentication Check
        │
        ├─→ RLS Policy Validation
        │
        ▼
DATABASE OPERATION
        │
        ├─→ INSERT / UPDATE / DELETE
        │
        ▼
RESPONSE
        │
        ├─→ Success: Query Invalidation
        │
        ├─→ Error: Rollback & Notification
        │
        ▼
UI RE-RENDER
        │
        ▼
USER SEES RESULT
```

---

## 4. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. USER VISITS /login                                       │
│     │                                                         │
│     ▼                                                         │
│  2. ENTER EMAIL & PASSWORD                                   │
│     │                                                         │
│     ▼                                                         │
│  3. SUBMIT FORM                                              │
│     │                                                         │
│     ▼                                                         │
│  4. VALIDATE INPUT (Zod)                                     │
│     │                                                         │
│     ├─→ Invalid: Show Error                                  │
│     │                                                         │
│     ▼                                                         │
│  5. CALL SUPABASE AUTH                                       │
│     │                                                         │
│     ├─→ Invalid Credentials: Show Error                      │
│     │                                                         │
│     ▼                                                         │
│  6. SESSION CREATED                                          │
│     │                                                         │
│     ├─→ Store in Secure Cookie                               │
│     │                                                         │
│     ├─→ Store in Local Storage (optional)                    │
│     │                                                         │
│     ▼                                                         │
│  7. FETCH ADMIN DATA                                         │
│     │                                                         │
│     ├─→ Store ID                                             │
│     │                                                         │
│     ├─→ Admin Role                                           │
│     │                                                         │
│     ├─→ Permissions                                          │
│     │                                                         │
│     ▼                                                         │
│  8. REDIRECT TO /dashboard                                   │
│     │                                                         │
│     ▼                                                         │
│  9. MIDDLEWARE VERIFIES SESSION                              │
│     │                                                         │
│     ├─→ Valid: Allow Access                                  │
│     │                                                         │
│     ├─→ Invalid: Redirect to /login                          │
│     │                                                         │
│     ▼                                                         │
│  10. DASHBOARD LOADS                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Order Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│              ORDER MANAGEMENT WORKFLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  CUSTOMER PLACES ORDER                                        │
│  (Android App)                                                │
│         │                                                      │
│         ▼                                                      │
│  ORDER CREATED IN DATABASE                                    │
│  Status: PENDING                                              │
│         │                                                      │
│         ▼                                                      │
│  REALTIME NOTIFICATION SENT                                   │
│  (Supabase Realtime)                                          │
│         │                                                      │
│         ▼                                                      │
│  ADMIN DASHBOARD UPDATED                                      │
│  (New Order Alert)                                            │
│         │                                                      │
│         ▼                                                      │
│  ADMIN REVIEWS ORDER                                          │
│  (Customer Info, Items, Total)                                │
│         │                                                      │
│         ├─→ ACCEPT ORDER                                      │
│         │   Status: PROCESSING                                │
│         │   │                                                  │
│         │   ▼                                                  │
│         │   PREPARE ORDER                                     │
│         │   │                                                  │
│         │   ▼                                                  │
│         │   MARK COMPLETED                                    │
│         │   Status: COMPLETED                                 │
│         │   │                                                  │
│         │   ▼                                                  │
│         │   CUSTOMER NOTIFIED                                 │
│         │   (Android App)                                     │
│         │                                                      │
│         ├─→ REJECT ORDER                                      │
│         │   Status: CANCELLED                                 │
│         │   │                                                  │
│         │   ▼                                                  │
│         │   CUSTOMER NOTIFIED                                 │
│         │   (Refund Initiated)                                │
│         │                                                      │
│         └─→ CANCEL ORDER                                      │
│             Status: CANCELLED                                 │
│             │                                                  │
│             ▼                                                  │
│             CUSTOMER NOTIFIED                                 │
│             (Refund Initiated)                                │
│                                                                │
│  ORDER APPEARS IN HISTORY                                     │
│  Analytics Updated                                            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Real-Time Updates Architecture

```
┌──────────────────────────────────────────────────────────────┐
│           REAL-TIME UPDATES (Supabase Realtime)               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  DATABASE CHANGE                                              │
│  (New Order, Status Update, etc.)                             │
│         │                                                      │
│         ▼                                                      │
│  SUPABASE DETECTS CHANGE                                      │
│  (Trigger)                                                    │
│         │                                                      │
│         ▼                                                      │
│  BROADCAST TO SUBSCRIBERS                                     │
│  (Realtime Channel)                                           │
│         │                                                      │
│         ▼                                                      │
│  ADMIN DASHBOARD RECEIVES UPDATE                              │
│  (WebSocket)                                                  │
│         │                                                      │
│         ▼                                                      │
│  REACT QUERY INVALIDATES CACHE                                │
│  (Query Key)                                                  │
│         │                                                      │
│         ▼                                                      │
│  FETCH FRESH DATA                                             │
│  (Background)                                                 │
│         │                                                      │
│         ▼                                                      │
│  UI RE-RENDERS                                                │
│  (Automatic)                                                  │
│         │                                                      │
│         ▼                                                      │
│  NOTIFICATION SHOWN                                           │
│  (Toast)                                                      │
│         │                                                      │
│         ▼                                                      │
│  ADMIN SEES LIVE UPDATE                                       │
│  (< 1 second latency)                                         │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE SCHEMA                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │   stores     │                                            │
│  ├──────────────┤                                            │
│  │ id (PK)      │◄─────────────────────────────┐            │
│  │ name         │                              │            │
│  │ address      │                              │            │
│  │ contact      │                              │            │
│  │ ...          │                              │            │
│  └──────────────┘                              │            │
│         ▲                                       │            │
│         │                                       │            │
│         │ 1:N                                   │            │
│         │                                       │            │
│  ┌──────┴──────────┐                           │            │
│  │                 │                           │            │
│  │                 │                           │            │
│  ▼                 ▼                           │            │
│ ┌──────────────┐  ┌──────────────┐            │            │
│ │  products    │  │store_admins  │            │            │
│ ├──────────────┤  ├──────────────┤            │            │
│ │ id (PK)      │  │ id (PK)      │            │            │
│ │ store_id(FK) │  │ store_id(FK) ├────────────┘            │
│ │ name         │  │ email        │                          │
│ │ price        │  │ role         │                          │
│ │ stock        │  │ ...          │                          │
│ │ ...          │  └──────────────┘                          │
│ └──────────────┘                                            │
│         ▲                                                    │
│         │                                                    │
│         │ 1:N                                                │
│         │                                                    │
│  ┌──────┴──────────┐                                        │
│  │                 │                                        │
│  │                 │                                        │
│  ▼                 ▼                                        │
│ ┌──────────────┐  ┌──────────────┐                         │
│ │order_items   │  │   orders     │                         │
│ ├──────────────┤  ├──────────────┤                         │
│ │ id (PK)      │  │ id (PK)      │                         │
│ │ order_id(FK) │  │ store_id(FK) │                         │
│ │ product_id   │  │ customer_id  │                         │
│ │ quantity     │  │ status       │                         │
│ │ price        │  │ total_amount │                         │
│ │ ...          │  │ ...          │                         │
│ └──────────────┘  └──────────────┘                         │
│                           ▲                                 │
│                           │                                 │
│                           │ 1:N                             │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │             │                          │
│                    ▼             ▼                          │
│              ┌──────────────┐  ┌──────────────┐            │
│              │  customers   │  │order_status_ │            │
│              ├──────────────┤  │   history    │            │
│              │ id (PK)      │  ├──────────────┤            │
│              │ phone        │  │ id (PK)      │            │
│              │ name         │  │ order_id(FK) │            │
│              │ ...          │  │ old_status   │            │
│              └──────────────┘  │ new_status   │            │
│                                │ ...          │            │
│                                └──────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              DEPLOYMENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  DEVELOPER                                                   │
│  (Local Machine)                                             │
│         │                                                     │
│         ├─→ npm run dev (Local Testing)                      │
│         │                                                     │
│         ├─→ npm run build (Production Build)                 │
│         │                                                     │
│         ▼                                                     │
│  GIT REPOSITORY                                              │
│  (GitHub)                                                    │
│         │                                                     │
│         ├─→ Push to main branch                              │
│         │                                                     │
│         ▼                                                     │
│  VERCEL                                                      │
│  (Deployment Platform)                                       │
│         │                                                     │
│         ├─→ Automatic Build                                  │
│         │                                                     │
│         ├─→ Run Tests                                        │
│         │                                                     │
│         ├─→ Optimize Assets                                  │
│         │                                                     │
│         ├─→ Deploy to CDN                                    │
│         │                                                     │
│         ▼                                                     │
│  PRODUCTION                                                  │
│  (Global CDN)                                                │
│         │                                                     │
│         ├─→ HTTPS Enabled                                    │
│         │                                                     │
│         ├─→ Auto-scaling                                     │
│         │                                                     │
│         ├─→ Monitoring                                       │
│         │                                                     │
│         ▼                                                     │
│  USERS ACCESS                                                │
│  (admin.kiranawala.com)                                      │
│         │                                                     │
│         ├─→ Fast Load Times                                  │
│         │                                                     │
│         ├─→ Reliable Service                                 │
│         │                                                     │
│         ├─→ Secure Connection                                │
│         │                                                     │
│         ▼                                                     │
│  MONITORING                                                  │
│  (Sentry + Vercel Analytics)                                 │
│         │                                                     │
│         ├─→ Error Tracking                                   │
│         │                                                     │
│         ├─→ Performance Metrics                              │
│         │                                                     │
│         ├─→ User Analytics                                   │
│         │                                                     │
│         ▼                                                     │
│  ALERTS & NOTIFICATIONS                                      │
│  (Slack, Email)                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27

