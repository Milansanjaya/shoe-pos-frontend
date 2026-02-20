import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../api/productService';
import { supplierService } from '../../api/supplierService';
import { purchaseService } from '../../api/purchaseService';
import PageHeader from '../../components/layout/PageHeader';
import { Product } from '../../types/product.types';

const schema = z.object({
    supplier: z.string().min(1, 'Supplier required'),
    items: z.array(z.object({
        product: z.string().min(1, 'Product required'),
        size: z.string().min(1, 'Size required'),
        color: z.string().min(1, 'Color required'),
        quantity: z.coerce.number().min(1),
        costPrice: z.coerce.number().min(0),
    })).min(1),
});

type FormData = z.infer<typeof schema>;

export default function PurchasePage() {
    const [selectedProducts, setSelectedProducts] = useState<Record<number, Product | null>>({});

    const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: () => supplierService.getAll().then(r => r.data) });
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => productService.getAll().then(r => r.data) });

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { items: [{ product: '', size: '', color: '', quantity: 1, costPrice: 0 }] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const mutation = useMutation({
        mutationFn: purchaseService.create,
        onSuccess: () => { toast.success('Purchase recorded'); reset(); setSelectedProducts({}); },
        onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
    });

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            <PageHeader title="New Purchase" subtitle="Record stock received from supplier" />

            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
                <div className="card">
                    <label className="label">Supplier *</label>
                    <select {...register('supplier')} className="input">
                        <option value="">Select supplier</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    {errors.supplier && <p className="text-red-400 text-xs mt-1">{errors.supplier.message}</p>}
                </div>

                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="section-title">Items</h2>
                        <button type="button" onClick={() => append({ product: '', size: '', color: '', quantity: 1, costPrice: 0 })} className="btn-secondary text-xs flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>
                    </div>

                    {fields.map((field, index) => {
                        const sp = selectedProducts[index];
                        return (
                            <div key={field.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-400">Item {index + 1}</p>
                                    <button type="button" onClick={() => { remove(index); const n = { ...selectedProducts }; delete n[index]; setSelectedProducts(n); }} disabled={fields.length === 1} className="text-gray-600 hover:text-red-400 disabled:opacity-30">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="label">Product *</label>
                                        <select {...register(`items.${index}.product`)} className="input" onChange={e => {
                                            const p = products.find(x => x._id === e.target.value) ?? null;
                                            setSelectedProducts(prev => ({ ...prev, [index]: p }));
                                        }}>
                                            <option value="">Select product</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name} — {p.brand ?? ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Size *</label>
                                        {sp ? (
                                            <select {...register(`items.${index}.size`)} className="input">
                                                <option value="">Select size</option>
                                                {[...new Set(sp.variants.map(v => v.size))].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : <input {...register(`items.${index}.size`)} className="input" placeholder="e.g. 42" />}
                                    </div>
                                    <div>
                                        <label className="label">Color *</label>
                                        {sp ? (
                                            <select {...register(`items.${index}.color`)} className="input">
                                                <option value="">Select color</option>
                                                {[...new Set(sp.variants.map(v => v.color))].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : <input {...register(`items.${index}.color`)} className="input" placeholder="e.g. Black" />}
                                    </div>
                                    <div>
                                        <label className="label">Quantity *</label>
                                        <input {...register(`items.${index}.quantity`)} type="number" className="input" min={1} />
                                    </div>
                                    <div>
                                        <label className="label">Cost Price (LKR) *</label>
                                        <input {...register(`items.${index}.costPrice`)} type="number" step="0.01" className="input" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {mutation.isPending ? 'Saving…' : 'Record Purchase'}
                </button>
            </form>
        </div>
    );
}
