// src/hooks/use-constitution.ts
// ======================================================================
// 🏛️ دستور المشروع – نظام حماية مركزي لاستقرار الأدوار والصلاحيات
// ======================================================================
// هذا الـ Hook يضمن:
// 1. تثبيت role المستخدم في sessionStorage لمنع التلاعب
// 2. مراقبة أي تغيير غير مصرح به في الدور
// 3. إعادة تحميل الصفحة إذا تم تعديل الدور بطريقة غير شرعية
// ======================================================================

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export const useConstitution = () => {
  const user = useAuth((state) => state.user);

  // تثبيت الدور في sessionStorage عند تسجيل الدخول
  useEffect(() => {
    if (user?.role) {
      const stored = sessionStorage.getItem('saada_user_role');
      if (stored && stored !== user.role) {
        // إذا تغير الدور بطريقة غير شرعية – أعد تحميل الصفحة
        console.warn('🚨 Constitution violation: Role tampered! Reloading...');
        sessionStorage.removeItem('saada_user_role');
        window.location.reload();
      } else {
        sessionStorage.setItem('saada_user_role', user.role);
      }
    } else {
      // المستخدم مش مسجل دخول – نمسح الدور المحفوظ
      sessionStorage.removeItem('saada_user_role');
    }
  }, [user?.role]);

  // مراقبة تغيّر role عبر storage events (مثلاً من تبويب آخر)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'saada_user_role' && user?.role && e.newValue !== user.role) {
        console.warn('🚨 Constitution violation: Cross-tab role change detected!');
        window.location.reload();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [user?.role]);
};
