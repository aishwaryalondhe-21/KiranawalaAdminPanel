-- Migration: Add Email Authentication Support
-- Date: October 31, 2025
-- Purpose: Allow email/password login alongside phone OTP for easier development

-- 1. Add email column to store_admins (if not exists)
ALTER TABLE store_admins
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create unique index on email (only if email is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_admins_email_unique
ON store_admins (email)
WHERE email IS NOT NULL;

-- 3. Add check constraint for email format
ALTER TABLE store_admins
ADD CONSTRAINT store_admins_email_format_check
CHECK (
  email IS NULL OR
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 4. Update RLS policies to handle email
-- Create function to get store_admin by email
CREATE OR REPLACE FUNCTION get_store_admin_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  phone_number TEXT,
  full_name TEXT,
  store_id UUID,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  store STORES
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    sa.id,
    sa.user_id,
    sa.email,
    sa.phone_number,
    sa.full_name,
    sa.store_id,
    sa.role,
    sa.is_active,
    sa.created_at,
    sa.updated_at,
    s.*
  FROM store_admins sa
  JOIN stores s ON sa.store_id = s.id
  WHERE sa.email = user_email AND sa.is_active = true;
$$;

-- 5. Update RLS policy for store_admins (add email support)
DROP POLICY IF EXISTS "Users can view own admin record" ON store_admins;

CREATE POLICY "Users can view own admin record"
ON store_admins
FOR SELECT
USING (
  auth.uid() = user_id
  OR email = auth.jwt() ->> 'email'
);

-- 6. Update RLS policy for stores (add email support)
DROP POLICY IF EXISTS "Users can view own store" ON stores;

CREATE POLICY "Users can view own store"
ON stores
FOR SELECT
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM store_admins sa
    WHERE sa.store_id = stores.id
    AND (
      sa.user_id = auth.uid()
      OR sa.email = auth.jwt() ->> 'email'
    )
    AND sa.is_active = true
  )
);

-- 7. Add comment for documentation
COMMENT ON COLUMN store_admins.email IS 'Optional email for authentication. Can use either email or phone_number for login.';

-- Migration completed!
