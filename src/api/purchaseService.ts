import api from './axiosInstance';
import { CreatePurchasePayload, Purchase } from '../types/sale.types';

export const purchaseService = {
    getAll: () => api.get<Purchase[]>('/purchases'),
    getById: (id: string) => api.get<Purchase>(`/purchases/${id}`),
    create: (data: CreatePurchasePayload) => api.post<Purchase>('/purchases', data),
};
