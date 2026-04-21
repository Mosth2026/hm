
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'owner' | 'manager' | 'employee' | 'customer';

interface User {
    id: string;
    username: string;
    email?: string;
    role: UserRole;
    branch_id?: number | null;
    display_name?: string;
    phone?: string;
    custom_permissions?: string[];
}

// Permission definitions per role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    owner: [
        'dashboard', 'products', 'products.write', 'products.delete',
        'orders', 'orders.manage', 'orders.delete',
        'categories', 'categories.write',
        'coupons', 'coupons.write',
        'analytics', 'payment-settings',
        'logs', 'subscribers',
        'users', 'users.create', 'users.edit', 'users.delete',
        'branches', 'import', 'export',
        'category-tree', 'store-display'
    ],
    manager: [
        'dashboard', 'products', 'products.write',
        'orders', 'orders.manage',
        'categories', 'categories.write',
        'coupons', 'coupons.write',
        'analytics',
        'logs',
        'import', 'export',
        'category-tree', 'store-display'
    ],
    employee: [
        'dashboard', 'products',
        'orders', 'orders.manage',
        'import'
    ],
    customer: []
};

// All available granular permissions for custom overrides
export const ALL_PERMISSIONS = [
    { id: 'products.write', label: 'تعديل المنتجات', icon: '📝' },
    { id: 'products.delete', label: 'حذف المنتجات', icon: '🗑️' },
    { id: 'orders.delete', label: 'حذف الطلبات', icon: '❌' },
    { id: 'coupons.write', label: 'إدارة الكوبونات', icon: '🎫' },
    { id: 'categories.write', label: 'إدارة الأقسام', icon: '📂' },
    { id: 'payment-settings', label: 'إعدادات الدفع', icon: '💳' },
    { id: 'analytics', label: 'التحليلات', icon: '📈' },
    { id: 'users', label: 'إدارة المستخدمين', icon: '👥' },
    { id: 'logs', label: 'سجل العمليات', icon: '📜' },
    { id: 'export', label: 'تصدير بيانات', icon: '📥' },
];

export const hasPermission = (user: User | null | any, permission: string): boolean => {
    if (!user) return false;
    const role = user.role || 'customer';
    const roleDefaultPerms = ROLE_PERMISSIONS[role as UserRole] || [];
    const customPerms = user.custom_permissions || [];
    return roleDefaultPerms.includes(permission) || customPerms.includes(permission);
};

export const ROLE_LABELS: Record<UserRole, string> = {
    owner: 'مالك (Owner)',
    manager: 'مدير (Manager)',
    employee: 'موظف (Employee)',
    customer: 'عميل (Customer)'
};

export const ROLE_COLORS: Record<UserRole, string> = {
    owner: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    employee: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    customer: 'bg-gray-100 text-gray-700 border-gray-200'
};

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
                    
                    // SECURE: Fetch role + branch + custom perms from database
                    let role: UserRole = 'customer';
                    let branch_id: number | null = null;
                    let display_name: string | undefined;
                    let phone: string | undefined;
                    let custom_permissions: string[] = [];
                    
                    try {
                        const { data: roleData, error: roleError } = await supabase
                            .from('user_roles')
                            .select('*')
                            .eq('user_id', data.user.id)
                            .maybeSingle();

                        if (roleError) {
                            console.error('Role fetch error:', roleError);
                        } else if (roleData?.role) {
                            role = roleData.role as UserRole;
                            branch_id = roleData.branch_id ?? null;
                            display_name = roleData.display_name;
                            phone = roleData.phone;
                            custom_permissions = roleData.custom_permissions || [];
                        }
                    } catch (e) {
                        console.error('Role fetch failed:', e);
                    }


                    const userData: User = {
                        id: data.user.id,
                        username: display_name || data.user.user_metadata?.username || usernamePart,
                        email: data.user.email,
                        role: role,
                        branch_id: branch_id,
                        display_name: display_name,
                        phone: phone,
                        custom_permissions: custom_permissions
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
                        role: 'customer',
                        custom_permissions: []
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
                    
                    // SECURE: Fetch role + branch + custom perms
                    let role: UserRole = 'customer';
                    let branch_id: number | null = null;
                    let display_name: string | undefined;
                    let phone: string | undefined;
                    let custom_permissions: string[] = [];
                    
                    try {
                        const { data: roleData } = await supabase
                            .from('user_roles')
                            .select('*')
                            .eq('user_id', session.user.id)
                            .maybeSingle();
                        
                        if (roleData?.role) {
                            role = roleData.role as UserRole;
                            branch_id = roleData.branch_id;
                            display_name = roleData.display_name;
                            phone = roleData.phone;
                            custom_permissions = roleData.custom_permissions || [];
                        }
                    } catch (e) {
                        console.error('Initial role fetch failed:', e);
                    }


                    set({
                        user: {
                            id: session.user.id,
                            username: display_name || session.user.user_metadata?.username || usernamePart,
                            email: email,
                            role: role,
                            branch_id: branch_id,
                            display_name: display_name,
                            phone: phone,
                            custom_permissions: custom_permissions
                        },
                        isAuthenticated: true
                    });
                }
            }
        }),
        {
            name: 'saada-final-auth-v2',
        }
    )
);

