import api from './axiosInstance';
import { Sale, CreateSalePayload, CreateSaleByBarcodePayload } from '../types/sale.types';

export const saleService = {
    create: (data: CreateSalePayload) => api.post<Sale>('/sales', data),
    getById: (id: string) => api.get<Sale>(`/sales/${id}`),
    scan: (data: CreateSaleByBarcodePayload) => api.post<Sale>('/sales/scan', data),
    printInvoiceUrl: (id: string) => `${import.meta.env.VITE_API_URL}/api/sales/${id}/print`,
};
