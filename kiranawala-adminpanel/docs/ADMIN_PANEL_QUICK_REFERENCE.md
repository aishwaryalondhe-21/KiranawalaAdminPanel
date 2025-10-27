# Kiranawala Web Admin Panel - Quick Reference Guide

## Project Quick Facts

| Aspect | Details |
|--------|---------|
| **Project Name** | Kiranawala Store Admin Dashboard |
| **Type** | Web-based admin panel for store owners |
| **Target Users** | Local shopkeepers (non-technical) |
| **Timeline** | 8-12 weeks (phased) |
| **Team Size** | 2-3 developers |
| **Primary Language** | TypeScript + React |
| **Backend** | Supabase (existing) |
| **Deployment** | Vercel |

---

## Technology Stack at a Glance

```
Frontend:  Next.js 14 + React + TypeScript
UI:        shadcn/ui + Tailwind CSS
State:     TanStack Query + Zustand
Forms:     React Hook Form + Zod
Backend:   Supabase (PostgreSQL + Auth + Storage)
Hosting:   Vercel
```

---

## Database Schema Summary

### Core Tables
- **stores** - Store information and subscription status
- **products** - Product catalog with inventory
- **orders** - Customer orders with status tracking
- **order_items** - Line items for orders
- **customers** - Customer profiles (phone-based)
- **addresses** - Multiple addresses per customer
- **store_reviews** - Customer ratings and reviews

### New Tables (Admin Panel)
- **store_admins** - Admin user accounts with roles
- **audit_logs** - Action logging for compliance
- **order_status_history** - Order status change tracking

---

## Order Status Workflow

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

---

## Key Features by Phase

### Phase 1-2: Foundation & Auth (Weeks 1-4)
- ✅ Project setup and configuration
- ✅ Supabase integration
- ✅ Admin authentication (email/password)
- ✅ Dashboard layout and navigation
- ✅ Protected routes

### Phase 3: Order Management (Weeks 5-6)
- ✅ Order listing with filters
- ✅ Order details view
- ✅ Status management (accept/reject/complete/cancel)
- ✅ Real-time notifications
- ✅ Order analytics

### Phase 4: Inventory Management (Weeks 7-8)
- ✅ Product CRUD operations
- ✅ Stock management
- ✅ Category management
- ✅ Image uploads
- ✅ Bulk operations

### Phase 5: Analytics & Reporting (Weeks 9-10)
- ✅ Dashboard analytics
- ✅ Charts and visualizations
- ✅ Reports (daily, weekly, monthly)
- ✅ Export functionality (CSV, PDF)

### Phase 6-7: Testing & Launch (Weeks 11-13+)
- ✅ Comprehensive testing
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Production deployment
- ✅ Monitoring setup

---

## File Structure Overview

```
admin-panel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Protected routes
│   │   ├── orders/
│   │   ├── products/
│   │   ├── analytics/
│   │   └── store/
│   └── api/                      # API routes
├── components/                   # React components
│   ├── ui/                       # shadcn/ui
│   ├── layouts/
│   ├── orders/
│   ├── products/
│   └── analytics/
├── features/                     # Feature modules
│   ├── orders/
│   ├── products/
│   └── analytics/
├── lib/                          # Utilities
│   ├── supabase/
│   ├── validations/
│   └── utils/
├── hooks/                        # Custom hooks
├── types/                        # TypeScript types
├── services/                     # Business logic
└── styles/                       # Global styles
```

---

## Authentication Flow

```
1. User visits /login
   ↓
2. Enters email and password
   ↓
3. Supabase Auth validates credentials
   ↓
4. Session created and stored in secure cookie
   ↓
5. Redirect to /dashboard
   ↓
6. Middleware verifies session
   ↓
7. Dashboard loads with user data
```

---

## Order Management Flow

```
Customer Places Order
        ↓
Order appears in Admin Dashboard (PENDING)
        ↓
Admin Reviews Order Details
        ↓
Admin Accepts Order → Status: PROCESSING
        ↓
Admin Marks as Completed → Status: COMPLETED
        ↓
Order appears in Order History
        ↓
Analytics Updated
```

---

## Real-Time Updates

**Implementation:** Supabase Realtime Subscriptions

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

---

## API Endpoints Quick Reference

### Orders
```
GET    /api/orders                 - List all orders
GET    /api/orders/:id             - Get order details
PATCH  /api/orders/:id/status      - Update status
POST   /api/orders/:id/cancel      - Cancel order
```

### Products
```
GET    /api/products               - List products
POST   /api/products               - Create product
PATCH  /api/products/:id           - Update product
DELETE /api/products/:id           - Delete product
PATCH  /api/products/:id/stock     - Update stock
```

### Store
```
GET    /api/store                  - Get store info
PATCH  /api/store                  - Update store info
```

---

## Component Hierarchy

```
DashboardLayout
├── Sidebar
├── TopNav
└── MainContent
    ├── OrdersPage
    │   ├── OrdersTable
    │   ├── OrderFilters
    │   └── OrderDetails
    ├── ProductsPage
    │   ├── ProductsTable
    │   ├── ProductForm
    │   └── StockUpdate
    └── AnalyticsPage
        ├── DashboardCards
        ├── OrderChart
        └── RevenueChart
```

---

## State Management Pattern

```
User Action
    ↓
Component Event Handler
    ↓
Mutation Hook (React Query)
    ↓
Service Layer
    ↓
Supabase API
    ↓
Database Update
    ↓
Query Invalidation
    ↓
UI Re-render
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| API Response | < 500ms |
| Time to Interactive | < 3 seconds |
| Lighthouse Score | > 90 |
| Core Web Vitals | All Green |
| Uptime | 99.9% |

---

## Security Checklist

- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Supabase parameterized queries)
- [ ] XSS protection (React auto-escaping)
- [ ] Rate limiting implemented
- [ ] Session timeout configured
- [ ] Audit logging enabled
- [ ] RLS policies configured
- [ ] Secrets in environment variables

---

## Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Jest | > 80% |
| Component | React Testing Library | > 70% |
| Integration | Jest + RTL | > 60% |
| E2E | Playwright | Critical paths |

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Supabase storage configured
- [ ] Error tracking (Sentry) setup
- [ ] Analytics configured
- [ ] Monitoring alerts set
- [ ] Backup strategy in place
- [ ] SSL certificate valid
- [ ] CDN configured

---

## Common Tasks

### Add a New Feature
1. Create feature folder in `features/`
2. Create types in `types/`
3. Create service in `services/`
4. Create custom hook in `hooks/`
5. Create components in `components/`
6. Add route in `app/`
7. Write tests

### Update Database Schema
1. Create migration in Supabase
2. Update TypeScript types
3. Update RLS policies
4. Update services
5. Test thoroughly

### Deploy to Production
1. Run tests: `npm test`
2. Build: `npm run build`
3. Push to main branch
4. Vercel auto-deploys
5. Monitor for errors

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data

# Deployment
npm run deploy          # Deploy to Vercel
```

---

## Key Contacts & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [React Query Docs](https://tanstack.com/query)

### Support
- GitHub Issues: Project repository
- Slack: Team communication
- Email: team@kiranawala.com

---

## Success Metrics

1. **Functionality:** 100% of features working
2. **Performance:** All targets met
3. **Reliability:** 99.9% uptime
4. **User Satisfaction:** NPS > 50
5. **Security:** Zero critical vulnerabilities
6. **Adoption:** > 80% of store owners using

---

## Next Steps

1. **Week 1:** Team kickoff and environment setup
2. **Week 2:** Create UI mockups and finalize design
3. **Week 3:** Begin Phase 1 implementation
4. **Weekly:** Sprint reviews and planning
5. **Ongoing:** Continuous integration and deployment

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2025-10-27  
**Status:** Ready for Development

