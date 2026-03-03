
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'editor';

interface User {
    username: string;
    email?: string;
    role: UserRole;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: async (emailRaw, password) => {
                const email = String(emailRaw || "").trim().toLowerCase();

                // 1. Attempt login via Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.includes('@') ? email : `${email}@saada.com`, // دعم الدخول بالاسم أو الإيميل
                    password: password
                });

                if (error) {
                    return { success: false, error: error.message };
                }

                if (data.user) {
                    // تحديد الدور بناءً على الإيميل أو ميتاداتا المستخدم
                    const role: UserRole = (email.includes('hesham') || email.includes('admin') || email === 'h') ? 'admin' : 'editor';

                    set({
                        user: {
                            username: data.user.email?.split('@')[0] || 'user',
                            email: data.user.email,
                            role: role
                        },
                        isAuthenticated: true
                    });
                    return { success: true };
                }

                return { success: false, error: "حدث خطأ غير متوقع" };
            },
            logout: async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('saada-final-auth-v1');
                set({ user: null, isAuthenticated: false });
            },
            initialize: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const email = session.user.email || "";
                    const role: UserRole = (email.includes('hesham') || email.includes('admin') || email === 'h') ? 'admin' : 'editor';
                    set({
                        user: {
                            username: email.split('@')[0] || 'user',
                            email: email,
                            role: role
                        },
                        isAuthenticated: true
                    });
                }
            }
        }),

        {
            name: 'saada-final-auth-v1',
        }
    )
);

