import api from './axiosInstance';
import { Product, CreateProductPayload, LowStockResponse } from '../types/product.types';

export const productService = {
    getAll: () => api.get<Product[]>('/products'),
    getById: (id: string) => api.get<Product>(`/products/${id}`),
    getByBarcode: (barcode: string) => api.get<Product>(`/products/barcode/${barcode}`),
    getLowStock: () => api.get<LowStockResponse>('/products/low-stock'),
    create: (data: CreateProductPayload) => api.post<Product>('/products', data),
    update: (id: string, data: Partial<CreateProductPayload>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
};
