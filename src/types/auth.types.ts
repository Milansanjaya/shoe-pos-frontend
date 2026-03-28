export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'cashier';
}

export interface AuthResponse {
    token: string;
    role: 'admin' | 'cashier';
}

export interface UserRole {
    token: string | null;
    role: 'admin' | 'cashier' | null;
}
