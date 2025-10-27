# Kiranawala Web Admin Panel - Architecture Document

## Project Overview

This document provides a comprehensive architecture design for the Kiranawala web-based admin panel, a production-ready dashboard for store owners to manage orders and inventory.

---

## 1. Current System Analysis

### Existing Android Application
- **Language:** Kotlin 1.9.20
- **UI Framework:** Jetpack Compose + Material Design 3
- **Architecture:** Clean Architecture with MVVM pattern
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Local Database:** Room 2.6.1
- **Dependency Injection:** Hilt 2.48
- **Async Operations:** Kotlin Coroutines + Flow

### Current Database Schema

The Kiranawala platform uses a PostgreSQL database with the following core tables:

#### 1. **customers** Table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Phone-based authentication (no email required for signup)
- Unique phone number as identifier
- Optional email field
- Profile image support

#### 2. **stores** Table
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  subscription_status TEXT DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED')),
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  delivery_time_minutes INTEGER DEFAULT 30,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Multi-store support
- Subscription-based access control
- Location-based (latitude/longitude)
- Configurable delivery settings
- Store status management

#### 3. **products** Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Store-specific products
- Category-based organization
- Stock tracking
- Availability flags
- Image support

#### 4. **orders** Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED')),
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address_id UUID REFERENCES addresses(id),
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Order status workflow
- Store and customer references
- Total amount tracking
- Delivery address reference
- Special instructions support

#### 5. **order_items** Table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Line items for orders
- Price snapshot at purchase time
- Quantity tracking

#### 6. **addresses** Table
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address_type TEXT DEFAULT 'HOME' CHECK (address_type IN ('HOME', 'WORK', 'OTHER')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Multiple addresses per customer
- Address type classification
- Default address support

#### 7. **store_reviews** Table
```sql
CREATE TABLE store_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Key Points:**
- Customer ratings and reviews
- 1-5 star rating system
- Review text support

---

## 2. Order Management Workflow

The order lifecycle follows this state machine:

```
┌─────────┐
│ PENDING │ ← Order placed by customer
└────┬────┘
     │
     ▼
┌──────────────┐
│ PROCESSING   │ ← Store accepted, preparing
└────┬─────────┘
     │
     ├─→ ┌───────────┐
     │   │ COMPLETED │ ← Order delivered
     │   └───────────┘
     │
     └─→ ┌───────────┐
         │ CANCELLED │ ← Order cancelled
         └───────────┘
         
         ┌────────┐
         │ FAILED │ ← Technical/business failure
         └────────┘
```

### Status Transitions

1. **PENDING → PROCESSING**
   - Store owner accepts the order
   - Inventory is reserved
   - Preparation begins

2. **PROCESSING → COMPLETED**
   - Order is prepared
   - Ready for delivery/pickup
   - Customer receives order

3. **PENDING/PROCESSING → CANCELLED**
   - Customer or store cancels
   - Inventory is released
   - Refund is initiated

4. **Any → FAILED**
   - Technical issues
   - Payment failure
   - Delivery failure

---

## 3. Web Admin Panel Requirements

### Functional Requirements

#### 3.1 Order Management
- **View Orders:** Display all orders with real-time updates
- **Filter Orders:** By status, date range, customer, amount
- **Order Details:** View complete order information
- **Update Status:** Accept, reject, mark as processing, complete, or cancel
- **Order History:** View past orders with analytics
- **Notifications:** Real-time alerts for new orders

#### 3.2 Inventory Management
- **Product CRUD:** Create, read, update, delete products
- **Stock Management:** Update quantities, set availability
- **Category Management:** Organize products by category
- **Image Management:** Upload and manage product images
- **Bulk Operations:** Import/export products
- **Stock Alerts:** Low stock notifications

#### 3.3 Store Profile Management
- **Store Information:** Edit name, address, contact details
- **Store Settings:** Minimum order value, delivery fee, delivery time
- **Store Hours:** Set opening and closing times
- **Store Media:** Upload logo and banner images
- **Subscription Management:** View subscription status

#### 3.4 Analytics & Reporting
- **Dashboard:** KPI cards (total orders, revenue, customers)
- **Charts:** Order trends, revenue trends, popular products
- **Reports:** Daily, weekly, monthly summaries
- **Export:** CSV, PDF, Excel formats
- **Metrics:** Average order value, customer retention, etc.

#### 3.5 User Management
- **Admin Accounts:** Create and manage admin users
- **Roles & Permissions:** OWNER, MANAGER, STAFF roles
- **Activity Logs:** Track admin actions for compliance
- **Access Control:** Restrict access by role

### Non-Functional Requirements

- **Performance:** Page load < 2 seconds, API response < 500ms
- **Reliability:** 99.9% uptime
- **Security:** HTTPS, CSRF protection, input validation
- **Scalability:** Support 1000+ stores, 10,000+ products per store
- **Usability:** Intuitive UI for non-technical users
- **Accessibility:** WCAG 2.1 AA compliance
- **Responsiveness:** Mobile-friendly design

---

## 4. Recommended Technology Stack

### Frontend
- **Framework:** Next.js 14+ (React 18+)
- **Language:** TypeScript 5.0+
- **UI Library:** shadcn/ui + Tailwind CSS 3.3+
- **State Management:** TanStack Query 5+ (server state) + Zustand 4+ (client state)
- **Forms:** React Hook Form 7+ + Zod 3+
- **Charts:** Recharts 2.10+
- **Icons:** Lucide React 0.300+
- **Notifications:** Sonner 1.2+
- **Tables:** TanStack Table 8+
- **Date Picker:** React Day Picker 8+

### Backend
- **Database:** Supabase PostgreSQL (existing)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-Time:** Supabase Realtime
- **API:** Supabase PostgREST

### Deployment
- **Platform:** Vercel
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics
- **Logging:** Vercel Logs

### Development Tools
- **Package Manager:** npm or pnpm
- **Build Tool:** Next.js built-in (Webpack)
- **Testing:** Jest + React Testing Library
- **E2E Testing:** Playwright
- **Code Quality:** ESLint + Prettier
- **Version Control:** Git + GitHub

### Why This Stack?

✅ **Production-Ready:** Used by enterprise applications  
✅ **Type-Safe:** Full TypeScript support prevents runtime errors  
✅ **Performance:** Optimized for speed and scalability  
✅ **Developer Experience:** Intuitive and well-documented  
✅ **Cost-Effective:** Minimal infrastructure costs  
✅ **Existing Integration:** Leverages current Supabase setup  
✅ **Community:** Large and active community for support  
✅ **Scalability:** Handles millions of requests per day  

---

## 5. Application Architecture

### 5.1 Clean Architecture Pattern

```
UI Layer (React Components)
    ↓
State Management Layer (React Query + Zustand)
    ↓
Service Layer (Business Logic)
    ↓
Supabase Client Layer (API Integration)
    ↓
Supabase Backend (Database)
```

### 5.2 Folder Structure

```
admin-panel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (public)
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── forgot-password/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── store/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── products/
│   │   └── store/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   ├── orders/
│   │   ├── OrdersTable.tsx
│   │   ├── OrderFilters.tsx
│   │   ├── OrderDetails.tsx
│   │   └── OrderStatusBadge.tsx
│   ├── products/
│   │   ├── ProductsTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── StockUpdate.tsx
│   │   └── ProductImage.tsx
│   └── analytics/
│       ├── DashboardCards.tsx
│       ├── OrderChart.tsx
│       ├── RevenueChart.tsx
│       └── TopProducts.tsx
├── features/                     # Feature modules
│   ├── orders/
│   │   ├── api/
│   │   │   └── useOrders.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── orderService.ts
│   │   └── types/
│   │       └── order.ts
│   ├── products/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── analytics/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── lib/                          # Utilities
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   └── store.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── helpers.ts
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── useProducts.ts
│   ├── useStore.ts
│   └── useNotifications.ts
├── types/                        # TypeScript types
│   ├── index.ts
│   ├── auth.ts
│   ├── orders.ts
│   ├── products.ts
│   ├── store.ts
│   └── analytics.ts
├── services/                     # Business logic
│   ├── authService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── storeService.ts
│   └── analyticsService.ts
├── store/                        # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
├── styles/                       # Global styles
│   ├── globals.css
│   └── variables.css
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── README.md                     # Project documentation
```

---

## 6. Authentication & Authorization

### 6.1 Admin Authentication Strategy

#### New Database Table: `store_admins`
```sql
CREATE TABLE store_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Role-Based Access Control (RBAC)

| Role | Orders | Products | Analytics | Store Settings | Admin Users |
|------|--------|----------|-----------|-----------------|-------------|
| OWNER | Full | Full | Full | Full | Full |
| MANAGER | Full | Full | Read | Read | Read |
| STAFF | Read/Update | Read | None | None | None |

### 6.2 Authentication Flow

1. **Login Page**
   - User enters email and password
   - Form validation with Zod
   - Submit to Supabase Auth

2. **Session Management**
   - Supabase creates session
   - Store in secure HTTP-only cookie
   - Automatic refresh token handling

3. **Protected Routes**
   - Middleware checks session
   - Redirect to login if invalid
   - Load user data and permissions

4. **Logout**
   - Clear session cookie
   - Redirect to login page

---

## 7. Security Considerations

### 7.1 Data Security
- **HTTPS:** All traffic encrypted
- **CSRF Protection:** Token-based CSRF protection
- **Input Validation:** Zod schemas for all inputs
- **SQL Injection Prevention:** Supabase parameterized queries
- **XSS Protection:** React auto-escaping

### 7.2 Access Control
- **Row Level Security (RLS):** Supabase RLS policies
- **Admin Isolation:** Each admin can only access their store
- **Role-Based Access:** Enforce permissions at UI and API level
- **Session Timeout:** Auto-logout after inactivity

### 7.3 Audit & Compliance
- **Audit Logging:** Track all admin actions
- **Activity Logs:** Store in database for compliance
- **Data Retention:** Follow GDPR/local regulations
- **Encryption:** Sensitive data encrypted at rest

---

## 8. Deployment Strategy

### 8.1 Development Environment
- Local development with `npm run dev`
- Hot reload for rapid iteration
- Local Supabase instance (optional)

### 8.2 Staging Environment
- Staging branch on GitHub
- Automatic deployment to staging URL
- Full testing before production

### 8.3 Production Environment
- Main branch on GitHub
- Automatic deployment to Vercel
- CDN for global distribution
- Monitoring and alerting

### 8.4 Infrastructure
- **Hosting:** Vercel (serverless)
- **Database:** Supabase (managed PostgreSQL)
- **Storage:** Supabase Storage (S3-compatible)
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Vercel Analytics

---

## 9. Real-Time Updates

### 9.1 Supabase Realtime Subscriptions

```typescript
// Subscribe to new orders
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      // Show notification
      // Update UI
    }
  )
  .subscribe();
```

### 9.2 Implementation Strategy
- Subscribe to order changes on dashboard
- Show toast notification for new orders
- Invalidate React Query cache
- Auto-refresh order list

---

## 10. Performance Optimization

### 10.1 Frontend Optimization
- Code splitting and lazy loading
- Image optimization with Next.js Image
- CSS-in-JS optimization
- Bundle size monitoring

### 10.2 Backend Optimization
- Database query optimization
- Caching with React Query
- CDN for static assets
- Compression (gzip, brotli)

### 10.3 Monitoring
- Lighthouse scores
- Core Web Vitals
- Error tracking with Sentry
- Performance metrics with Vercel Analytics

---

## Conclusion

This architecture provides a solid foundation for building a production-ready web admin panel for Kiranawala. The recommended technology stack is modern, scalable, and cost-effective, leveraging the existing Supabase infrastructure.

The clean architecture pattern ensures maintainability and scalability, while the security considerations protect user data and ensure compliance. The phased implementation approach allows for iterative development and continuous improvement.

**Next Steps:**
1. Review and approve architecture
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish CI/CD pipeline
5. Deploy to staging environment

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27  
**Status:** Ready for Implementation

