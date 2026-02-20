import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../api/productService';
import { supplierService } from '../../api/supplierService';
import PageHeader from '../../components/layout/PageHeader';
import { Link } from 'react-router-dom';

const variantSchema = z.object({
    size: z.string().min(1, 'Size required'),
    color: z.string().min(1, 'Color required'),
    stock: z.coerce.number().min(0),
});

const schema = z.object({
    name: z.string().min(1, 'Name required'),
    barcode: z.string().min(1, 'Barcode required'),
    brand: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Price required'),
    costPrice: z.coerce.number().min(0),
    supplier: z.string().optional(),
    variants: z.array(variantSchema).min(1, 'At least one variant required'),
});

const genBarcode = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    return `${yy}${mm}${dd}${seq}`;
};

type FormData = z.infer<typeof schema>;

export default function ProductFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.getAll().then(r => r.data),
    });

    const { data: product } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id!).then(r => r.data),
        enabled: isEdit,
    });

    const {
        register, control, handleSubmit, reset, setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { barcode: genBarcode(), variants: [{ size: '', color: '', stock: 0 }] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                barcode: product.barcode ?? genBarcode(),
                brand: product.brand ?? '',
                category: product.category ?? '',
                price: product.price,
                costPrice: product.costPrice,
                supplier: typeof product.supplier === 'object' && product.supplier ? product.supplier._id : (product.supplier as string | undefined) ?? '',
                variants: product.variants.map(v => ({ size: v.size, color: v.color, stock: v.stock })),
            });
        }
    }, [product, reset]);

    const createMutation = useMutation({
        mutationFn: productService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product created'); navigate('/products'); },
        onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => productService.update(id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product updated'); navigate('/products'); },
        onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
    });

    const onSubmit = (data: FormData) => {
        if (isEdit) updateMutation.mutate({ id: id!, data });
        else createMutation.mutate(data);
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <Link to="/products" className="btn-ghost p-2">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <PageHeader title={isEdit ? 'Edit Product' : 'Add Product'} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Basic info */}
                <div className="card space-y-4">
                    <h2 className="section-title">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Product Name *</label>
                            <input {...register('name')} className="input" placeholder="Nike Air Max 90" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="label">Barcode *</label>
                            <div className="flex gap-2">
                                <input {...register('barcode')} className="input font-mono" placeholder="e.g. 10000001" />
                                <button
                                    type="button"
                                    title="Auto-generate barcode"
                                    onClick={() => setValue('barcode', genBarcode(), { shouldValidate: true })}
                                    className="btn-secondary px-2.5 shrink-0"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {errors.barcode && <p className="text-red-400 text-xs mt-1">{errors.barcode.message}</p>}
                        </div>
                        <div>
                            <label className="label">Brand</label>
                            <input {...register('brand')} className="input" placeholder="Nike" />
                        </div>
                        <div>
                            <label className="label">Category</label>
                            <input {...register('category')} className="input" placeholder="Running" />
                        </div>
                        <div>
                            <label className="label">Supplier</label>
                            <select {...register('supplier')} className="input">
                                <option value="">None</option>
                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Selling Price (LKR) *</label>
                            <input {...register('price')} type="number" step="0.01" className="input" placeholder="0.00" />
                            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="label">Cost Price (LKR)</label>
                            <input {...register('costPrice')} type="number" step="0.01" className="input" placeholder="0.00" />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="section-title">Variants (Size / Color / Stock)</h2>
                        <button
                            type="button"
                            onClick={() => append({ size: '', color: '', stock: 0 })}
                            className="btn-secondary text-xs flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Variant
                        </button>
                    </div>
                    {errors.variants && <p className="text-red-400 text-xs">{errors.variants.message}</p>}
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                                <input
                                    {...register(`variants.${index}.size`)}
                                    className="input text-sm flex-1"
                                    placeholder="Size (e.g. 42)"
                                />
                                <input
                                    {...register(`variants.${index}.color`)}
                                    className="input text-sm flex-1"
                                    placeholder="Color (e.g. Black)"
                                />
                                <input
                                    {...register(`variants.${index}.stock`)}
                                    type="number"
                                    className="input text-sm w-20"
                                    placeholder="Stock"
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className="text-gray-600 hover:text-red-400 disabled:opacity-30 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isPending ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
                    </button>
                    <Link to="/products" className="btn-secondary">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
