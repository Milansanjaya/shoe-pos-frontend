import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, ShoppingBag, Calendar, Download, Loader2 } from 'lucide-react';
import { reportService } from '../../api/services';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import api from '../../api/axiosInstance';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

export default function ReportsPage() {
    // Default to current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [downloading, setDownloading] = useState(false);

    const { data: today } = useQuery({ queryKey: ['report-today'], queryFn: () => reportService.getToday().then(r => r.data) });
    const { data: monthly } = useQuery({ queryKey: ['report-monthly'], queryFn: () => reportService.getMonthly().then(r => r.data) });
    const { data: business } = useQuery({ queryKey: ['report-business'], queryFn: () => reportService.getBusinessSummary().then(r => r.data) });

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await api.get('/reports/download', {
                params: { month: selectedMonth },
                responseType: 'blob',
            });
            // Open the HTML report in a new tab — user clicks "Save as PDF / Print" button inside
            const url = URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
            window.open(url, '_blank');
            // Delay revoke so the new tab can load the blob
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } finally {
            setDownloading(false);
        }
    };

    const chartData = [
        { name: "Today's Sales", revenue: today?.totalRevenue ?? 0, profit: today?.totalProfit ?? 0 },
        { name: `${monthly?.month ?? 'Month'}`, revenue: monthly?.totalRevenue ?? 0, profit: monthly?.totalProfit ?? 0 },
        { name: 'All Time', revenue: business?.totalSalesRevenue ?? 0, profit: business?.totalProfit ?? 0 },
    ];

    const Card = ({ title, icon: Icon, revenue, profit, salesCount }: { title: string; icon: React.ElementType; revenue?: number; profit?: number; salesCount?: number }) => (
        <div className="card space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-brand-400" />
                <h3 className="section-title">{title}</h3>
            </div>
            {revenue !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Revenue</span>
                    <span className="text-white font-bold">{formatCurrency(revenue)}</span>
                </div>
            )}
            {profit !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Profit</span>
                    <span className="text-green-400 font-bold">{formatCurrency(profit)}</span>
                </div>
            )}
            {salesCount !== undefined && (
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="text-white font-bold">{salesCount}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Reports" subtitle="Sales and profit analytics" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Today" icon={ShoppingBag} revenue={today?.totalRevenue} profit={today?.totalProfit} salesCount={today?.totalSales} />
                <Card title={monthly?.month ?? 'This Month'} icon={Calendar} revenue={monthly?.totalRevenue} profit={monthly?.totalProfit} salesCount={monthly?.totalSales} />
                <Card title="All Time" icon={TrendingUp} revenue={business?.totalSalesRevenue} profit={business?.totalProfit} />
            </div>

            {/* Download Monthly Report */}
            <div className="card flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-brand-400" />
                    <h3 className="section-title">Download Monthly Report</h3>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                    <input
                        type="month"
                        value={selectedMonth}
                        max={currentMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="input py-1.5 text-sm w-40"
                    />
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        {downloading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Download className="w-4 h-4" />}
                        {downloading ? 'Loading…' : 'View PDF Report'}
                    </button>
                </div>
            </div>

            {business && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-4 h-4 text-brand-400" />
                        <h2 className="section-title">Revenue vs Profit Overview</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                                labelStyle={{ color: '#e5e7eb' }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Revenue" />
                            <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {business && (
                <div className="card">
                    <h2 className="section-title mb-4">Business Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                            <p className="text-xl font-bold text-white mt-1">{formatCurrency(business.totalSalesRevenue)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Profit</p>
                            <p className="text-xl font-bold text-green-400 mt-1">{formatCurrency(business.totalProfit)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Purchases</p>
                            <p className="text-xl font-bold text-orange-400 mt-1">{formatCurrency(business.totalPurchases)}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Products</p>
                            <p className="text-xl font-bold text-brand-400 mt-1">{business.totalProducts}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
