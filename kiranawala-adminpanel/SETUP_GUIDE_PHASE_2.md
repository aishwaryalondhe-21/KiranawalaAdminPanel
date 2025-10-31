# Phase 2 Setup Guide - Quick Start

## 🚀 Get Your Dashboard Running with Real Data

Follow these steps to set up your database and see the dashboard with real statistics.

---

## Step 1: Create Database Schema (5 minutes)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `fnblhmddgregqfafqkeh`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Schema Script**
   - Open the file: `supabase/schema.sql`
   - Copy ALL the content
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for success message (should take ~5 seconds)

**What this does:**
- Creates all database tables (stores, products, orders, customers, etc.)
- Sets up Row Level Security policies
- Creates indexes for performance
- Adds database functions and triggers

---

## Step 2: Create Admin User (2 minutes)

### Option A: Through Supabase Dashboard (Easier)

1. **Go to Authentication**
   - Click "Authentication" in Supabase Dashboard
   - Click "Users" tab
   - Click "Add User" button (green button)

2. **Create User**
   - Email: `admin@kiranawala.com` (or your email)
   - Password: `password123` (or your password)
   - Check "Auto Confirm User"
   - Click "Create User"

3. **Copy User ID**
   - After user is created, you'll see the user in the list
   - Click on the user email
   - Copy the "ID" (UUID format like: `123e4567-e89b-12d3-a456-426614174000`)
   - **SAVE THIS ID** - you'll need it in the next step

### Option B: Get Existing User ID

If you already have a Supabase user:

```sql
-- In Supabase SQL Editor
SELECT id, email FROM auth.users;
```

Copy the `id` of your user.

---

## Step 3: Link Admin to Store (2 minutes)

1. **Open SQL Editor Again**
   - Go back to Supabase SQL Editor
   - Click "New Query"

2. **Run This SQL** (Replace `YOUR_USER_UUID_HERE` with your actual UUID from Step 2)

```sql
-- First, verify the store exists
SELECT * FROM stores;

-- If no store exists, create one:
INSERT INTO stores (id, name, address, phone_number, email, is_active)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Kiranawala Test Store',
  '123 Main Street, Mumbai, Maharashtra 400001',
  '+91 98765 43210',
  'store@kiranawala.com',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Now link your user to the store admin table
-- REPLACE 'YOUR_USER_UUID_HERE' with your actual user ID
INSERT INTO store_admins (user_id, email, full_name, store_id, role, is_active)
VALUES (
  'YOUR_USER_UUID_HERE',  -- ⚠️ CHANGE THIS TO YOUR USER ID
  'admin@kiranawala.com',
  'Admin User',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'owner',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  store_id = EXCLUDED.store_id;

-- Verify it worked
SELECT * FROM store_admins;
```

**Example with actual UUID:**
```sql
INSERT INTO store_admins (user_id, email, full_name, store_id, role, is_active)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- This is your actual ID
  'admin@kiranawala.com',
  'Admin User',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'owner',
  true
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## Step 4: Add Sample Data (3 minutes)

1. **Open Sample Data File**
   - Open `supabase/sample-data.sql`
   - Copy ALL the content

2. **Run in SQL Editor**
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success message

**What this creates:**
- 1 Test Store
- 5 Categories (Fruits, Dairy, Snacks, Personal Care, Household)
- 14 Products (with varying stock levels)
- 5 Customers
- 5 Orders (different statuses: pending, confirmed, delivered, etc.)
- Order items for each order

---

## Step 5: Test Login (1 minute)

1. **Start Dev Server**
```bash
cd kiranawala-adminpanel
npm run dev
```

2. **Open Browser**
   - Go to: [http://localhost:3000](http://localhost:3000)

3. **Login**
   - Email: `admin@kiranawala.com` (the one you created)
   - Password: `password123` (the one you set)
   - Click "Sign in"

4. **See Your Dashboard!** 🎉
   - You should see:
     - **Total Orders:** 5
     - **Pending Orders:** 2
     - **Total Customers:** 5
     - **Total Revenue:** ₹1,455
     - **Recent Orders:** Table with 5 orders
     - **Low Stock Products:** 4 items

---

## 🎯 What You Should See

### Dashboard Statistics
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Orders: 5 │ Pending: 2      │ Customers: 5    │ Revenue: ₹1,455 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌───────────────────┬─────────────────┬──────────────────────┐
│ Completed: 1      │ Products        │ Low Stock Alert: 4   │
└───────────────────┴─────────────────┴──────────────────────┘
```

### Recent Orders Table
```
Order #      Customer        Status              Amount    Time
ORD-2025-005 Vijay Verma    Pending             ₹185     30 minutes ago
ORD-2025-004 Neha Singh     Out for Delivery    ₹445     1 day ago
ORD-2025-003 Amit Kumar     Confirmed           ₹195     5 hours ago
ORD-2025-002 Priya Patel    Pending             ₹280     2 hours ago
ORD-2025-001 Rahul Sharma   Delivered           ₹350     3 days ago
```

---

## 🐛 Troubleshooting

### Issue: Can't login / "Invalid email or password"

**Solution:**
1. Check user exists in Supabase Auth Dashboard
2. Verify email and password are correct
3. Make sure user is "Confirmed" (check Auto Confirm when creating)

### Issue: Dashboard shows all zeros

**Causes & Solutions:**

**Cause 1:** store_admins record not created
```sql
-- Check if admin record exists
SELECT * FROM store_admins WHERE user_id = 'YOUR_USER_UUID';

-- If empty, you need to run Step 3 again
```

**Cause 2:** Wrong store_id in store_admins
```sql
-- Verify your admin is linked to the correct store
SELECT sa.*, s.name 
FROM store_admins sa 
LEFT JOIN stores s ON sa.store_id = s.id 
WHERE sa.user_id = 'YOUR_USER_UUID';

-- Should show store name "Kiranawala Test Store"
```

**Cause 3:** Sample data not loaded
```sql
-- Check if orders exist
SELECT COUNT(*) FROM orders;

-- Should return 5 (if you ran sample-data.sql)
```

### Issue: "Failed to load dashboard statistics"

**Solution:**
1. Check browser console for errors (F12)
2. Verify Supabase URL in `.env.local` is correct
3. Check RLS policies are created:
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### Issue: "Network error" or "Connection failed"

**Solution:**
1. Check internet connection
2. Verify Supabase project is active
3. Check `.env.local` has correct credentials
4. Try restarting dev server:
```bash
# Ctrl+C to stop
npm run dev
```

---

## 🔍 Verification Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verify your admin account
SELECT * FROM store_admins WHERE email = 'admin@kiranawala.com';

-- 3. Check dashboard stats
SELECT * FROM dashboard_stats;

-- 4. View all orders
SELECT 
  order_number, 
  status, 
  total_amount, 
  created_at 
FROM orders 
ORDER BY created_at DESC;

-- 5. Count products by category
SELECT 
  c.name as category, 
  COUNT(p.id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.name;
```

---

## 📝 Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Check for errors
npm run build && npm run lint
```

---

## 🎯 Success Checklist

- [ ] Schema created (all tables exist)
- [ ] Auth user created in Supabase
- [ ] store_admins record created and linked
- [ ] Sample data loaded (5 orders visible)
- [ ] Can login to admin panel
- [ ] Dashboard shows real statistics (not zeros)
- [ ] Recent orders table shows 5 orders
- [ ] Profile page shows user info
- [ ] No console errors in browser (F12)

---

## 📞 Still Having Issues?

### Check These:
1. **Browser Console** (F12 → Console tab)
   - Look for red errors
   - Common issues show here first

2. **Network Tab** (F12 → Network tab)
   - Check if Supabase API calls are working
   - Look for 401/403 errors (auth issues)

3. **Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Check for query errors or RLS policy violations

### Common Error Messages:

**"User not authenticated"**
- You're not logged in
- Session expired
- Try logging out and back in

**"Missing Supabase environment variables"**
- Check `.env.local` exists
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

**"Row level security violation"**
- store_admins record not created
- Wrong user_id in store_admins
- Run Step 3 again with correct UUID

---

## 🎉 You're All Set!

Once you see the dashboard with real data:
1. Click around to explore different pages
2. Try the Profile page
3. Check the Orders, Products, Analytics pages (skeleton for now)

**Next:** Phase 3 will add full order management with filters, search, and status updates!

---

**Last Updated:** October 27, 2025  
**Phase:** 2 Complete ✅  
**Next:** Phase 3 - Order Management
