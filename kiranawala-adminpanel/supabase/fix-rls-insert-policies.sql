-- ============================================
-- FIX: Add Missing RLS INSERT Policies
-- ============================================
-- This fixes registration errors by adding INSERT policies
-- for stores and store_admins tables
-- ============================================

-- ============================================
-- RLS POLICY: Allow INSERT on stores table
-- ============================================

-- Policy: Authenticated users can create stores
-- This allows new users to create their store during registration
CREATE POLICY "Authenticated users can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only create a store where they are the owner
    owner_id = auth.uid()
  );

-- ============================================
-- RLS POLICY: Allow INSERT on store_admins table
-- ============================================

-- Policy: Users can create their own store_admin record
-- This allows new users to create their admin profile during registration
CREATE POLICY "Users can create their own store_admin record"
  ON store_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only create a store_admin record for themselves
    user_id = auth.uid()
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all RLS policies for stores table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'stores';

-- List all RLS policies for store_admins table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'store_admins';

-- ============================================
-- INSTRUCTIONS
-- ============================================

-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify policies were created with the verification queries above
-- 5. Test registration flow in your application

-- ============================================
-- EXPECTED RESULT
-- ============================================

-- After running this script, you should see:
-- - 1 new INSERT policy on stores table
-- - 1 new INSERT policy on store_admins table
-- 
-- Registration flow will now work:
-- 1. User verifies phone with OTP → creates auth.users record
-- 2. User fills store setup form
-- 3. createStore() → inserts into stores table (now allowed)
-- 4. createStoreAdmin() → inserts into store_admins table (now allowed)
-- 5. User redirected to dashboard

-- ============================================
-- FIX COMPLETE
-- ============================================
