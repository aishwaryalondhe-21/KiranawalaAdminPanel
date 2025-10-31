-- Migration: Replace Email Authentication with Phone Number Authentication
-- Run this AFTER the initial schema.sql

-- ============================================
-- STEP 1: Backup existing data (if needed)
-- ============================================
-- CREATE TABLE store_admins_backup AS SELECT * FROM store_admins;

-- ============================================
-- STEP 2: Modify store_admins table
-- ============================================

-- Add phone_number column if it doesn't exist
ALTER TABLE store_admins 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Remove email column (after migration)
-- First, remove the unique constraint on email if it exists
ALTER TABLE store_admins 
DROP CONSTRAINT IF EXISTS store_admins_email_key;

-- Drop email column
ALTER TABLE store_admins 
DROP COLUMN IF EXISTS email;

-- Add unique constraint on phone_number
ALTER TABLE store_admins 
ADD CONSTRAINT store_admins_phone_number_key UNIQUE (phone_number);

-- Add constraint to ensure phone number format (Indian format)
ALTER TABLE store_admins
ADD CONSTRAINT store_admins_phone_number_format_check 
CHECK (phone_number ~ '^\+91[0-9]{10}$');

-- Make phone_number NOT NULL (after existing data is migrated)
ALTER TABLE store_admins
ALTER COLUMN phone_number SET NOT NULL;

-- Update the updated_at trigger (already exists from schema.sql)

-- ============================================
-- STEP 3: Update customers table (optional)
-- ============================================

-- If customers need phone authentication too:
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS phone_number_primary TEXT;

-- Keep existing phone_number as secondary contact
-- Add unique constraint on primary phone
ALTER TABLE customers
ADD CONSTRAINT customers_phone_number_primary_key UNIQUE (phone_number_primary);

-- ============================================
-- STEP 4: Update stores table
-- ============================================

-- Stores already have phone_number, but let's ensure format
ALTER TABLE stores
DROP CONSTRAINT IF EXISTS stores_phone_number_format_check;

ALTER TABLE stores
ADD CONSTRAINT stores_phone_number_format_check 
CHECK (phone_number IS NULL OR phone_number ~ '^\+91[0-9]{10}$');

-- ============================================
-- STEP 5: Update RLS Policies
-- ============================================

-- Drop existing policies that reference email
DROP POLICY IF EXISTS "Admins can view their own store admin record" ON store_admins;
DROP POLICY IF EXISTS "Admins can update their own profile" ON store_admins;

-- Create new policies using phone_number
CREATE POLICY "Admins can view their own store admin record"
  ON store_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update their own profile"
  ON store_admins FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- STEP 6: Create helper functions
-- ============================================

-- Function to format phone number
CREATE OR REPLACE FUNCTION format_phone_number(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-digit characters
  phone := regexp_replace(phone, '[^0-9]', '', 'g');
  
  -- If starts with 91, add +
  IF phone ~ '^91' THEN
    RETURN '+' || phone;
  END IF;
  
  -- If 10 digits, add +91
  IF length(phone) = 10 THEN
    RETURN '+91' || phone;
  END IF;
  
  -- If 11 digits starting with 0, remove 0 and add +91
  IF length(phone) = 11 AND phone ~ '^0' THEN
    RETURN '+91' || substring(phone FROM 2);
  END IF;
  
  -- Return as is with + if not in recognized format
  IF phone ~ '^[0-9]+$' THEN
    RETURN '+' || phone;
  END IF;
  
  RETURN phone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate Indian phone number
CREATE OR REPLACE FUNCTION is_valid_indian_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN phone ~ '^\+91[6-9][0-9]{9}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- STEP 7: Update dashboard_stats view
-- ============================================

-- Recreate the view (it should work the same, just documenting)
DROP VIEW IF EXISTS dashboard_stats;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  s.id as store_id,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as completed_orders,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.status != 'cancelled'), 0) as total_revenue,
  COUNT(DISTINCT o.customer_id) as total_customers,
  COUNT(DISTINCT p.id) FILTER (WHERE p.stock_quantity < 10) as low_stock_products
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
LEFT JOIN products p ON s.id = p.store_id
GROUP BY s.id;

GRANT SELECT ON dashboard_stats TO authenticated;

-- ============================================
-- STEP 8: Sample data update (for testing)
-- ============================================

-- Update existing test admin with phone number
-- Replace 'YOUR_USER_UUID_HERE' with actual UUID from auth.users
/*
UPDATE store_admins 
SET phone_number = '+919876543210'
WHERE user_id = 'YOUR_USER_UUID_HERE';
*/

-- ============================================
-- STEP 9: Verification queries
-- ============================================

-- Verify the changes
-- SELECT * FROM store_admins;
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'store_admins';

-- Test phone number formatting
-- SELECT format_phone_number('9876543210');  -- Should return +919876543210
-- SELECT format_phone_number('919876543210'); -- Should return +919876543210
-- SELECT format_phone_number('+919876543210'); -- Should return +919876543210

-- Test phone validation
-- SELECT is_valid_indian_phone('+919876543210'); -- Should return true
-- SELECT is_valid_indian_phone('+911234567890'); -- Should return false (starts with 1)
-- SELECT is_valid_indian_phone('9876543210'); -- Should return false (no +91)

-- ============================================
-- NOTES
-- ============================================

-- IMPORTANT: Supabase Phone Authentication Setup
-- 1. Go to Supabase Dashboard → Authentication → Providers
-- 2. Enable "Phone" provider
-- 3. Configure SMS provider (Twilio, MessageBird, etc.)
-- 4. For India, use Twilio with Indian phone numbers
-- 5. Add your Twilio credentials in Supabase settings

-- After this migration:
-- 1. Users will sign in with phone number + OTP
-- 2. No passwords required
-- 3. Phone numbers stored in format: +919876543210
-- 4. All existing email references removed

-- For existing users:
-- 1. They need to re-register with phone number
-- 2. Or manually migrate their data with phone numbers

-- Testing locally:
-- 1. You can disable phone verification in Supabase for development
-- 2. Or use Twilio test credentials
-- 3. Or mock OTP verification in development mode
