import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp, ShoppingBag, Package, AlertTriangle,
    DollarSign, BarChart2, Box,
} from 'lucide-react';
import { dashboardService } from '../../api/services';
import { productService } from '../../api/productService';
import StatCard from '../../components/charts/StatCard';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';

export default function DashboardPage() {
    const { data: summary, isLoading } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: () => dashboardService.getSummary().then(r => r.data),
        refetchInterval: 30000,
    });

    const { data: lowStock } = useQuery({
        queryKey: ['low-stock'],
        queryFn: () => productService.getLowStock().then(r => r.data),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Dashboard" subtitle="Real-time overview of your store" />

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Today Revenue"
                    value={formatCurrency(summary?.todayRevenue ?? 0)}
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title="Today Profit"
                    value={formatCurrency(summary?.todayProfit ?? 0)}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Today Sales"
                    value={String(summary?.todaySalesCount ?? 0)}
                    icon={ShoppingBag}
                    color="purple"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={String(summary?.lowStockCount ?? 0)}
                    icon={AlertTriangle}
                    color={summary && summary.lowStockCount > 0 ? 'red' : 'green'}
                />
            </div>

            {/* Monthly + totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard
                    title="Monthly Revenue"
                    value={formatCurrency(summary?.monthlyRevenue ?? 0)}
                    icon={BarChart2}
                    color="blue"
                />
                <StatCard
                    title="Monthly Profit"
                    value={formatCurrency(summary?.monthlyProfit ?? 0)}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Total Products"
                    value={String(summary?.totalProducts ?? 0)}
                    icon={Box}
                    color="purple"
                />
            </div>

            {/* Low stock table */}
            {lowStock && lowStock.count > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <h2 className="section-title text-yellow-400">Low Stock Items ({lowStock.count})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="table-header">Product</th>
                                    <th className="table-header">Size</th>
                                    <th className="table-header">Color</th>
                                    <th className="table-header">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.items.map((item, i) => (
                                    <tr key={i} className="table-row">
                                        <td className="table-cell font-medium text-white">{item.productName}</td>
                                        <td className="table-cell">{item.size}</td>
                                        <td className="table-cell">{item.color}</td>
                                        <td className="table-cell">
                                            <span className="badge-red">{item.stock} left</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
