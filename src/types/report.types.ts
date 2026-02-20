export interface DashboardSummary {
    todayRevenue: number;
    todayProfit: number;
    todaySalesCount: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    lowStockCount: number;
    totalProducts: number;
}

export interface TodayReport {
    date: string;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
}

export interface MonthlyReport {
    month: string;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
}

export interface BusinessReport {
    totalSalesRevenue: number;
    totalProfit: number;
    totalPurchases: number;
    totalProducts: number;
}

export interface Expense {
    _id: string;
    title: string;
    amount: number;
    category: string;
    addedBy: string;
    createdAt: string;
}

export interface CreateExpensePayload {
    title: string;
    amount: number;
    category: string;
}

export interface MonthlyExpenses {
    expenses: Expense[];
    total: number;
}

export interface StockAdjustPayload {
    product: string;
    size: string;
    color: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason?: string;
}

export interface StockAdjustment {
    _id: string;
    product: { _id: string; name: string; brand?: string; barcode?: string } | string;
    size: string;
    color: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason?: string;
    adjustedBy: { _id: string; name?: string; email?: string } | string;
    createdAt: string;
}

export interface ReturnItem {
    product: string;
    size: string;
    color: string;
    quantity: number;
    refundAmount: number;
}

export interface CreateReturnPayload {
    sale: string;
    items: ReturnItem[];
    totalRefund: number;
}

export interface ClosingPayload {
    openingCash: number;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    totalExpenses: number;
    closingCash: number;
}
