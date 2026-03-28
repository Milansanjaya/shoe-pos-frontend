import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    role: 'admin' | 'cashier' | null;
    name: string | null;
    login: (token: string, role: 'admin' | 'cashier', name?: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            role: null,
            name: null,
            login: (token, role, name) => set({ token, role, name: name ?? null }),
            logout: () => set({ token: null, role: null, name: null }),
        }),
        { name: 'shoe-pos-auth' }
    )
);
