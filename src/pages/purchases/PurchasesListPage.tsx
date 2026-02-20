import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Eye, Plus } from 'lucide-react';
import { purchaseService } from '../../api/purchaseService';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function PurchasesListPage() {
    const { data: purchases = [], isLoading } = useQuery({
        queryKey: ['purchases'],
        queryFn: () => purchaseService.getAll().then(r => r.data),
    });

    return (
        <div className="p-6 space-y-5">
            <PageHeader
                title="Purchases"
                subtitle={`${purchases.length} purchase records`}
                actions={
                    <Link to="/purchases/new" className="btn-primary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> New Purchase
                    </Link>
                }
            />

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Purchase #</th>
                                <th className="table-header">Supplier</th>
                                <th className="table-header">Items</th>
                                <th className="table-header">Total</th>
                                <th className="table-header">By</th>
                                <th className="table-header">Date</th>
                                <th className="table-header"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && purchases.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">No purchases yet</td>
                                </tr>
                            )}
                            {purchases.map(purchase => (
                                <tr key={purchase._id} className="table-row">
                                    <td className="table-cell">
                                        <span className="font-mono font-semibold text-brand-400">{purchase.purchaseNumber}</span>
                                    </td>
                                    <td className="table-cell font-medium text-white">
                                        {typeof purchase.supplier === 'object' && purchase.supplier
                                            ? purchase.supplier.name
                                            : '—'
                                        }
                                    </td>
                                    <td className="table-cell">
                                        <span className="badge-blue">{purchase.items?.length ?? 0} items</span>
                                    </td>
                                    <td className="table-cell font-semibold text-white">
                                        {formatCurrency(purchase.totalAmount)}
                                    </td>
                                    <td className="table-cell text-gray-500">
                                        {typeof purchase.purchasedBy === 'object' && purchase.purchasedBy
                                            ? (purchase.purchasedBy as { name?: string }).name ?? '—'
                                            : '—'
                                        }
                                    </td>
                                    <td className="table-cell text-gray-500">
                                        {formatDateTime(purchase.createdAt)}
                                    </td>
                                    <td className="table-cell">
                                        <Link
                                            to={`/purchases/${purchase._id}`}
                                            className="btn-ghost p-1.5"
                                            title="View details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
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
