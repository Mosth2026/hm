// src/auth/roles.ts
// ======================================================================
// 🏛️ نقطة مرجعية واحدة للأدوار – يعيد تصدير من use-auth.ts
// ======================================================================
// لا تعدّل الأدوار هنا! عدّلها في src/hooks/use-auth.ts
// هذا الملف موجود فقط للتنظيم والوضوح
// ======================================================================

export { 
  ROLE_PERMISSIONS, 
  ROLE_LABELS, 
  ROLE_COLORS, 
  ALL_PERMISSIONS, 
  hasPermission 
} from '@/hooks/use-auth';

export type { UserRole } from '@/hooks/use-auth';
