import api from './axiosInstance';
import { CreateExpensePayload, Expense, StockAdjustPayload, StockAdjustment, CreateReturnPayload, ClosingPayload, DashboardSummary, TodayReport, MonthlyReport, BusinessReport } from '../types/report.types';

export const expenseService = {
    create: (data: CreateExpensePayload) => api.post<Expense>('/expenses', data),
    getMonthly: () => api.get<{ totalExpenses: number; expenses: Expense[] }>('/expenses/monthly'),
};

export const stockService = {
    adjust: (data: StockAdjustPayload) => api.post<StockAdjustment>('/stock/adjust', data),
    getAdjustments: (params?: { product?: string; type?: string }) =>
        api.get<StockAdjustment[]>('/stock/adjustments', { params }),
    getAdjustmentById: (id: string) => api.get<StockAdjustment>(`/stock/adjustments/${id}`),
};

export const returnService = {
    create: (data: CreateReturnPayload) => api.post('/returns', data),
};

export const dashboardService = {
    getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
};

export const reportService = {
    getToday: () => api.get<TodayReport>('/reports/today'),
    getMonthly: () => api.get<MonthlyReport>('/reports/monthly'),
    getBusinessSummary: () => api.get<BusinessReport>('/reports/summary'),
};

export const closingService = {
    closeDay: (data: ClosingPayload) => api.post('/closing/close', data),
};
