import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, TrendingUp, TrendingDown, History, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../api/productService';
import { stockService } from '../../api/services';
import PageHeader from '../../components/layout/PageHeader';
import { Product } from '../../types/product.types';
import { StockAdjustment } from '../../types/report.types';
import { formatDate } from '../../utils/formatDate';

const schema = z.object({
    product: z.string().min(1, 'Product required'),
    size: z.string().min(1, 'Size required'),
    color: z.string().min(1, 'Color required'),
    type: z.enum(['INCREASE', 'DECREASE']),
    quantity: z.coerce.number().min(1),
    reason: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function getProductName(p: StockAdjustment['product']): string {
    if (typeof p === 'object' && p !== null) return p.name;
    return String(p);
}

function getAdjustedBy(u: StockAdjustment['adjustedBy']): string {
    if (typeof u === 'object' && u !== null) return u.name ?? u.email ?? 'Unknown';
    return String(u);
}

export default function StockAdjustPage() {
    const queryClient = useQueryClient();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'INCREASE' | 'DECREASE'>('ALL');
    const [filterProduct, setFilterProduct] = useState('');

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll().then(r => r.data),
    });

    const { data: adjustments = [], isLoading: historyLoading } = useQuery({
        queryKey: ['stock-adjustments', filterType, filterProduct],
        queryFn: () => stockService.getAdjustments({
            type: filterType !== 'ALL' ? filterType : undefined,
            product: filterProduct || undefined,
        }).then(r => r.data),
    });

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'INCREASE', quantity: 1 },
    });

    const mutation = useMutation({
        mutationFn: stockService.adjust,
        onSuccess: () => {
            toast.success('Stock adjusted successfully');
            reset({ type: 'INCREASE', quantity: 1 });
            setSelectedProduct(null);
            queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (e: unknown) =>
            toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
    });

    const adjType = watch('type');
    const sizes = selectedProduct ? [...new Set(selectedProduct.variants.map(v => v.size))] : [];
    const colors = selectedProduct ? [...new Set(selectedProduct.variants.map(v => v.color))] : [];

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <PageHeader title="Stock Adjustment" subtitle="Manually increase or decrease stock levels" />

            {/* ── Adjust Form ── */}
            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="card space-y-5">
                <h2 className="section-title">New Adjustment</h2>

                <div>
                    <label className="label">Product *</label>
                    <select {...register('product')} className="input" onChange={e => {
                        const p = products.find(x => x._id === e.target.value) ?? null;
                        setSelectedProduct(p);
                    }}>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    {errors.product && <p className="text-red-400 text-xs mt-1">{errors.product.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Size *</label>
                        {sizes.length > 0 ? (
                            <select {...register('size')} className="input">
                                <option value="">Select size</option>
                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        ) : <input {...register('size')} className="input" placeholder="e.g. 42" />}
                        {errors.size && <p className="text-red-400 text-xs mt-1">{errors.size.message}</p>}
                    </div>
                    <div>
                        <label className="label">Color *</label>
                        {colors.length > 0 ? (
                            <select {...register('color')} className="input">
                                <option value="">Select color</option>
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        ) : <input {...register('color')} className="input" placeholder="e.g. Black" />}
                        {errors.color && <p className="text-red-400 text-xs mt-1">{errors.color.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="label">Adjustment Type *</label>
                    <div className="flex gap-3">
                        <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${adjType === 'INCREASE' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-gray-700 text-gray-500'}`}>
                            <input {...register('type')} type="radio" value="INCREASE" className="sr-only" />
                            <TrendingUp className="w-4 h-4" /> Increase
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${adjType === 'DECREASE' ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-gray-700 text-gray-500'}`}>
                            <input {...register('type')} type="radio" value="DECREASE" className="sr-only" />
                            <TrendingDown className="w-4 h-4" /> Decrease
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Quantity *</label>
                        <input {...register('quantity')} type="number" min={1} className="input" />
                        {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
                    </div>
                    <div>
                        <label className="label">Reason</label>
                        <input {...register('reason')} className="input" placeholder="e.g. Damaged, Restock" />
                    </div>
                </div>

                <button type="submit" disabled={mutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                    {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mutation.isPending ? 'Saving…' : 'Apply Adjustment'}
                </button>
            </form>

            {/* ── History Table ── */}
            <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-brand-400" />
                        <h2 className="section-title">Adjustment History</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                        <select
                            className="input py-1 text-xs w-36"
                            value={filterProduct}
                            onChange={e => setFilterProduct(e.target.value)}
                        >
                            <option value="">All Products</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <select
                            className="input py-1 text-xs w-32"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as typeof filterType)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="INCREASE">Increase</option>
                            <option value="DECREASE">Decrease</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Product</th>
                                <th className="table-header">Variant</th>
                                <th className="table-header">Type</th>
                                <th className="table-header">Qty</th>
                                <th className="table-header">Reason</th>
                                <th className="table-header">Adjusted By</th>
                                <th className="table-header">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyLoading && (
                                <tr>
                                    <td colSpan={7} className="table-cell text-center py-8">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-400" />
                                    </td>
                                </tr>
                            )}
                            {!historyLoading && adjustments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="table-cell text-center text-gray-500 py-8">
                                        No adjustments found
                                    </td>
                                </tr>
                            )}
                            {adjustments.map((adj: StockAdjustment) => (
                                <tr key={adj._id} className="table-row">
                                    <td className="table-cell font-medium text-white">
                                        {getProductName(adj.product)}
                                    </td>
                                    <td className="table-cell text-gray-400">{adj.size} / {adj.color}</td>
                                    <td className="table-cell">
                                        {adj.type === 'INCREASE' ? (
                                            <span className="badge-green flex items-center gap-1 w-fit">
                                                <TrendingUp className="w-3 h-3" /> Increase
                                            </span>
                                        ) : (
                                            <span className="badge-red flex items-center gap-1 w-fit">
                                                <TrendingDown className="w-3 h-3" /> Decrease
                                            </span>
                                        )}
                                    </td>
                                    <td className="table-cell font-semibold text-white">
                                        {adj.type === 'INCREASE' ? '+' : '-'}{adj.quantity}
                                    </td>
                                    <td className="table-cell text-gray-400">{adj.reason ?? '—'}</td>
                                    <td className="table-cell text-gray-400">{getAdjustedBy(adj.adjustedBy)}</td>
                                    <td className="table-cell text-gray-500 text-xs">{formatDate(adj.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
