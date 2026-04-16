-- =====================================================
-- 🔧 FIX: Infinite Recursion causing Empty Orders
-- Run this in Supabase SQL Editor
-- Date: 2026-04-16
-- =====================================================

-- The user-management-schema.sql created recursive policies on user_roles
-- which causes all staff access checks to fail silently → empty orders

-- STEP 1: Drop the recursive policies on user_roles
DROP POLICY IF EXISTS "Owner_Manage_Roles" ON user_roles;
DROP POLICY IF EXISTS "Owner_Read_All_Roles" ON user_roles;

-- STEP 2: Recreate without recursion (using direct UUID comparison)
-- Owner UUID: f0384031-5b4b-4606-a5ad-b6be587766ee
CREATE POLICY "Owner_Manage_Roles" ON user_roles
FOR ALL TO authenticated
USING (auth.uid() = 'f0384031-5b4b-4606-a5ad-b6be587766ee'::uuid)
WITH CHECK (auth.uid() = 'f0384031-5b4b-4606-a5ad-b6be587766ee'::uuid);

CREATE POLICY "Owner_Read_All_Roles" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = 'f0384031-5b4b-4606-a5ad-b6be587766ee'::uuid);

-- STEP 3: Verify the fix - these should return your orders
-- SELECT count(*) FROM orders;

-- ✅ Done! Orders should now be visible in the admin dashboard.
