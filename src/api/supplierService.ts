import api from './axiosInstance';
import { Supplier } from '../types/product.types';

export const supplierService = {
    getAll: () => api.get<Supplier[]>('/suppliers'),
    create: (data: { name: string; phone?: string; address?: string }) =>
        api.post<Supplier>('/suppliers', data),
};
