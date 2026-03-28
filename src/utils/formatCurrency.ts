export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(amount);
};
