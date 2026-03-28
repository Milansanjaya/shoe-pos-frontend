import { Product } from './product.types';
import { Supplier } from './product.types';

export interface SaleItem {
    _id?: string;
    product: Product | string;
    size: string;
    color: string;
    quantity: number;
    price: number;
}

export interface Sale {
    _id: string;
    invoiceNumber: string;
    items: SaleItem[];
    totalAmount: number;
    discountType: 'NONE' | 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    discountAmount: number;
    grandTotal: number;
    totalProfit: number;
    paymentMethod: 'Cash' | 'Card' | 'Transfer';
    cashReceived: number;
    changeAmount: number;
    soldBy: { _id: string; name: string } | string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSalePayload {
    items: {
        product: string;
        size: string;
        color: string;
        quantity: number;
    }[];
    paymentMethod?: 'Cash' | 'Card' | 'Transfer';
    discountType?: 'NONE' | 'PERCENTAGE' | 'FLAT';
    discountValue?: number;
    cashReceived?: number;
    changeAmount?: number;
}

export interface CreateSaleByBarcodePayload {
    barcode: string;
    quantity?: number;
    paymentMethod?: 'Cash' | 'Card';
}

export interface PurchaseItem {
    product: string | { _id: string; name: string; brand?: string; category?: string; barcode?: string; price?: number };
    size: string;
    color: string;
    quantity: number;
    costPrice: number;
}

export interface Purchase {
    _id: string;
    purchaseNumber: string;
    supplier: Supplier | string;
    items: PurchaseItem[];
    totalAmount: number;
    purchasedBy: string | { _id: string; name?: string; email?: string; role?: string };
    createdAt: string;
}

export interface CreatePurchasePayload {
    supplier: string;
    items: PurchaseItem[];
}

export interface CartItem {
    productId: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
}
