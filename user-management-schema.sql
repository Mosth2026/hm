-- =====================================================
-- 🔐 USER MANAGEMENT SYSTEM - Roles & Branch Assignment
-- Run this in Supabase SQL Editor
-- Date: 2026-04-12
-- =====================================================

-- =====================================================
-- 1. UPDATE user_roles TABLE - Add new columns & roles
-- =====================================================

-- Add new columns to user_roles
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('owner', 'manager', 'employee', 'admin', 'editor', 'customer'));

-- Migrate existing roles: admin -> owner, editor -> manager
UPDATE user_roles SET role = 'owner' WHERE role = 'admin';
UPDATE user_roles SET role = 'manager' WHERE role = 'editor';

-- Add custom_permissions column (Array of strings) for specific overrides
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS custom_permissions TEXT[] DEFAULT '{}';

-- Add display_name for friendly name in dashboard
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add phone for contact
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS phone TEXT;

-- =====================================================
-- 2. UPDATE RLS POLICIES for user_roles
-- =====================================================
DROP POLICY IF EXISTS "Users_Read_Own_Role" ON user_roles;
DROP POLICY IF EXISTS "Admin_Manage_Roles" ON user_roles;
DROP POLICY IF EXISTS "Anon_Read_Roles" ON user_roles;

-- All authenticated users can read their own role
CREATE POLICY "Users_Read_Own_Role" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Owner can manage all roles
CREATE POLICY "Owner_Manage_Roles" ON user_roles
FOR ALL TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'owner')
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'owner')
);

-- Owner can read ALL roles (not just own)
CREATE POLICY "Owner_Read_All_Roles" ON user_roles
FOR SELECT TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'owner')
);

-- =====================================================
-- 3. UPDATE Product/Category/Order policies to use new roles
-- =====================================================

-- Products: owner + manager + employee can read, owner + manager can write
DROP POLICY IF EXISTS "Products_Admin_Write" ON products;
CREATE POLICY "Products_Staff_Write" ON products
FOR ALL TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
);

-- Categories: owner + manager can manage
DROP POLICY IF EXISTS "Categories_Admin_Write" ON categories;
CREATE POLICY "Categories_Staff_Write" ON categories
FOR ALL TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
);

-- Orders: all staff can view, owner + manager can manage
DROP POLICY IF EXISTS "Admin_Full_Access" ON orders;
CREATE POLICY "Staff_Order_Access" ON orders
FOR ALL TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager', 'employee'))
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager', 'employee'))
);

-- Coupons: owner + manager only
DROP POLICY IF EXISTS "Coupons_Admin_Write" ON coupons;
CREATE POLICY "Coupons_Staff_Write" ON coupons
FOR ALL TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
);

-- Admin Logs: owner + manager can view/write
DROP POLICY IF EXISTS "Admin_Logs_Select" ON admin_logs;
DROP POLICY IF EXISTS "Admin_Logs_Insert" ON admin_logs;

CREATE POLICY "Staff_Logs_Select" ON admin_logs
FOR SELECT TO authenticated
USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager'))
);

CREATE POLICY "Staff_Logs_Insert" ON admin_logs
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('owner', 'manager', 'employee'))
);

-- =====================================================
-- 4. VERIFY: Check current roles
-- =====================================================
SELECT ur.user_id, ur.role, ur.custom_permissions, ur.display_name, au.email 
FROM user_roles ur 
JOIN auth.users au ON ur.user_id = au.id 
ORDER BY ur.role, ur.created_at;
