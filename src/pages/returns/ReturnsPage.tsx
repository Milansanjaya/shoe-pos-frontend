import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { saleService } from '../../api/saleService';
import { returnService } from '../../api/services';
import PageHeader from '../../components/layout/PageHeader';
import { Sale } from '../../types/sale.types';
import { Product } from '../../types/product.types';
import { formatCurrency } from '../../utils/formatCurrency';

const schema = z.object({
    sale: z.string().min(1, 'Sale ID required'),
    items: z.array(z.object({
        product: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.coerce.number().min(1),
        refundAmount: z.coerce.number().min(0),
    })).min(1),
    totalRefund: z.coerce.number().min(0),
});
type FormData = z.infer<typeof schema>;

export default function ReturnsPage() {
    const [saleId, setSaleId] = useState('');
    const [sale, setSale] = useState<Sale | null>(null);
    const [loadingSale, setLoadingSale] = useState(false);

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { items: [{ product: '', size: '', color: '', quantity: 1, refundAmount: 0 }] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const fetchSale = async () => {
        if (!saleId.trim()) {
            toast.error('Please enter Sale ID or Invoice Number');
            return;
        }
        setLoadingSale(true);
        try {
            const res = await saleService.findSale(saleId.trim());
            setSale(res.data);
            setValue('sale', res.data._id); // Use actual sale ID for form submission
            toast.success(`Found sale: ${res.data.invoiceNumber}`);
        } catch (error) {
            console.error('Sale search error:', error);
            toast.error('Sale not found. Please check the ID or Invoice Number.');
        } finally {
            setLoadingSale(false);
        }
    };

    const mutation = useMutation({
        mutationFn: returnService.create,
        onSuccess: (res) => { 
            toast.success(`Return processed successfully! Refund: ${formatCurrency(res.data?.totalRefund || 0)}`); 
            setSale(null); 
            setSaleId(''); 
            // Reset form
            setValue('items', [{ product: '', size: '', color: '', quantity: 1, refundAmount: 0 }]);
            setValue('totalRefund', 0);
        },
        onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Return processing failed'),
    });

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-5">
            <PageHeader title="Process Return" subtitle="Look up a sale and select items to return" />

            {/* Sale lookup */}
            <div className="card space-y-3">
                <h2 className="section-title">Find Sale</h2>
                <div className="flex gap-2">
                    <input
                        className="input"
                        placeholder="Enter Sale ID (e.g. 65f8a1b...) or Invoice Number (e.g. INV-000123)..."
                        value={saleId}
                        onChange={e => setSaleId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchSale()}
                    />
                    <button onClick={fetchSale} disabled={loadingSale} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        {loadingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loadingSale ? 'Finding…' : 'Find'}
                    </button>
                </div>

                {sale && (
                    <div className="bg-gray-800 rounded-lg p-3 text-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-white">{sale.invoiceNumber}</p>
                            <p className="text-xs text-gray-400">ID: {sale._id}</p>
                        </div>
                        <div className="space-y-1">
                            {sale.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-gray-400">
                                    <span>{(item.product as Product).name ?? 'Product'} — {item.size}/{item.color} ×{item.quantity}</span>
                                    <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-700 pt-2 space-y-1">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(sale.totalAmount)}</span>
                            </div>
                            {sale.discountAmount > 0 && (
                                <div className="flex justify-between text-purple-400">
                                    <span>Discount:</span>
                                    <span>-{formatCurrency(sale.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-white">
                                <span>Grand Total:</span>
                                <span>{formatCurrency(sale.grandTotal)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                Payment: {sale.paymentMethod} • {new Date(sale.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {sale && (
                <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
                    <input type="hidden" {...register('sale')} />

                    <div className="card space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="section-title">Return Items</h2>
                            <button type="button" onClick={() => append({ product: '', size: '', color: '', quantity: 1, refundAmount: 0 })} className="btn-secondary text-xs flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-2 gap-3 bg-gray-800 rounded-lg p-3">
                                <div className="col-span-2">
                                    <label className="label">Product ID</label>
                                    <input {...register(`items.${index}.product`)} className="input text-sm" placeholder="Product ID" />
                                </div>
                                <div>
                                    <label className="label">Size</label>
                                    <input {...register(`items.${index}.size`)} className="input text-sm" placeholder="e.g. 42" />
                                </div>
                                <div>
                                    <label className="label">Color</label>
                                    <input {...register(`items.${index}.color`)} className="input text-sm" placeholder="e.g. Black" />
                                </div>
                                <div>
                                    <label className="label">Qty</label>
                                    <input {...register(`items.${index}.quantity`)} type="number" className="input text-sm" />
                                </div>
                                <div>
                                    <label className="label">Refund (LKR)</label>
                                    <input {...register(`items.${index}.refundAmount`)} type="number" step="0.01" className="input text-sm" />
                                </div>
                                <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="col-span-2 text-xs text-gray-600 hover:text-red-400 text-right disabled:opacity-30">
                                    <Trash2 className="w-3.5 h-3.5 inline" /> Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <label className="label">Total Refund Amount (LKR) *</label>
                        <input {...register('totalRefund')} type="number" step="0.01" className="input" />
                        {errors.totalRefund && <p className="text-red-400 text-xs mt-1">{errors.totalRefund.message}</p>}
                    </div>

                    <button type="submit" disabled={mutation.isPending} className="btn-danger w-full flex items-center justify-center gap-2">
                        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {mutation.isPending ? 'Processing…' : 'Process Return'}
                    </button>
                </form>
            )}
        </div>
    );
}
