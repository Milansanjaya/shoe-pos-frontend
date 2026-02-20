import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    TruckIcon,
    Users,
    DollarSign,
    BarChart3,
    Layers,
    RotateCcw,
    LogOut,
    Store,
    Moon,
    ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'POS' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/purchases', icon: TruckIcon, label: 'Purchase' },
    { to: '/expenses', icon: DollarSign, label: 'Expenses' },
    { to: '/stock/adjust', icon: Layers, label: 'Stock' },
    { to: '/returns/new', icon: RotateCcw, label: 'Returns' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/closing', icon: Moon, label: 'Day Close' },
];

const adminItems = [
    { to: '/suppliers', icon: Users, label: 'Suppliers' },
];

export default function AppShell() {
    const { role, name, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    const allNavItems = role === 'admin' ? [...navItems, ...adminItems] : navItems;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">
            {/* Sidebar */}
            <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">ShoePOS</p>
                        <p className="text-xs text-gray-500 capitalize">{role}</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    {allNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${isActive
                                    ? 'bg-brand-600/20 text-brand-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User footer */}
                <div className="px-3 pb-4 border-t border-gray-800 pt-3">
                    <div className="flex items-center gap-2 px-2 mb-2">
                        <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-300">
                                {name ? name[0].toUpperCase() : 'U'}
                            </span>
                        </div>
                        <span className="text-sm text-gray-300 truncate flex-1">{name ?? 'User'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
