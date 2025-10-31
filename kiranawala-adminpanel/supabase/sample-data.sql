-- Sample Data for Testing Kiranawala Admin Panel
-- Run this AFTER running schema.sql

-- ==============================================
-- STEP 1: Create a test store
-- ==============================================
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

-- ==============================================
-- STEP 2: Create an admin user
-- ==============================================
-- IMPORTANT: First, create a user with Phone Auth in Supabase
-- 1. Enable Phone provider in Supabase Dashboard → Authentication → Providers
-- 2. Create user through phone authentication (signInWithOtp)
-- 3. Get the user's UUID from auth.users table
-- Replace 'YOUR_USER_UUID_HERE' with the actual UUID

-- Example query to find your user UUID:
-- SELECT id, phone FROM auth.users;

-- Once you have the UUID, uncomment and run:
/*
INSERT INTO store_admins (user_id, phone_number, full_name, store_id, role, is_active)
VALUES (
  'YOUR_USER_UUID_HERE', -- Replace with actual UUID from auth.users
  '+919876543210',
  'Admin User',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'owner',
  true
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- ==============================================
-- STEP 3: Create sample categories
-- ==============================================
INSERT INTO categories (id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Fruits & Vegetables', 'Fresh fruits and vegetables'),
('c2222222-2222-2222-2222-222222222222', 'Dairy Products', 'Milk, cheese, and dairy items'),
('c3333333-3333-3333-3333-333333333333', 'Snacks & Beverages', 'Chips, cookies, and beverages'),
('c4444444-4444-4444-4444-444444444444', 'Personal Care', 'Soaps, shampoos, and personal care'),
('c5555555-5555-5555-5555-555555555555', 'Household Items', 'Cleaning supplies and household goods')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- STEP 4: Create sample products
-- ==============================================
INSERT INTO products (name, description, price, category_id, store_id, stock_quantity, is_available) VALUES
-- Fruits & Vegetables
('Fresh Apples', 'Crisp and sweet red apples', 120.00, 'c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 50, true),
('Bananas', 'Fresh ripe bananas', 40.00, 'c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100, true),
('Tomatoes', 'Fresh red tomatoes', 30.00, 'c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, true),
('Onions', 'Fresh onions', 35.00, 'c1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 8, true),

-- Dairy Products
('Milk 1L', 'Fresh full cream milk', 60.00, 'c2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 30, true),
('Curd 500g', 'Fresh curd', 40.00, 'c2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 20, true),
('Butter 100g', 'Amul butter', 55.00, 'c2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 15, true),

-- Snacks & Beverages
('Lays Chips', 'Classic salted chips', 20.00, 'c3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 45, true),
('Coca Cola 600ml', 'Cold drink', 40.00, 'c3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 35, true),
('Parle-G Biscuits', 'Glucose biscuits', 10.00, 'c3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 60, true),

-- Personal Care
('Dove Soap', 'Moisturizing soap', 45.00, 'c4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 25, true),
('Colgate Toothpaste', 'Dental cream', 95.00, 'c4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 18, true),

-- Household Items
('Vim Bar', 'Dishwash bar', 15.00, 'c5555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 40, true),
('Tide Detergent 1kg', 'Washing powder', 150.00, 'c5555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 12, true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- STEP 5: Create sample customers
-- ==============================================
INSERT INTO customers (id, full_name, phone_number) VALUES
('d1111111-1111-1111-1111-111111111111', 'Rahul Sharma', '+919876511111'),
('d2222222-2222-2222-2222-222222222222', 'Priya Patel', '+919876522222'),
('d3333333-3333-3333-3333-333333333333', 'Amit Kumar', '+919876533333'),
('d4444444-4444-4444-4444-444444444444', 'Neha Singh', '+919876544444'),
('d5555555-5555-5555-5555-555555555555', 'Vijay Verma', '+919876555555')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- STEP 6: Create sample orders
-- ==============================================
-- Note: Using timestamps from the past few days for realistic data

-- Delivered order
INSERT INTO orders (id, order_number, customer_id, store_id, status, total_amount, delivery_address, created_at)
VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'ORD-2025-001',
  'd1111111-1111-1111-1111-111111111111',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'delivered',
  350.00,
  'Flat 101, Building A, Andheri West, Mumbai 400053',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 
  'e1111111-1111-1111-1111-111111111111',
  id,
  quantity,
  price
FROM (VALUES
  ((SELECT id FROM products WHERE name = 'Fresh Apples' LIMIT 1), 2, 120.00),
  ((SELECT id FROM products WHERE name = 'Milk 1L' LIMIT 1), 1, 60.00),
  ((SELECT id FROM products WHERE name = 'Bread' LIMIT 1), 2, 40.00)
) AS v(product_id, quantity, price)
WHERE NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id = 'e1111111-1111-1111-1111-111111111111'
);

-- Pending order
INSERT INTO orders (id, order_number, customer_id, store_id, status, total_amount, delivery_address, created_at)
VALUES (
  'e2222222-2222-2222-2222-222222222222',
  'ORD-2025-002',
  'd2222222-2222-2222-2222-222222222222',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'pending',
  280.00,
  'House 25, Sector 7, Vashi, Navi Mumbai 400703',
  NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 
  'e2222222-2222-2222-2222-222222222222',
  id,
  quantity,
  price
FROM (VALUES
  ((SELECT id FROM products WHERE name = 'Bananas' LIMIT 1), 3, 40.00),
  ((SELECT id FROM products WHERE name = 'Curd 500g' LIMIT 1), 2, 40.00),
  ((SELECT id FROM products WHERE name = 'Lays Chips' LIMIT 1), 4, 20.00)
) AS v(product_id, quantity, price)
WHERE NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id = 'e2222222-2222-2222-2222-222222222222'
);

-- Confirmed order
INSERT INTO orders (id, order_number, customer_id, store_id, status, total_amount, delivery_address, created_at)
VALUES (
  'e3333333-3333-3333-3333-333333333333',
  'ORD-2025-003',
  'd3333333-3333-3333-3333-333333333333',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'confirmed',
  195.00,
  'Bungalow 12, Palm Street, Bandra East, Mumbai 400051',
  NOW() - INTERVAL '5 hours'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 
  'e3333333-3333-3333-3333-333333333333',
  id,
  quantity,
  price
FROM (VALUES
  ((SELECT id FROM products WHERE name = 'Tomatoes' LIMIT 1), 2, 30.00),
  ((SELECT id FROM products WHERE name = 'Onions' LIMIT 1), 3, 35.00),
  ((SELECT id FROM products WHERE name = 'Dove Soap' LIMIT 1), 1, 45.00)
) AS v(product_id, quantity, price)
WHERE NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id = 'e3333333-3333-3333-3333-333333333333'
);

-- Out for delivery
INSERT INTO orders (id, order_number, customer_id, store_id, status, total_amount, delivery_address, created_at)
VALUES (
  'e4444444-4444-4444-4444-444444444444',
  'ORD-2025-004',
  'd4444444-4444-4444-4444-444444444444',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'out_for_delivery',
  445.00,
  'Apartment 503, Tower B, Powai, Mumbai 400076',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 
  'e4444444-4444-4444-4444-444444444444',
  id,
  quantity,
  price
FROM (VALUES
  ((SELECT id FROM products WHERE name = 'Milk 1L' LIMIT 1), 3, 60.00),
  ((SELECT id FROM products WHERE name = 'Butter 100g' LIMIT 1), 2, 55.00),
  ((SELECT id FROM products WHERE name = 'Tide Detergent 1kg' LIMIT 1), 1, 150.00)
) AS v(product_id, quantity, price)
WHERE NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id = 'e4444444-4444-4444-4444-444444444444'
);

-- Another pending order (recent)
INSERT INTO orders (id, order_number, customer_id, store_id, status, total_amount, delivery_address, created_at)
VALUES (
  'e5555555-5555-5555-5555-555555555555',
  'ORD-2025-005',
  'd5555555-5555-5555-5555-555555555555',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'pending',
  185.00,
  'Room 201, Hostel Complex, Malad West, Mumbai 400064',
  NOW() - INTERVAL '30 minutes'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 
  'e5555555-5555-5555-5555-555555555555',
  id,
  quantity,
  price
FROM (VALUES
  ((SELECT id FROM products WHERE name = 'Coca Cola 600ml' LIMIT 1), 2, 40.00),
  ((SELECT id FROM products WHERE name = 'Parle-G Biscuits' LIMIT 1), 5, 10.00),
  ((SELECT id FROM products WHERE name = 'Colgate Toothpaste' LIMIT 1), 1, 95.00)
) AS v(product_id, quantity, price)
WHERE NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id = 'e5555555-5555-5555-5555-555555555555'
);

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check the data
-- SELECT COUNT(*) as stores FROM stores;
-- SELECT COUNT(*) as products FROM products;
-- SELECT COUNT(*) as customers FROM customers;
-- SELECT COUNT(*) as orders FROM orders;
-- SELECT COUNT(*) as order_items FROM order_items;

-- View dashboard stats
-- SELECT * FROM dashboard_stats;

-- ==============================================
-- NOTES
-- ==============================================
-- 1. Make sure to create an auth user first in Supabase Auth Dashboard
-- 2. Then get the user_id from auth.users table
-- 3. Uncomment and update the store_admins INSERT with correct user_id
-- 4. After that, you can log in and see the dashboard with real data
