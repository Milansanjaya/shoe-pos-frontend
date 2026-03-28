import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, User, Calendar } from 'lucide-react';
import { purchaseService } from '../../api/purchaseService';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function PurchaseDetailPage() {
    const { id } = useParams();

    const { data: purchase, isLoading } = useQuery({
        queryKey: ['purchase', id],
        queryFn: () => purchaseService.getById(id!).then(r => r.data),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!purchase) return <div className="p-6 text-gray-500">Purchase not found</div>;

    const supplier = typeof purchase.supplier === 'object' && purchase.supplier ? purchase.supplier : null;
    const purchasedBy = typeof purchase.purchasedBy === 'object' && purchase.purchasedBy
        ? (purchase.purchasedBy as { name?: string; email?: string })
        : null;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <Link to="/purchases" className="btn-ghost p-2">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <PageHeader title={purchase.purchaseNumber ?? 'Purchase Detail'} />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Total</p>
                        <p className="font-bold text-white">{formatCurrency(purchase.totalAmount)}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Items</p>
                        <p className="font-bold text-white">{purchase.items?.length ?? 0}</p>
                    </div>
                </div>
                {supplier && (
                    <div className="card flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 uppercase">Supplier</p>
                            <p className="font-bold text-white truncate">{supplier.name}</p>
                        </div>
                    </div>
                )}
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Date</p>
                        <p className="font-bold text-white text-xs">{formatDateTime(purchase.createdAt)}</p>
                    </div>
                </div>
            </div>

            {purchasedBy && (
                <p className="text-xs text-gray-500">Purchased by: <span className="text-gray-300">{purchasedBy.name ?? purchasedBy.email ?? '—'}</span></p>
            )}

            {/* Items table */}
            <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-400" />
                    <h2 className="section-title">Purchased Items</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Product</th>
                                <th className="table-header">Size</th>
                                <th className="table-header">Color</th>
                                <th className="table-header">Qty</th>
                                <th className="table-header">Cost Price</th>
                                <th className="table-header">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchase.items?.map((item, i) => {
                                const productInfo = typeof item.product === 'object' && item.product
                                    ? (item.product as { name?: string; brand?: string })
                                    : null;
                                return (
                                    <tr key={i} className="table-row">
                                        <td className="table-cell font-medium text-white">
                                            {productInfo?.name ?? 'Unknown'}
                                            {productInfo?.brand && <span className="text-gray-500 text-xs ml-1">({productInfo.brand})</span>}
                                        </td>
                                        <td className="table-cell">{item.size}</td>
                                        <td className="table-cell">{item.color}</td>
                                        <td className="table-cell font-semibold text-white">{item.quantity}</td>
                                        <td className="table-cell">{formatCurrency(item.costPrice)}</td>
                                        <td className="table-cell font-semibold text-white">{formatCurrency(item.costPrice * item.quantity)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-700">
                                <td colSpan={5} className="table-cell text-right font-semibold text-gray-400">Total</td>
                                <td className="table-cell font-bold text-brand-400 text-lg">{formatCurrency(purchase.totalAmount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
