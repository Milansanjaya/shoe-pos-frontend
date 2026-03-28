import api from './axiosInstance';
import { Sale, CreateSalePayload, CreateSaleByBarcodePayload } from '../types/sale.types';

export const saleService = {
    create: (data: CreateSalePayload) => api.post<Sale>('/sales', data),
    getAll: (params?: { from?: string; to?: string; paymentMethod?: string }) =>
        api.get<Sale[]>('/sales', { params }),
    getById: (id: string) => api.get<Sale>(`/sales/${id}`),
    findSale: async (searchTerm: string) => {
        const trimmedTerm = searchTerm.trim();
        
        // If it looks like a MongoDB ObjectId (24 hex characters), search by ID
        if (/^[0-9a-fA-F]{24}$/.test(trimmedTerm)) {
            return await api.get<Sale>(`/sales/${trimmedTerm}`);
        }
        
        // Otherwise, search through all sales to find by invoice number
        const allSalesResponse = await api.get<Sale[]>('/sales');
        const foundSale = allSalesResponse.data.find(sale => 
            sale.invoiceNumber.toLowerCase() === trimmedTerm.toLowerCase()
        );
        
        if (!foundSale) {
            throw new Error('Sale not found');
        }
        
        return { data: foundSale };
    },
    scan: (data: CreateSaleByBarcodePayload) => api.post<Sale>('/sales/scan', data),
    printInvoiceUrl: (id: string) => `${import.meta.env.VITE_API_URL}/api/sales/${id}/print`,
};
