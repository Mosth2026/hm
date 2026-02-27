
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'editor';

interface User {
    username: string;
    role: UserRole;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (uRaw, pRaw) => {
                const u = String(uRaw || "").trim().toLowerCase();
                const p = String(pRaw || "").trim().toLowerCase();

                console.log("LOGIN CHECK:", { u, p });

                const isHesham = u === 'hesham' || u === 'h' || u === 'هشام';
                const isPass = p === 'hfikry' || p === 'h';

                // Master bypass for testing if either matches
                if (isHesham && isPass) {
                    set({
                        user: { username: 'hesham', role: 'admin' },
                        isAuthenticated: true
                    });
                    return true;
                }

                // Default admin
                if (u === 'admin' && p === 'admin') {
                    set({
                        user: { username: 'admin', role: 'admin' },
                        isAuthenticated: true
                    });
                    return true;
                }

                // Staff
                if (u === 'mostafa' && p === 'aboumaila') {
                    set({
                        user: { username: 'mostafa', role: 'editor' },
                        isAuthenticated: true
                    });
                    return true;
                }

                return false;
            },
            logout: () => {
                localStorage.removeItem('saada-final-auth-v1');
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'saada-final-auth-v1',
        }
    )
);
