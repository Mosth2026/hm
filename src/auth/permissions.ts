// src/auth/permissions.ts
import type { User } from '@supabase/supabase-js';
import { Role, Permissions } from './roles';

/**
 * Checks whether a given user has the requested permission.
 * Returns true if the user's role is listed in the permission array.
 */
export const hasPermission = (user: User | null, permissionKey: keyof typeof Permissions): boolean => {
  if (!user?.role) return false;
  const role = user.role as Role;
  const allowedRoles = Permissions[permissionKey] as Role[];
  return allowedRoles.includes(role);
};
