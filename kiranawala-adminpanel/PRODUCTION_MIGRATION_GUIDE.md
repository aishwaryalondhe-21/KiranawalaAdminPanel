# Production Database Migration Guide

## 🎯 Overview

This guide explains how to safely migrate the existing production database to support the Kiranawala Admin Panel with phone authentication and image storage.

**Important:** This migration is designed to be **NON-DESTRUCTIVE** - it only adds new tables and does not modify existing production data.

---

## 📋 What This Migration Does

### ✅ Safe Operations (No Data Loss)
1. **Creates 3 new tables:**
   - `store_admins` - For admin panel authentication with phone numbers
   - `order_status_history` - Tracks order status changes
   - `audit_logs` - Logs admin actions for compliance

2. **Adds indexes** for performance optimization on new tables

3. **Enables RLS** (Row Level Security) on new tables

4. **Creates functions:**
   - `format_phone_number()` - Format phone numbers to E.164
   - `is_valid_indian_phone()` - Validate Indian phone numbers
   - `track_order_status_change()` - Auto-track order status changes

5. **Creates view:**
   - `dashboard_stats` - Optimized view for dashboard statistics

6. **Sets up triggers:**
   - Auto-update `updated_at` on `store_admins`
   - Auto-track order status changes

### ❌ What It Does NOT Do
- Does NOT modify existing tables (`stores`, `orders`, `products`, `customers`, etc.)
- Does NOT alter existing columns or data
- Does NOT drop any tables
- Does NOT change existing constraints or indexes

---

## 🚀 Migration Steps

### Step 1: Backup Your Database (CRITICAL)

Before running any migration, **ALWAYS backup your database:**

1. Go to Supabase Dashboard
2. Navigate to Database → Backups
3. Create a manual backup
4. Wait for confirmation
5. Download backup (optional but recommended)

**DO NOT PROCEED without a backup!**

### Step 2: Review the Migration Script

1. Open `supabase/schema.sql` in your code editor
2. Review all SQL statements
3. Verify that:
   - No `DROP TABLE` statements exist
   - Only `CREATE TABLE IF NOT EXISTS` for new tables
   - No `ALTER TABLE` statements on existing production tables
   - All operations use `IF NOT EXISTS` or `CREATE OR REPLACE`

### Step 3: Run the Migration

1. **Open Supabase SQL Editor:**
   - Go to Supabase Dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Copy the migration script:**
   - Open `supabase/schema.sql`
   - Copy the ENTIRE contents
   - Paste into Supabase SQL Editor

3. **Execute the migration:**
   - Click "Run" button
   - Wait for completion (should take 5-10 seconds)
   - Check for any errors in the output

4. **Expected output:**
   ```
   Success. No rows returned.
   ```

### Step 4: Verify the Migration

Run these verification queries in Supabase SQL Editor:

```sql
-- 1. Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('store_admins', 'order_status_history', 'audit_logs')
ORDER BY table_name;

-- Expected: 3 rows returned

-- 2. Check dashboard_stats view exists
SELECT COUNT(*) FROM dashboard_stats;

-- Expected: Number of stores in your database

-- 3. Test phone number functions
SELECT format_phone_number('9876543210');
-- Expected: +919876543210

SELECT is_valid_indian_phone('+919876543210');
-- Expected: true

-- 4. Verify existing data is intact
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM products;

-- Expected: Your existing counts (should not change)
```

### Step 5: Enable Phone Authentication

1. **Go to Supabase Dashboard**
   - Navigate to Authentication → Providers
   - Find "Phone" provider
   - Toggle it to ON

2. **Configure Twilio (Required for SMS):**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Purchase an Indian phone number (+91)
   - Get your Account SID and Auth Token
   - In Supabase Phone settings:
     - Select "Twilio" as provider
     - Enter Account SID
     - Enter Auth Token
     - Enter your Twilio phone number

3. **Test SMS delivery:**
   - Click "Test" button in Supabase
   - Enter your phone number
   - Verify you receive the test SMS

### Step 6: Set Up Image Storage

1. **Create Storage Buckets:**
   - Go to Supabase Dashboard → Storage
   - Click "New Bucket"
   - Name: `store-images`
   - Public: YES (check the box)
   - Click "Create Bucket"
   
   - Repeat for `product-images` bucket

2. **Configure Bucket Policies:**
   - Click on `store-images` bucket
   - Go to "Policies" tab
   - Add policies (or let the app handle through code):
     - INSERT: Authenticated users
     - SELECT: Public
     - UPDATE: Authenticated users
     - DELETE: Authenticated users

3. **Test Upload:**
   - Click "Upload File" in bucket
   - Upload a test image
   - Verify it appears
   - Get the public URL
   - Open URL in browser to confirm public access

### Step 7: Create Admin User

1. **Start the admin panel app:**
   ```bash
   cd kiranawala-adminpanel
   npm run dev
   ```

2. **Sign up with phone number:**
   - Navigate to http://localhost:3000
   - Enter your Indian phone number (10 digits)
   - Receive OTP via SMS
   - Enter OTP to complete signup

3. **Get your user UUID:**
   ```sql
   -- In Supabase SQL Editor
   SELECT id, phone FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```

4. **Link user to store:**
   ```sql
   -- Replace placeholders with actual values
   INSERT INTO store_admins (
     user_id, 
     phone_number, 
     full_name, 
     store_id, 
     role, 
     is_active
   )
   VALUES (
     'YOUR_USER_UUID_HERE',      -- From step 3
     '+919876543210',             -- Your phone number
     'Store Owner Name',          -- Your name
     'YOUR_STORE_ID_HERE',        -- Your store's UUID from stores table
     'owner',
     true
   );
   ```

5. **Verify admin record:**
   ```sql
   SELECT * FROM store_admins WHERE phone_number = '+919876543210';
   ```

### Step 8: Test the Admin Panel

1. **Login:**
   - Go to http://localhost:3000
   - Enter your phone number
   - Receive and enter OTP
   - Should redirect to dashboard

2. **Verify Dashboard:**
   - Check if statistics load correctly
   - Verify order counts
   - Check recent orders table
   - Test navigation to all pages

3. **Check Profile:**
   - Go to Profile page
   - Verify phone number is displayed
   - Try updating your name
   - Confirm changes save

---

## 🔍 Troubleshooting

### Issue: "relation already exists" error

**Cause:** Migration was partially run before

**Solution:**
```sql
-- Check which tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('store_admins', 'order_status_history', 'audit_logs');

-- If tables exist, the migration already ran
-- Safe to proceed with app usage
```

### Issue: "function does not exist" error

**Cause:** `update_updated_at_column()` function doesn't exist

**Solution:**
```sql
-- Create the missing function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Issue: Phone authentication not working

**Checklist:**
- [ ] Phone provider enabled in Supabase
- [ ] Twilio credentials configured
- [ ] Twilio account has credits
- [ ] Phone number format is correct (+91XXXXXXXXXX)
- [ ] Test SMS works in Supabase dashboard

**Common fixes:**
1. Verify Twilio credentials are correct
2. Check Twilio balance (needs credits)
3. Ensure phone number starts with 6, 7, 8, or 9
4. Try different phone number

### Issue: OTP not received

**Checklist:**
- [ ] Phone number is correct
- [ ] Country code is +91
- [ ] Twilio account is active
- [ ] Check Twilio logs for delivery status

**Solution:**
1. Go to Twilio Dashboard
2. Check SMS logs
3. Look for delivery errors
4. Verify phone number is not blocked

### Issue: Dashboard shows all zeros

**Cause:** No store_admins record or wrong store_id

**Solution:**
```sql
-- Check if admin record exists
SELECT * FROM store_admins WHERE phone_number = '+919876543210';

-- If not found, create it (see Step 7)

-- If found, verify store_id is correct
SELECT id, name FROM stores;

-- Update store_id if wrong
UPDATE store_admins 
SET store_id = 'CORRECT_STORE_ID' 
WHERE phone_number = '+919876543210';
```

### Issue: Image upload fails

**Checklist:**
- [ ] Buckets created (`store-images`, `product-images`)
- [ ] Buckets are set to public
- [ ] User is authenticated
- [ ] File size under 5MB
- [ ] File type is image (jpg, png, webp)

**Solution:**
1. Verify buckets exist in Storage
2. Check bucket is marked as "Public"
3. Try uploading manually through Supabase UI
4. Check browser console for errors

---

## 📊 Database Schema Changes

### New Tables Created

#### 1. store_admins
```sql
Columns:
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- phone_number (TEXT, UNIQUE, format: +91XXXXXXXXXX)
- full_name (TEXT)
- store_id (UUID, FK to stores)
- role (TEXT: owner/manager/staff)
- is_active (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

Purpose: Admin authentication and authorization
```

#### 2. order_status_history
```sql
Columns:
- id (UUID, PK)
- order_id (UUID, FK to orders)
- from_status (TEXT)
- to_status (TEXT)
- changed_by (UUID, FK to store_admins)
- notes (TEXT)
- created_at (TIMESTAMPTZ)

Purpose: Track all order status changes
```

#### 3. audit_logs
```sql
Columns:
- id (UUID, PK)
- admin_id (UUID, FK to store_admins)
- action (TEXT)
- resource_type (TEXT)
- resource_id (UUID)
- old_values (JSONB)
- new_values (JSONB)
- ip_address (TEXT)
- created_at (TIMESTAMPTZ)

Purpose: Compliance and security auditing
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)

All new tables have RLS enabled with these policies:

1. **store_admins:**
   - Admins can only view/edit their own record
   - User ID must match authenticated user

2. **order_status_history:**
   - Admins can only see history for their store's orders
   - Can only create history for their store's orders

3. **audit_logs:**
   - Admins can only see their own audit logs
   - System can create logs for any admin action

### Phone Number Security

- Stored in E.164 format (+91XXXXXXXXXX)
- Validation enforced at database level
- Must start with 6, 7, 8, or 9 (Indian mobile)
- Unique constraint prevents duplicates

### Image Storage Security

- Public read access (anyone can view)
- Authenticated upload (only logged-in admins)
- File size limits enforced
- File type validation in frontend

---

## 📈 Performance Optimizations

### Indexes Added

```sql
-- store_admins
idx_store_admins_user_id
idx_store_admins_store_id
idx_store_admins_phone_number

-- order_status_history
idx_order_status_history_order_id
idx_order_status_history_created_at

-- audit_logs
idx_audit_logs_admin_id
idx_audit_logs_resource_type
idx_audit_logs_created_at
```

### Dashboard View

The `dashboard_stats` view provides optimized queries for:
- Total orders
- Pending orders
- Completed orders
- Total revenue
- Customer count
- Low stock products

This view is pre-aggregated for fast dashboard loading.

---

## 🔄 Rollback Plan

If you need to rollback the migration:

```sql
-- WARNING: This will delete all admin panel data

-- Drop new tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS store_admins CASCADE;

-- Drop view
DROP VIEW IF EXISTS dashboard_stats;

-- Drop functions
DROP FUNCTION IF EXISTS track_order_status_change();
DROP FUNCTION IF EXISTS format_phone_number(TEXT);
DROP FUNCTION IF EXISTS is_valid_indian_phone();

-- Drop triggers
DROP TRIGGER IF EXISTS track_order_status ON orders;
DROP TRIGGER IF EXISTS update_store_admins_updated_at ON store_admins;
```

**Note:** Existing production data in other tables is NOT affected by rollback.

---

## ✅ Post-Migration Checklist

- [ ] Database backup created
- [ ] Migration script reviewed
- [ ] Migration executed successfully
- [ ] All verification queries passed
- [ ] Phone authentication enabled
- [ ] Twilio configured and tested
- [ ] Storage buckets created
- [ ] Admin user created
- [ ] Admin panel login works
- [ ] Dashboard displays correctly
- [ ] Profile page works
- [ ] Image upload tested (if applicable)
- [ ] No errors in Supabase logs
- [ ] No errors in application logs

---

## 📞 Support

### Common Resources

- **Supabase Docs:** https://supabase.com/docs
- **Twilio Docs:** https://www.twilio.com/docs
- **Migration Script:** `kiranawala-adminpanel/supabase/schema.sql`
- **Sample Data:** `kiranawala-adminpanel/supabase/sample-data.sql`

### Emergency Contacts

If migration fails:
1. **DO NOT PANIC** - Your production data is safe
2. Restore from backup if needed
3. Review error messages in Supabase SQL Editor
4. Check troubleshooting section above
5. Contact support with:
   - Error message
   - Query that failed
   - Supabase project ID

---

## 🎉 Migration Complete!

Once all steps are completed and verified, your production database is ready for the admin panel!

**Status:** ✅ **READY FOR PRODUCTION USE**

---

**Last Updated:** October 27, 2025  
**Migration Version:** 1.0  
**Tested On:** Supabase PostgreSQL 15.x
