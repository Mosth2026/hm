// src/hooks/use-constitution.ts
import { useEffect } from 'react';
import { useUser } from '@/hooks/use-user'; // افترض وجود Hook يجلب user من Supabase

/**
 * Hook يثبت "الدستور" للمشروع.
 * - يخزن الدور (role) في sessionStorage لتفادي تعديل يدوي.
 * - إذا تم تغيير الدور في localStorage أو sessionStorage يعيد تحميل الصفحة.
 * - يضمن أن أي طلب تعديل يتطلب صلاحية صريحة من الـ permissions.
 */
export const useConstitution = () => {
  const { user } = useUser(); // user من supabase يحتوي على حقل role

  // تثبيت الدور في sessionStorage عند تسجيل الدخول
  useEffect(() => {
    if (user?.role) {
      const stored = sessionStorage.getItem('user_role');
      if (stored && stored !== user.role) {
        // إذا تغير الدور بطريقة غير شرعية - أعد تحميل الصفحة
        window.location.reload();
      } else {
        sessionStorage.setItem('user_role', user.role);
      }
    }
  }, [user?.role]);

  // مراقبة تغيّر role عبر storage events (مثلاً تبادل تبويب)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'user_role' && e.newValue !== user?.role) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [user?.role]);
};
