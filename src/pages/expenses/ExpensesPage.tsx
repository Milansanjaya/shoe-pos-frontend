import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { expenseService } from '../../api/services';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const schema = z.object({
    title: z.string().min(1, 'Title required'),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    category: z.string().min(1, 'Category required'),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Rent', 'Utilities', 'Salary', 'Transport', 'Marketing', 'Maintenance', 'Other'];

export default function ExpensesPage() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['expenses-monthly'],
        queryFn: () => expenseService.getMonthly().then(r => r.data),
    });

    const expenses = data?.expenses ?? [];
    const totalMonth = data?.totalExpenses ?? 0;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: expenseService.create,
        onSuccess: () => { toast.success('Expense added'); reset(); refetch(); },
        onError: () => toast.error('Failed to add expense'),
    });

    return (
        <div className="p-6 space-y-5">
            <PageHeader title="Expenses" subtitle={`Monthly total: ${formatCurrency(totalMonth)}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add form */}
                <div className="card space-y-4 h-fit">
                    <h2 className="section-title">Log Expense</h2>
                    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
                        <div>
                            <label className="label">Title *</label>
                            <input {...register('title')} className="input" placeholder="Shop rent" />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="label">Amount (LKR) *</label>
                            <input {...register('amount')} type="number" step="0.01" className="input" placeholder="0.00" />
                            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="label">Category *</label>
                            <select {...register('category')} className="input">
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                        </div>
                        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {mutation.isPending ? 'Saving…' : 'Add Expense'}
                        </button>
                    </form>
                </div>

                {/* Expense list */}
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-red-400" />
                        <h2 className="section-title">This Month's Expenses</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-800">
                                <tr>
                                    <th className="table-header">Title</th>
                                    <th className="table-header">Category</th>
                                    <th className="table-header">Amount</th>
                                    <th className="table-header">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading…</td></tr>}
                                {!isLoading && expenses.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-500">No expenses this month</td></tr>}
                                {expenses.map(e => (
                                    <tr key={e._id} className="table-row">
                                        <td className="table-cell font-medium text-white">{e.title}</td>
                                        <td className="table-cell"><span className="badge-yellow">{e.category}</span></td>
                                        <td className="table-cell font-semibold text-red-400">{formatCurrency(e.amount)}</td>
                                        <td className="table-cell text-gray-500">{formatDateTime(e.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
