import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Receipt, ExternalLink, Filter } from 'lucide-react';
import { saleService } from '../../api/saleService';
import PageHeader from '../../components/layout/PageHeader';
import { Sale } from '../../types/sale.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const PAYMENT_METHODS = ['All', 'Cash', 'Card', 'Transfer'] as const;

function getProductName(p: unknown): string {
    if (p && typeof p === 'object' && 'name' in p) return (p as { name: string }).name;
    return String(p);
}

function getSoldBy(u: unknown): string {
    if (u && typeof u === 'object' && 'name' in u) return (u as { name: string }).name ?? '';
    if (u && typeof u === 'object' && 'email' in u) return (u as { email: string }).email ?? '';
    return '—';
}

export default function SalesPage() {
    const [filterPayment, setFilterPayment] = useState<'All' | 'Cash' | 'Card' | 'Transfer'>('All');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const { data: sales = [], isLoading } = useQuery({
        queryKey: ['sales', filterPayment, from, to],
        queryFn: () => saleService.getAll({
            paymentMethod: filterPayment !== 'All' ? filterPayment : undefined,
            from: from || undefined,
            to: to || undefined,
        }).then(r => r.data),
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.items.length, 0);

    const handlePrint = (sale: Sale) => {
        window.open(saleService.printInvoiceUrl(sale._id), '_blank');
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <PageHeader title="Sales History" subtitle="View all completed sales transactions" />

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card py-4 text-center">
                    <p className="text-2xl font-bold text-white">{sales.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Sales</p>
                </div>
                <div className="card py-4 text-center">
                    <p className="text-2xl font-bold text-brand-400">{formatCurrency(totalRevenue)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
                </div>
                <div className="card py-4 text-center">
                    <p className="text-2xl font-bold text-white">{totalItems}</p>
                    <p className="text-xs text-gray-500 mt-1">Items Sold</p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="card py-3 flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="flex gap-1.5">
                    {PAYMENT_METHODS.map(pm => (
                        <button
                            key={pm}
                            onClick={() => setFilterPayment(pm)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterPayment === pm
                                    ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                                    : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                }`}
                        >
                            {pm}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500">From</span>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="input py-1 text-xs w-36" />
                    <span className="text-xs text-gray-500">To</span>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="input py-1 text-xs w-36" />
                    {(from || to) && (
                        <button onClick={() => { setFrom(''); setTo(''); }}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Invoice</th>
                                <th className="table-header">Items</th>
                                <th className="table-header">Subtotal</th>
                                <th className="table-header">Discount</th>
                                <th className="table-header">Grand Total</th>
                                <th className="table-header">Payment</th>
                                <th className="table-header">Sold By</th>
                                <th className="table-header">Date</th>
                                <th className="table-header"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="table-cell text-center py-10">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-400" />
                                    </td>
                                </tr>
                            )}
                            {!isLoading && sales.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="table-cell text-center text-gray-500 py-10">
                                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No sales found
                                    </td>
                                </tr>
                            )}
                            {sales.map(sale => (
                                <tr key={sale._id} className="table-row">
                                    <td className="table-cell font-mono font-semibold text-brand-400">
                                        {sale.invoiceNumber}
                                    </td>
                                    <td className="table-cell">
                                        <div className="space-y-0.5">
                                            {sale.items.map((item, i) => (
                                                <p key={i} className="text-xs text-gray-300">
                                                    {getProductName(item.product)}
                                                    <span className="text-gray-600"> × {item.quantity}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="table-cell text-gray-300">{formatCurrency(sale.totalAmount)}</td>
                                    <td className="table-cell">
                                        {sale.discountAmount > 0
                                            ? <span className="text-purple-400">-{formatCurrency(sale.discountAmount)}</span>
                                            : <span className="text-gray-600">—</span>
                                        }
                                    </td>
                                    <td className="table-cell font-bold text-white">{formatCurrency(sale.grandTotal)}</td>
                                    <td className="table-cell">
                                        <span className={`badge text-xs font-semibold px-2 py-0.5 rounded-full ${sale.paymentMethod === 'Cash' ? 'bg-green-500/15 text-green-400'
                                                : sale.paymentMethod === 'Card' ? 'bg-blue-500/15 text-blue-400'
                                                    : 'bg-cyan-500/15 text-cyan-400'
                                            }`}>
                                            {sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="table-cell text-gray-400 text-xs">{getSoldBy(sale.soldBy)}</td>
                                    <td className="table-cell text-gray-500 text-xs">{formatDate(sale.createdAt)}</td>
                                    <td className="table-cell">
                                        <button
                                            onClick={() => handlePrint(sale)}
                                            title="Print Invoice"
                                            className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
