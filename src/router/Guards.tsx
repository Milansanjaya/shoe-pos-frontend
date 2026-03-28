import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const ProtectedRoute = () => {
    const token = useAuthStore((s) => s.token);
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
    const role = useAuthStore((s) => s.role);
    return role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export const PublicRoute = () => {
    const token = useAuthStore((s) => s.token);
    return !token ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
