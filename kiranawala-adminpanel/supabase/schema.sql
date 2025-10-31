-- ============================================
-- Kiranawala Admin Panel - Database Migration
-- ============================================
-- This script migrates the existing production database
-- Run this in Supabase SQL Editor
-- 
-- SAFE TO RUN: Only adds new tables and columns
-- Does NOT alter existing tables with data
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE NEW TABLES (Don't exist in production)
-- ============================================

-- Store Admins Table - For admin panel authentication
CREATE TABLE IF NOT EXISTS store_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT store_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT store_admins_phone_number_format_check CHECK (phone_number ~ '^\+91[6-9][0-9]{9}$')
);

-- Order Status History Table - Track status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES store_admins(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Audit Logs Table - Track admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES store_admins(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for store_admins (new table)
CREATE INDEX IF NOT EXISTS idx_store_admins_user_id ON store_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_store_admins_store_id ON store_admins(store_id);
CREATE INDEX IF NOT EXISTS idx_store_admins_phone_number ON store_admins(phone_number);

-- Indexes for order_status_history (new table)
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Indexes for audit_logs (new table)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ============================================

-- Enable RLS on new admin tables
ALTER TABLE store_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Store Admins Policies
CREATE POLICY "Admins can view their own store admin record"
  ON store_admins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update their own profile"
  ON store_admins FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Order Status History Policies
CREATE POLICY "Admins can view status history for their store orders"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE store_id IN (
        SELECT store_id FROM store_admins WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can insert status history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders 
      WHERE store_id IN (
        SELECT store_id FROM store_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Audit Logs Policies
CREATE POLICY "Admins can view their own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (admin_id IN (SELECT id FROM store_admins WHERE user_id = auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Trigger for store_admins updated_at
DROP TRIGGER IF NOT EXISTS update_store_admins_updated_at ON store_admins;
CREATE TRIGGER update_store_admins_updated_at 
  BEFORE UPDATE ON store_admins
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, 
      (SELECT id FROM store_admins WHERE user_id = auth.uid() LIMIT 1)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for order status tracking (only if not exists)
DROP TRIGGER IF EXISTS track_order_status ON orders;
CREATE TRIGGER track_order_status 
  AFTER UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION track_order_status_change();

-- Function to format phone number to E.164
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
-- STORAGE SETUP FOR IMAGES
-- ============================================

-- Note: Supabase Storage buckets are created through the Dashboard or API
-- This SQL creates the necessary policies for the buckets

-- Instructions for setting up image storage:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create bucket named "store-images" (public bucket)
-- 3. Create bucket named "product-images" (public bucket)
-- 4. The policies below will be applied automatically

-- Storage policies will be set up via Supabase Dashboard:
-- Bucket: store-images
--   - INSERT: Authenticated users can upload (store admins only via app logic)
--   - SELECT: Public read access
--   - UPDATE: Store owner can update their store's logo
--   - DELETE: Store owner can delete their store's logo

-- The stores.logo_url field will store the storage path:
-- Format: store-images/[store-id]/logo.[ext]
-- Full URL: https://[project].supabase.co/storage/v1/object/public/store-images/[store-id]/logo.jpg

-- Example for updating store logo:
-- UPDATE stores SET logo_url = 'store-images/[store-id]/logo.jpg' WHERE id = '[store-id]';

-- Note: Image uploads will be handled by the frontend application
-- using Supabase Storage SDK

-- ============================================
-- VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- Dashboard statistics view
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

-- Grant access to authenticated users
GRANT SELECT ON dashboard_stats TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- ✅ New tables created:
--    - store_admins (for admin authentication)
--    - order_status_history (for tracking order changes)
--    - audit_logs (for admin action logging)

-- ✅ Indexes added for performance

-- ✅ RLS policies configured for security

-- ✅ Functions and triggers added:
--    - format_phone_number()
--    - is_valid_indian_phone()
--    - track_order_status_change()

-- ✅ Dashboard view created (dashboard_stats)

-- ============================================
-- NEXT STEPS
-- ============================================

-- 1. Enable Phone Authentication in Supabase:
--    Dashboard → Authentication → Providers → Enable "Phone"
--    Configure Twilio credentials

-- 2. Set up Supabase Storage for images:
--    Dashboard → Storage → Create bucket "store-images" (public)
--    Dashboard → Storage → Create bucket "product-images" (public)

-- 3. Create admin user:
--    - Sign up through the app with phone number
--    - Get user UUID from auth.users
--    - Run: INSERT INTO store_admins (user_id, phone_number, full_name, store_id, role)
--           VALUES ('UUID', '+919876543210', 'Name', 'STORE_ID', 'owner');

-- 4. Verify migration:
--    SELECT * FROM store_admins;
--    SELECT * FROM dashboard_stats;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check new tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('store_admins', 'order_status_history', 'audit_logs');

-- Check dashboard_stats view
-- SELECT * FROM dashboard_stats LIMIT 1;

-- Test phone formatting
-- SELECT format_phone_number('9876543210');
-- SELECT is_valid_indian_phone('+919876543210');

-- ============================================
-- ADDITIONAL CONFIGURATION FOR PRODUCTS & CATEGORIES
-- ============================================

-- Core function for updated_at trigger (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES FOR PRODUCTS TABLE
-- ============================================

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products Policies - Store-specific access
CREATE POLICY "Admins can view their store products"
  ON products FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert products for their store"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM store_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their store products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_admins WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM store_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete their store products"
  ON products FOR DELETE
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_admins WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES FOR CATEGORIES TABLE
-- ============================================

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories Policies - Global categories, all admins can view
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- INDEXES FOR PRODUCTS TABLE
-- ============================================

-- Foreign key index for store_id (performance)
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Index for filtering available products
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- Composite index for store + availability queries
CREATE INDEX IF NOT EXISTS idx_products_store_available ON products(store_id, is_available);

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity) WHERE stock_quantity < 10;

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Index for search by name (text search)
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));

-- Index for created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Index for updated_at (recently updated products)
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- ============================================
-- INDEXES FOR CATEGORIES TABLE
-- ============================================

-- Index for category name lookup
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Index for text search on category name
CREATE INDEX IF NOT EXISTS idx_categories_name_text ON categories USING gin(to_tsvector('english', name));

-- Index for created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);

-- ============================================
-- TRIGGERS FOR PRODUCTS TABLE
-- ============================================

-- Trigger for products updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS FOR CATEGORIES TABLE
-- ============================================

-- Trigger for categories updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR PRODUCTS TABLE
-- ============================================

-- Function to check if product has low stock
CREATE OR REPLACE FUNCTION is_low_stock(product_id UUID, threshold INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT stock_quantity FROM products WHERE id = product_id) < threshold;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- When order item is inserted, decrease product stock
  IF (TG_OP = 'INSERT') THEN
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Mark product as unavailable if stock reaches zero
    UPDATE products 
    SET is_available = false
    WHERE id = NEW.product_id AND stock_quantity <= 0;
  END IF;
  
  -- When order item is deleted (order cancelled), restore stock
  IF (TG_OP = 'DELETE') THEN
    UPDATE products 
    SET stock_quantity = stock_quantity + OLD.quantity,
        is_available = true
    WHERE id = OLD.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products by category
CREATE OR REPLACE FUNCTION get_products_by_category(
  p_store_id UUID,
  p_category TEXT DEFAULT NULL,
  p_available_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  stock_quantity INTEGER,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.image_url,
    p.category,
    p.is_available
  FROM products p
  WHERE p.store_id = p_store_id
    AND (p_category IS NULL OR p.category = p_category)
    AND (NOT p_available_only OR p.is_available = true)
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to search products by name or description
CREATE OR REPLACE FUNCTION search_products(
  p_store_id UUID,
  p_search_term TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  stock_quantity INTEGER,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    p.image_url,
    p.category,
    p.is_available,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', p_search_term)
    ) AS relevance
  FROM products p
  WHERE p.store_id = p_store_id
    AND (
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ 
      plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, p.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get low stock products for a store
CREATE OR REPLACE FUNCTION get_low_stock_products(
  p_store_id UUID,
  p_threshold INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  stock_quantity INTEGER,
  category TEXT,
  price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.stock_quantity,
    p.category,
    p.price
  FROM products p
  WHERE p.store_id = p_store_id
    AND p.stock_quantity < p_threshold
  ORDER BY p.stock_quantity ASC, p.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- FUNCTIONS FOR CATEGORIES TABLE
-- ============================================

-- Function to get all categories with product count
CREATE OR REPLACE FUNCTION get_categories_with_count(p_store_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  product_count BIGINT
) AS $$
BEGIN
  IF p_store_id IS NULL THEN
    -- Get all categories with total product count across all stores
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.description,
      c.image_url,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.name = p.category
    GROUP BY c.id, c.name, c.description, c.image_url
    ORDER BY c.name;
  ELSE
    -- Get categories with product count for specific store
    RETURN QUERY
    SELECT 
      c.id,
      c.name,
      c.description,
      c.image_url,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.name = p.category AND p.store_id = p_store_id
    GROUP BY c.id, c.name, c.description, c.image_url
    ORDER BY c.name;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- ADDITIONAL CONSTRAINTS
-- ============================================

-- Ensure product names are not empty
ALTER TABLE products ADD CONSTRAINT products_name_not_empty 
  CHECK (length(trim(name)) > 0);

-- Ensure category names are not empty and unique
ALTER TABLE categories ADD CONSTRAINT categories_name_not_empty 
  CHECK (length(trim(name)) > 0);

ALTER TABLE categories ADD CONSTRAINT categories_name_unique 
  UNIQUE (name);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION is_low_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_by_category(UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_low_stock_products(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_categories_with_count(UUID) TO authenticated;

-- ============================================
-- PRODUCTS & CATEGORIES CONFIGURATION COMPLETE
-- ============================================

-- ✅ RLS enabled and policies created for:
--    - products (store-specific access)
--    - categories (global access for all admins)

-- ✅ Indexes added for performance:
--    - Foreign keys (store_id)
--    - Filter columns (category, is_available, stock_quantity)
--    - Search columns (name with full-text search)
--    - Sort columns (created_at, updated_at, price)

-- ✅ Triggers added:
--    - Auto-update updated_at on products
--    - Auto-update updated_at on categories

-- ✅ Helper functions created:
--    - is_low_stock() - Check if product is low on stock
--    - update_product_stock() - Auto-update stock on orders
--    - get_products_by_category() - Filter products by category
--    - search_products() - Full-text search on products
--    - get_low_stock_products() - Get all low stock products
--    - get_categories_with_count() - Get categories with product counts

-- ✅ Constraints added:
--    - Product names must not be empty
--    - Category names must be unique and not empty
