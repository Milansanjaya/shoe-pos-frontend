import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../api/productService';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Product } from '../../types/product.types';

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const qc = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll().then(r => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted');
        },
        onError: () => toast.error('Failed to delete product'),
    });

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);

    return (
        <div className="p-6 space-y-5">
            <PageHeader
                title="Products"
                subtitle={`${products.length} products in inventory`}
                actions={
                    <Link to="/products/new" className="btn-primary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Add Product
                    </Link>
                }
            />

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    className="input pl-9"
                    placeholder="Search products…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Product</th>
                                <th className="table-header">Brand</th>
                                <th className="table-header">Category</th>
                                <th className="table-header">Price</th>
                                <th className="table-header">Cost</th>
                                <th className="table-header">Variants</th>
                                <th className="table-header">Stock</th>
                                <th className="table-header">Added</th>
                                <th className="table-header"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-500">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-500">No products found</td>
                                </tr>
                            )}
                            {filtered.map(product => {
                                const stock = totalStock(product);
                                return (
                                    <tr key={product._id} className="table-row">
                                        <td className="table-cell">
                                            <p className="font-semibold text-white">{product.name}</p>
                                            <p className="text-xs text-gray-600">{product.barcode}</p>
                                        </td>
                                        <td className="table-cell">{product.brand ?? '—'}</td>
                                        <td className="table-cell">{product.category ?? '—'}</td>
                                        <td className="table-cell font-semibold text-white">{formatCurrency(product.price)}</td>
                                        <td className="table-cell text-gray-500">{formatCurrency(product.costPrice)}</td>
                                        <td className="table-cell">{product.variants.length}</td>
                                        <td className="table-cell">
                                            {stock <= 5 ? (
                                                <span className="badge-red flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {stock}
                                                </span>
                                            ) : (
                                                <span className="badge-green">{stock}</span>
                                            )}
                                        </td>
                                        <td className="table-cell text-gray-500">{formatDate(product.createdAt)}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1">
                                                <Link to={`/products/${product._id}`} className="btn-ghost p-1.5" title="View details">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <Link to={`/products/${product._id}/edit`} className="btn-ghost p-1.5">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this product?')) deleteMutation.mutate(product._id);
                                                    }}
                                                    className="btn-ghost p-1.5 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
