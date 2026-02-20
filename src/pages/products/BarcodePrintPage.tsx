import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer, Minus, Plus } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { productService } from '../../api/productService';
import PageHeader from '../../components/layout/PageHeader';

interface BarcodeCardProps {
    value: string;
    label: string;
    sublabel?: string;
}

function BarcodeCard({ value, label, sublabel }: BarcodeCardProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 14,
                    font: 'monospace',
                    textMargin: 4,
                    margin: 8,
                    background: '#ffffff',
                    lineColor: '#000000',
                });
            } catch {
                // fallback for invalid barcode values
            }
        }
    }, [value]);

    return (
        <div className="barcode-card bg-white rounded-lg p-3 flex flex-col items-center border border-gray-200">
            <p className="text-xs font-semibold text-gray-800 mb-1 truncate w-full text-center">{label}</p>
            {sublabel && <p className="text-[10px] text-gray-500 mb-1">{sublabel}</p>}
            <svg ref={svgRef} className="w-full" />
        </div>
    );
}

const LAYOUT_OPTIONS = [
    { label: '1 per page', cols: 1, value: 1 },
    { label: '4 per page', cols: 2, value: 4 },
    { label: '8 per page', cols: 2, value: 8 },
    { label: '12 per page', cols: 3, value: 12 },
    { label: '20 per page', cols: 4, value: 20 },
    { label: '30 per page', cols: 5, value: 30 },
];

export default function BarcodePrintPage() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(12);
    const [selectedLayout, setSelectedLayout] = useState(12);
    const [printVariant, setPrintVariant] = useState<'product' | number>('product');

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id!).then(r => r.data),
        enabled: !!id,
    });

    const layout = LAYOUT_OPTIONS.find(l => l.value === selectedLayout) ?? LAYOUT_OPTIONS[3];

    const getBarcode = () => {
        if (!product) return { value: '', label: '', sublabel: '' };
        if (printVariant === 'product') {
            return {
                value: product.barcode ?? '',
                label: product.name,
                sublabel: product.brand ?? '',
            };
        }
        const v = product.variants[printVariant];
        if (!v) return { value: '', label: '', sublabel: '' };
        return {
            value: v.barcode ?? '',
            label: product.name,
            sublabel: `${v.size} / ${v.color}`,
        };
    };

    const barcode = getBarcode();

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return <div className="p-6 text-gray-500">Product not found</div>;

    return (
        <div className="p-6 space-y-5">
            {/* Controls - hidden when printing */}
            <div className="print:hidden space-y-5">
                <div className="flex items-center gap-3">
                    <Link to={`/products/${id}`} className="btn-ghost p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <PageHeader
                        title="Print Barcodes"
                        subtitle={product.name}
                        actions={
                            <button
                                onClick={handlePrint}
                                className="btn-primary flex items-center gap-2 text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                        }
                    />
                </div>

                {/* Settings card */}
                <div className="card space-y-4">
                    <h2 className="section-title">Print Settings</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Barcode source */}
                        <div>
                            <label className="label">Barcode to Print</label>
                            <select
                                className="input"
                                value={String(printVariant)}
                                onChange={e => {
                                    const v = e.target.value;
                                    setPrintVariant(v === 'product' ? 'product' : Number(v));
                                }}
                            >
                                <option value="product">
                                    Product: {product.barcode}
                                </option>
                                {product.variants.map((v, i) => (
                                    <option key={i} value={i}>
                                        {v.size}/{v.color}: {v.barcode ?? 'no barcode'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="label">Quantity</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="btn-secondary p-2"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={quantity}
                                    onChange={e => setQuantity(Math.max(1, Math.min(100, Number(e.target.value))))}
                                    className="input text-center w-20"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                    className="btn-secondary p-2"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Layout */}
                        <div>
                            <label className="label">Layout</label>
                            <select
                                className="input"
                                value={selectedLayout}
                                onChange={e => setSelectedLayout(Number(e.target.value))}
                            >
                                {LAYOUT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick buttons */}
                    <div className="flex flex-wrap gap-2">
                        {[1, 4, 8, 12, 20, 30, 50].map(n => (
                            <button
                                key={n}
                                onClick={() => setQuantity(n)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${quantity === n
                                        ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                    }`}
                            >
                                ×{n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Barcode grid - visible on screen and when printing */}
            <div
                className={`grid gap-3 print:gap-1 print:p-0`}
                style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
            >
                {Array.from({ length: quantity }).map((_, i) => (
                    <BarcodeCard
                        key={i}
                        value={barcode.value}
                        label={barcode.label}
                        sublabel={barcode.sublabel}
                    />
                ))}
            </div>
        </div>
    );
}
