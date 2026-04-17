-- =====================================================
-- 🔧 FIX: Infinite Recursion in user_roles Policies
-- الحل الجذري لمشكلة infinite recursion في RLS
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create a SECURITY DEFINER function
-- هذه الدالة تتجاوز RLS وتمنع infinite recursion
-- تشتغل بصلاحيات المالك مش المستخدم الحالي
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- STEP 2: Drop ALL old broken policies on user_roles
DROP POLICY IF EXISTS "Admin_Manage_Roles" ON user_roles;
DROP POLICY IF EXISTS "Owner_Manage_Roles" ON user_roles;
DROP POLICY IF EXISTS "Owner_Read_All_Roles" ON user_roles;
DROP POLICY IF EXISTS "Staff_Read_All_Roles" ON user_roles;
DROP POLICY IF EXISTS "Users_Read_Own_Role" ON user_roles;
DROP POLICY IF EXISTS "Anon_Read_Roles" ON user_roles;
DROP POLICY IF EXISTS "Manager_Read_All_Roles" ON user_roles;
DROP POLICY IF EXISTS "Manager_Create_Employees" ON user_roles;

-- STEP 3: Recreate user_roles policies WITHOUT recursion
-- المستخدم يقرأ دوره هو فقط (لا يستعلم عن user_roles من داخل نفسه)
CREATE POLICY "Users_Read_Own_Role" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Staff (owner/manager) يشوف كل الأدوار — بيستخدم الدالة مش subquery
CREATE POLICY "Staff_Read_All_Roles" ON user_roles
FOR SELECT TO authenticated
USING (get_my_role() IN ('owner', 'manager'));

-- Owner يدير كل الأدوار (insert/update/delete)
CREATE POLICY "Owner_Manage_Roles" ON user_roles
FOR ALL TO authenticated
USING (get_my_role() = 'owner')
WITH CHECK (get_my_role() = 'owner');

-- Manager ينشئ مستخدمين جدد (employee فقط)
CREATE POLICY "Manager_Create_Employees" ON user_roles
FOR INSERT TO authenticated
WITH CHECK (
    get_my_role() IN ('owner', 'manager')
    AND role = 'employee'
);

-- =====================================================
-- STEP 4: Fix policies on OTHER tables (also use subquery = also broken)
-- =====================================================

-- Products
DROP POLICY IF EXISTS "Products_Staff_Write" ON products;
DROP POLICY IF EXISTS "Products_Admin_Write" ON products;
CREATE POLICY "Products_Staff_Write" ON products
FOR ALL TO authenticated
USING (get_my_role() IN ('owner', 'manager'))
WITH CHECK (get_my_role() IN ('owner', 'manager'));

-- Categories
DROP POLICY IF EXISTS "Categories_Staff_Write" ON categories;
DROP POLICY IF EXISTS "Categories_Admin_Write" ON categories;
CREATE POLICY "Categories_Staff_Write" ON categories
FOR ALL TO authenticated
USING (get_my_role() IN ('owner', 'manager'))
WITH CHECK (get_my_role() IN ('owner', 'manager'));

-- Orders
DROP POLICY IF EXISTS "Staff_Order_Access" ON orders;
DROP POLICY IF EXISTS "Admin_Full_Access" ON orders;
CREATE POLICY "Staff_Order_Access" ON orders
FOR ALL TO authenticated
USING (get_my_role() IN ('owner', 'manager', 'employee'))
WITH CHECK (get_my_role() IN ('owner', 'manager', 'employee'));

-- Coupons
DROP POLICY IF EXISTS "Coupons_Staff_Write" ON coupons;
DROP POLICY IF EXISTS "Coupons_Admin_Write" ON coupons;
CREATE POLICY "Coupons_Staff_Write" ON coupons
FOR ALL TO authenticated
USING (get_my_role() IN ('owner', 'manager'))
WITH CHECK (get_my_role() IN ('owner', 'manager'));

-- Admin Logs
DROP POLICY IF EXISTS "Staff_Logs_Select" ON admin_logs;
DROP POLICY IF EXISTS "Admin_Logs_Select" ON admin_logs;
DROP POLICY IF EXISTS "Staff_Logs_Insert" ON admin_logs;
DROP POLICY IF EXISTS "Admin_Logs_Insert" ON admin_logs;

CREATE POLICY "Staff_Logs_Select" ON admin_logs
FOR SELECT TO authenticated
USING (get_my_role() IN ('owner', 'manager'));

CREATE POLICY "Staff_Logs_Insert" ON admin_logs
FOR INSERT TO authenticated
WITH CHECK (get_my_role() IN ('owner', 'manager', 'employee'));

-- Payment Settings (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_settings') THEN
        DROP POLICY IF EXISTS "Payment_Admin_Only" ON payment_settings;
        EXECUTE 'CREATE POLICY "Payment_Admin_Only" ON payment_settings
            FOR ALL TO authenticated
            USING (get_my_role() = ''owner'')
            WITH CHECK (get_my_role() = ''owner'')';
    END IF;
END $$;

-- Branches (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches') THEN
        DROP POLICY IF EXISTS "Admin_Manage_Branches" ON branches;
        DROP POLICY IF EXISTS "Staff_Manage_Branches" ON branches;
        EXECUTE 'CREATE POLICY "Staff_Manage_Branches" ON branches
            FOR ALL TO authenticated
            USING (get_my_role() IN (''owner'', ''manager''))
            WITH CHECK (get_my_role() IN (''owner'', ''manager''))';
    END IF;
END $$;

-- =====================================================
-- STEP 5: Verify everything works
-- =====================================================
SELECT 'Function created' AS check_1;
SELECT get_my_role() AS my_current_role;
SELECT ur.user_id, ur.role, au.email
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.role;
