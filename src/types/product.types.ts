export interface Variant {
    _id: string;
    size: string;
    color: string;
    stock: number;
    barcode: string;
}

export interface Supplier {
    _id: string;
    name: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    name: string;
    brand?: string;
    category?: string;
    price: number;
    costPrice: number;
    barcode: string;
    supplier?: Supplier | string;
    variants: Variant[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductPayload {
    name: string;
    brand?: string;
    category?: string;
    price: number;
    costPrice: number;
    supplier?: string;
    variants: { size: string; color: string; stock: number }[];
}

export interface LowStockItem {
    productId: string;
    productName: string;
    size: string;
    color: string;
    stock: number;
}

export interface LowStockResponse {
    count: number;
    items: LowStockItem[];
}
