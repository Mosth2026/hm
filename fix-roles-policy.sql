-- =====================================================
-- 🔧 FIX: Infinite Recursion in user_roles Policy
-- Run this in Supabase SQL Editor NOW
-- =====================================================

-- Drop the broken policy that causes infinite recursion
DROP POLICY IF EXISTS "Admin_Manage_Roles" ON user_roles;
DROP POLICY IF EXISTS "Users_Read_Own_Role" ON user_roles;

-- Fix: Allow ALL authenticated users to READ their own role (needed for login)
CREATE POLICY "Users_Read_Own_Role" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Fix: Allow anon to read roles too (needed for initial auth check)
CREATE POLICY "Anon_Read_Roles" ON user_roles
FOR SELECT TO anon
USING (true);

-- Fix: Admin manage roles - use email check instead of self-referencing subquery
CREATE POLICY "Admin_Manage_Roles" ON user_roles
FOR ALL TO authenticated
USING (
    auth.uid() = 'f0384031-5b4b-4606-a5ad-b6be587766ee'::uuid
)
WITH CHECK (
    auth.uid() = 'f0384031-5b4b-4606-a5ad-b6be587766ee'::uuid
);

-- ✅ Verify the fix:
SELECT * FROM user_roles;
