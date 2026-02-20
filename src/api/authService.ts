import api from './axiosInstance';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.types';

export const authService = {
    login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data),
    register: (data: RegisterPayload) => api.post('/auth/register', data),
};
