
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'editor' | 'customer';

interface User {
    id: string;
    username: string;
    email?: string;
    role: UserRole;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
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
                const siteEmail = email.includes('@') ? email : `${email}@saada.com`;

                const { data, error } = await supabase.auth.signInWithPassword({
                    email: siteEmail,
                    password: password
                });

                if (error) return { success: false, error: error.message };

                if (data.user) {
                    const usernamePart = data.user.email?.split('@')[0] || "user";
                    let role: UserRole = 'customer';
                    
                    if (usernamePart.includes('admin')) role = 'admin';
                    else if (usernamePart.includes('editor')) role = 'editor';

                    const userData: User = {
                        id: data.user.id,
                        username: data.user.user_metadata?.username || usernamePart,
                        email: data.user.email,
                        role: role
                    };

                    set({ user: userData, isAuthenticated: true });
                    return { success: true };
                }

                return { success: false, error: "حدث خطأ غير متوقع" };
            },
            register: async (email, password, username) => {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username }
                    }
                });

                if (error) return { success: false, error: error.message };
                
                if (data.user) {
                    const userData: User = {
                        id: data.user.id,
                        username: username,
                        email: data.user.email,
                        role: 'customer'
                    };
                    set({ user: userData, isAuthenticated: true });
                    return { success: true };
                }
                return { success: false, error: "خطأ أثناء التسجيل" };
            },
            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null, isAuthenticated: false });
            },
            initialize: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const email = session.user.email || "";
                    const usernamePart = email.split('@')[0] || "";
                    let role: UserRole = 'customer';
                    
                    if (usernamePart.includes('admin')) role = 'admin';
                    else if (usernamePart.includes('editor')) role = 'editor';

                    set({
                        user: {
                            id: session.user.id,
                            username: session.user.user_metadata?.username || usernamePart,
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

