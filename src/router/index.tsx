import { createMemoryRouter, RouterProvider } from 'react-router-dom';
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
const SalesPage = lazy(() => import('../pages/sales/SalesPage'));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

const s = (C: React.LazyExoticComponent<any>) => (
    <Suspense fallback={<LoadingSpinner />}><C /></Suspense>
);

// createMemoryRouter: works in ALL environments including Electron file://
// because routing state is kept in memory, not in the URL
const router = createMemoryRouter([
    {
        element: <PublicRoute />,
        children: [
            { path: '/login', element: s(LoginPage) },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppShell />,
                children: [
                    { path: '/', element: s(DashboardPage) },
                    { path: '/dashboard', element: s(DashboardPage) },
                    { path: '/pos', element: s(POSPage) },
                    { path: '/products', element: s(ProductsPage) },
                    { path: '/products/new', element: s(ProductFormPage) },
                    { path: '/products/:id', element: s(ProductDetailPage) },
                    { path: '/products/:id/barcodes', element: s(BarcodePrintPage) },
                    { path: '/products/:id/edit', element: s(ProductFormPage) },
                    { path: '/purchases', element: s(PurchasesListPage) },
                    { path: '/purchases/new', element: s(PurchasePage) },
                    { path: '/purchases/:id', element: s(PurchaseDetailPage) },
                    { path: '/expenses', element: s(ExpensesPage) },
                    { path: '/stock/adjust', element: s(StockAdjustPage) },
                    { path: '/returns/new', element: s(ReturnsPage) },
                    { path: '/sales', element: s(SalesPage) },
                    { path: '/reports', element: s(ReportsPage) },
                    { path: '/closing', element: s(ClosingPage) },
                    {
                        element: <AdminRoute />,
                        children: [
                            { path: '/suppliers', element: s(SuppliersPage) },
                        ],
                    },
                ],
            },
        ],
    },
], { initialEntries: ['/'] });  // Always start at root

export default function Router() {
    return <RouterProvider router={router} />;
}
