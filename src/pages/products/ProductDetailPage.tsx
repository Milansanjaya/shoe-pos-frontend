import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Box, Tag, Layers, DollarSign, Barcode } from 'lucide-react';
import { productService } from '../../api/productService';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function ProductDetailPage() {
    const { id } = useParams();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id!).then(r => r.data),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return <div className="p-6 text-gray-500">Product not found</div>;

    const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-5">
            <div className="flex items-center gap-3">
                <Link to="/products" className="btn-ghost p-2">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <PageHeader
                    title={product.name}
                    subtitle={`${product.brand ?? ''} ${product.category ? `• ${product.category}` : ''}`}
                    actions={
                        <div className="flex gap-2">
                            <Link to={`/products/${product._id}/edit`} className="btn-secondary text-sm">Edit</Link>
                            <Link
                                to={`/products/${product._id}/barcodes`}
                                className="btn-primary text-sm flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Barcodes
                            </Link>
                        </div>
                    }
                />
            </div>

            {/* Key info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Selling Price</p>
                        <p className="font-bold text-white">{formatCurrency(product.price)}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Cost Price</p>
                        <p className="font-bold text-white">{formatCurrency(product.costPrice)}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Box className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Total Stock</p>
                        <p className="font-bold text-white">{totalStock}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase">Variants</p>
                        <p className="font-bold text-white">{product.variants.length}</p>
                    </div>
                </div>
            </div>

            {/* Product Barcode */}
            <div className="card space-y-2">
                <div className="flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-brand-400" />
                    <h2 className="section-title">Product Barcode</h2>
                </div>
                <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <span className="font-mono text-lg text-white tracking-widest">{product.barcode}</span>
                    <Link
                        to={`/products/${product._id}/barcodes`}
                        className="btn-ghost text-xs flex items-center gap-1 text-brand-400 hover:text-brand-300"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </Link>
                </div>
            </div>

            {/* Supplier */}
            {product.supplier && typeof product.supplier === 'object' && (
                <div className="card space-y-1">
                    <h2 className="section-title">Supplier</h2>
                    <p className="text-white font-medium">{product.supplier.name}</p>
                    {product.supplier.phone && <p className="text-sm text-gray-500">{product.supplier.phone}</p>}
                </div>
            )}

            {/* Variants table */}
            <div className="card p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    <h2 className="section-title">Variants</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-800">
                            <tr>
                                <th className="table-header">Size</th>
                                <th className="table-header">Color</th>
                                <th className="table-header">Stock</th>
                                <th className="table-header">Barcode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.variants.map((v, i) => (
                                <tr key={v._id ?? i} className="table-row">
                                    <td className="table-cell font-semibold text-white">{v.size}</td>
                                    <td className="table-cell">{v.color}</td>
                                    <td className="table-cell">
                                        {v.stock <= 5
                                            ? <span className="badge-red">{v.stock}</span>
                                            : <span className="badge-green">{v.stock}</span>
                                        }
                                    </td>
                                    <td className="table-cell font-mono text-xs text-gray-400">{v.barcode ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-gray-600">Created {formatDate(product.createdAt)}</p>
        </div>
    );
}
