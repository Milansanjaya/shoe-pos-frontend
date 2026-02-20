import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote,
    X, Loader2, Printer, Percent, ArrowRight, CheckCircle2, Smartphone, Scan,
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../api/productService';
import { saleService } from '../../api/saleService';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Product } from '../../types/product.types';
import { Sale } from '../../types/sale.types';
import Modal from '../../components/ui/Modal';

type CheckoutStep = 'cart' | 'bill' | 'done';

export default function POSPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<{ size: string; color: string } | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
    const [completedSale, setCompletedSale] = useState<Sale | null>(null);
    const [scanning, setScanning] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const {
        items, addItem, removeItem, updateQuantity, clearCart,
        subtotal, discountAmount, grandTotal,
        paymentMethod, setPaymentMethod,
        discountType, discountValue, setDiscount,
    } = useCartStore();

    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll().then(r => r.data),
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery)
    );

    const saleMutation = useMutation({
        mutationFn: saleService.create,
        onSuccess: (res) => {
            setCompletedSale(res.data);
            setCheckoutStep('done');
            clearCart();
            toast.success(`Sale completed! Invoice: ${res.data.invoiceNumber}`);
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Sale failed';
            toast.error(msg);
        },
    });

    const handleAddToCart = () => {
        if (!selectedProduct || !selectedVariant) return;
        addItem({
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            size: selectedVariant.size,
            color: selectedVariant.color,
            quantity: 1,
            price: selectedProduct.price,
        });
        setSelectedProduct(null);
        setSelectedVariant(null);
        toast.success('Added to cart');
    };

    /* ========== BARCODE SCAN HANDLER ========== */
    const handleBarcodeScan = async (barcode: string) => {
        if (!barcode.trim()) return;
        setScanning(true);
        try {
            const res = await productService.getByBarcode(barcode.trim());
            const product = res.data;
            const inStockVariants = product.variants.filter(v => v.stock > 0);

            if (inStockVariants.length === 0) {
                toast.error(`"${product.name}" is out of stock`);
            } else if (inStockVariants.length === 1) {
                // Auto-add when only one variant available
                const v = inStockVariants[0];
                addItem({
                    productId: product._id,
                    productName: product.name,
                    size: v.size,
                    color: v.color,
                    quantity: 1,
                    price: product.price,
                });
                toast.success(`Added ${product.name} (${v.size}/${v.color})`);
            } else {
                // Multiple variants — let user pick
                setSelectedProduct(product as Product);
                setSelectedVariant(null);
                toast.info(`${product.name} — select a variant`);
            }
            setSearchQuery('');
        } catch {
            toast.error('Product not found for this barcode');
        } finally {
            setScanning(false);
            searchRef.current?.focus();
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBarcodeScan(searchQuery);
        }
    };

    const handleOpenCheckout = () => {
        if (items.length === 0) { toast.error('Cart is empty'); return; }
        setCheckoutStep('bill');
        setCompletedSale(null);
    };

    const handleConfirmSale = () => {
        saleMutation.mutate({
            items: items.map(i => ({
                product: i.productId,
                size: i.size,
                color: i.color,
                quantity: i.quantity,
            })),
            paymentMethod,
            discountType: discountType !== 'NONE' ? discountType : undefined,
            discountValue: discountType !== 'NONE' ? discountValue : undefined,
        });
    };

    const handlePrint = () => {
        if (!completedSale) return;
        window.open(saleService.printInvoiceUrl(completedSale._id), '_blank');
    };

    const handleCloseCheckout = () => {
        setCheckoutStep('cart');
        setCompletedSale(null);
    };

    const sub = subtotal();
    const disc = discountAmount();
    const grand = grandTotal();

    return (
        <div className="flex h-full gap-0">
            {/* LEFT: Product Panel */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">
                <div className="p-4 border-b border-gray-800 space-y-3">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-brand-400" /> Point of Sale
                    </h1>
                    <div className="relative">
                        {scanning
                            ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 animate-spin" />
                            : <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        }
                        <input
                            ref={searchRef}
                            className="input pl-9"
                            placeholder="Scan barcode or search…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Product grid */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
                    {productsLoading && <div className="col-span-full flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}
                    {filteredProducts.map(product => (
                        <button
                            key={product._id}
                            onClick={() => { setSelectedProduct(product); setSelectedVariant(null); }}
                            className={`text-left p-3 rounded-xl border transition-all duration-150 ${selectedProduct?._id === product._id
                                ? 'border-brand-500 bg-brand-500/10'
                                : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/60'
                                }`}
                        >
                            <div className="w-full aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                                <span className="text-2xl">👟</span>
                            </div>
                            <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                            <p className="text-sm font-bold text-brand-400 mt-1">{formatCurrency(product.price)}</p>
                        </button>
                    ))}
                    {!productsLoading && filteredProducts.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">No products found</div>
                    )}
                </div>

                {/* Variant selector */}
                {selectedProduct && (
                    <div className="border-t border-gray-800 p-4 bg-gray-900/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">{selectedProduct.name} — Select Variant</p>
                            <button onClick={() => setSelectedProduct(null)} className="btn-ghost p-1"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedProduct.variants.filter(v => v.stock > 0).map(v => (
                                <button
                                    key={v._id}
                                    onClick={() => setSelectedVariant({ size: v.size, color: v.color })}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ${selectedVariant?.size === v.size && selectedVariant?.color === v.color
                                        ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                        }`}
                                >
                                    {v.size} / {v.color} <span className="text-gray-500">({v.stock})</span>
                                </button>
                            ))}
                            {selectedProduct.variants.filter(v => v.stock > 0).length === 0 && (
                                <p className="text-xs text-red-400">Out of stock</p>
                            )}
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                            className="btn-primary text-sm flex items-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT: Cart Panel */}
            <div className="w-80 flex flex-col bg-gray-900">
                <div className="px-4 py-4 border-b border-gray-800">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-brand-400" /> Cart ({items.length})
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {items.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-10">Cart is empty</div>
                    )}
                    {items.map((item, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                                    <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                                </div>
                                <button
                                    onClick={() => removeItem(item.productId, item.size, item.color)}
                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                                        className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-gray-300"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-semibold text-white w-5 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                                        className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-gray-300"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart footer */}
                <div className="p-4 border-t border-gray-800 space-y-3">
                    {/* Discount section */}
                    {items.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <Percent className="w-3 h-3" /> Discount
                            </div>
                            <div className="flex gap-1.5">
                                {(['NONE', 'PERCENTAGE', 'FLAT'] as const).map(dt => (
                                    <button
                                        key={dt}
                                        onClick={() => setDiscount(dt, dt === 'NONE' ? 0 : discountValue)}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${discountType === dt
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                            }`}
                                    >
                                        {dt === 'NONE' ? 'None' : dt === 'PERCENTAGE' ? '%' : 'Flat'}
                                    </button>
                                ))}
                            </div>
                            {discountType !== 'NONE' && (
                                <input
                                    type="number"
                                    min={0}
                                    step={discountType === 'PERCENTAGE' ? 1 : 0.01}
                                    placeholder={discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 500'}
                                    value={discountValue || ''}
                                    onChange={e => setDiscount(discountType, Math.max(0, Number(e.target.value)))}
                                    className="input text-sm py-1.5"
                                />
                            )}
                        </div>
                    )}

                    {/* Totals */}
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-300">{formatCurrency(sub)}</span>
                        </div>
                        {disc > 0 && (
                            <div className="flex justify-between text-purple-400">
                                <span>Discount {discountType === 'PERCENTAGE' ? `(${discountValue}%)` : ''}</span>
                                <span>-{formatCurrency(disc)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-800">
                            <span className="text-gray-400 font-semibold">Total</span>
                            <span className="text-xl font-bold text-white">{formatCurrency(grand)}</span>
                        </div>
                    </div>

                    {/* Payment method */}
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPaymentMethod('Cash')}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === 'Cash'
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                }`}
                        >
                            <Banknote className="w-3.5 h-3.5" /> Cash
                        </button>
                        <button
                            onClick={() => setPaymentMethod('Card')}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === 'Card'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                }`}
                        >
                            <CreditCard className="w-3.5 h-3.5" /> Card
                        </button>
                        <button
                            onClick={() => setPaymentMethod('Transfer')}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === 'Transfer'
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                : 'border-gray-700 text-gray-500 hover:border-gray-600'
                                }`}
                        >
                            <Smartphone className="w-3.5 h-3.5" /> Transfer
                        </button>
                    </div>

                    <button
                        onClick={handleOpenCheckout}
                        disabled={items.length === 0}
                        className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                        <ArrowRight className="w-4 h-4" /> Checkout
                    </button>

                    {items.length > 0 && (
                        <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 w-full text-center transition-colors">
                            Clear cart
                        </button>
                    )}
                </div>
            </div>

            {/* =============================================
                CHECKOUT MODAL — Bill Preview → Confirm → Done
            ============================================= */}
            <Modal
                isOpen={checkoutStep !== 'cart'}
                onClose={handleCloseCheckout}
                title={checkoutStep === 'bill' ? 'Bill Preview' : 'Sale Complete'}
                size="md"
            >
                {/* STEP: Bill Preview */}
                {checkoutStep === 'bill' && (
                    <div className="space-y-4">
                        {/* Invoice-style bill */}
                        <div className="bg-white text-gray-900 rounded-lg p-5 space-y-4" id="bill-preview">
                            <div className="text-center border-b pb-3">
                                <h3 className="text-lg font-bold">SHOE SHOP</h3>
                                <p className="text-xs text-gray-500">Point of Sale Invoice</p>
                            </div>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-1.5 font-semibold">Item</th>
                                        <th className="text-center py-1.5 font-semibold w-10">Qty</th>
                                        <th className="text-right py-1.5 font-semibold">Price</th>
                                        <th className="text-right py-1.5 font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-1.5">
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-[10px] text-gray-500">{item.size} / {item.color}</p>
                                            </td>
                                            <td className="text-center py-1.5">{item.quantity}</td>
                                            <td className="text-right py-1.5">{formatCurrency(item.price)}</td>
                                            <td className="text-right py-1.5 font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="border-t border-gray-300 pt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(sub)}</span>
                                </div>
                                {disc > 0 && (
                                    <div className="flex justify-between text-purple-600">
                                        <span>Discount {discountType === 'PERCENTAGE' ? `(${discountValue}%)` : '(Flat)'}</span>
                                        <span>-{formatCurrency(disc)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                                    <span>Grand Total</span>
                                    <span>{formatCurrency(grand)}</span>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 border-t pt-2">
                                Payment: <span className="font-semibold text-gray-700">{paymentMethod}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmSale}
                            disabled={saleMutation.isPending}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {saleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {saleMutation.isPending ? 'Processing…' : 'Confirm Sale'}
                        </button>
                    </div>
                )}

                {/* STEP: Sale Complete */}
                {checkoutStep === 'done' && completedSale && (
                    <div className="space-y-5 text-center">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">Sale Completed!</p>
                            <p className="text-sm text-gray-400 mt-1">Invoice: <span className="font-mono text-brand-400">{completedSale.invoiceNumber}</span></p>
                        </div>

                        {/* Summary card */}
                        <div className="bg-gray-800 rounded-lg p-4 text-left space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-gray-200">{formatCurrency(completedSale.totalAmount)}</span>
                            </div>
                            {completedSale.discountAmount > 0 && (
                                <div className="flex justify-between text-purple-400">
                                    <span>Discount {completedSale.discountType === 'PERCENTAGE' ? `(${completedSale.discountValue}%)` : ''}</span>
                                    <span>-{formatCurrency(completedSale.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2">
                                <span className="text-white">Grand Total</span>
                                <span className="text-brand-400">{formatCurrency(completedSale.grandTotal)}</span>
                            </div>
                            <div className="text-xs text-gray-500 pt-1">
                                Payment: {completedSale.paymentMethod} • Items: {completedSale.items.length}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print Invoice
                            </button>
                            <button
                                onClick={handleCloseCheckout}
                                className="btn-primary flex-1 text-sm"
                            >
                                New Sale
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
