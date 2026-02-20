import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute, AdminRoute, PublicRoute } from './Guards';
import AppShell from '../components/layout/AppShell';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const POSPage = lazy(() => import('../pages/pos/POSPage'));
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage'));
const BarcodePrintPage = lazy(() => import('../pages/products/BarcodePrintPage'));
const ProductFormPage = lazy(() => import('../pages/products/ProductFormPage'));
const PurchasesListPage = lazy(() => import('../pages/purchases/PurchasesListPage'));
const PurchaseDetailPage = lazy(() => import('../pages/purchases/PurchaseDetailPage'));
const PurchasePage = lazy(() => import('../pages/purchases/PurchasePage'));
const SuppliersPage = lazy(() => import('../pages/suppliers/SuppliersPage'));
const ExpensesPage = lazy(() => import('../pages/expenses/ExpensesPage'));
const StockAdjustPage = lazy(() => import('../pages/stock/StockAdjustPage'));
const ReturnsPage = lazy(() => import('../pages/returns/ReturnsPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const ClosingPage = lazy(() => import('../pages/closing/ClosingPage'));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: '/login', element: <Suspense fallback={<LoadingSpinner />}><LoginPage /></Suspense> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppShell />,
                children: [
                    { path: '/', element: <Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense> },
                    { path: '/dashboard', element: <Suspense fallback={<LoadingSpinner />}><DashboardPage /></Suspense> },
                    { path: '/pos', element: <Suspense fallback={<LoadingSpinner />}><POSPage /></Suspense> },
                    { path: '/products', element: <Suspense fallback={<LoadingSpinner />}><ProductsPage /></Suspense> },
                    { path: '/products/new', element: <Suspense fallback={<LoadingSpinner />}><ProductFormPage /></Suspense> },
                    { path: '/products/:id', element: <Suspense fallback={<LoadingSpinner />}><ProductDetailPage /></Suspense> },
                    { path: '/products/:id/barcodes', element: <Suspense fallback={<LoadingSpinner />}><BarcodePrintPage /></Suspense> },
                    { path: '/products/:id/edit', element: <Suspense fallback={<LoadingSpinner />}><ProductFormPage /></Suspense> },
                    { path: '/purchases', element: <Suspense fallback={<LoadingSpinner />}><PurchasesListPage /></Suspense> },
                    { path: '/purchases/new', element: <Suspense fallback={<LoadingSpinner />}><PurchasePage /></Suspense> },
                    { path: '/purchases/:id', element: <Suspense fallback={<LoadingSpinner />}><PurchaseDetailPage /></Suspense> },
                    { path: '/expenses', element: <Suspense fallback={<LoadingSpinner />}><ExpensesPage /></Suspense> },
                    { path: '/stock/adjust', element: <Suspense fallback={<LoadingSpinner />}><StockAdjustPage /></Suspense> },
                    { path: '/returns/new', element: <Suspense fallback={<LoadingSpinner />}><ReturnsPage /></Suspense> },
                    { path: '/reports', element: <Suspense fallback={<LoadingSpinner />}><ReportsPage /></Suspense> },
                    { path: '/closing', element: <Suspense fallback={<LoadingSpinner />}><ClosingPage /></Suspense> },
                    {
                        element: <AdminRoute />,
                        children: [
                            { path: '/suppliers', element: <Suspense fallback={<LoadingSpinner />}><SuppliersPage /></Suspense> },
                        ],
                    },
                ],
            },
        ],
    },
]);

export default function Router() {
    return <RouterProvider router={router} />;
}
