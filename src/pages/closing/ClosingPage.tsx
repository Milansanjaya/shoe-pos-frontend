import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { dashboardService, closingService } from '../../api/services';
import PageHeader from '../../components/layout/PageHeader';
import { formatCurrency } from '../../utils/formatCurrency';

const schema = z.object({
    openingCash: z.coerce.number().min(0),
    totalSales: z.coerce.number().min(0),
    totalRevenue: z.coerce.number().min(0),
    totalProfit: z.coerce.number().min(0),
    totalExpenses: z.coerce.number().min(0),
    closingCash: z.coerce.number().min(0),
});
type FormData = z.infer<typeof schema>;

export default function ClosingPage() {
    const { data: summary } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: () => dashboardService.getSummary().then(r => r.data),
    });

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        values: {
            openingCash: 0,
            totalSales: summary?.todaySalesCount ?? 0,
            totalRevenue: summary?.todayRevenue ?? 0,
            totalProfit: summary?.todayProfit ?? 0,
            totalExpenses: 0,
            closingCash: 0,
        },
    });

    const mutation = useMutation({
        mutationFn: closingService.closeDay,
        onSuccess: () => toast.success('Day closed successfully!'),
        onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
    });

    return (
        <div className="p-6 max-w-lg mx-auto space-y-5">
            <PageHeader title="Day Close" subtitle="Summarize and close today's transactions" />

            {/* Today summary banner */}
            {summary && (
                <div className="card bg-gradient-to-r from-brand-900/40 to-brand-800/20 border-brand-700/40 flex gap-6">
                    <div>
                        <p className="text-xs text-gray-500">Today Revenue</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(summary.todayRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Today Profit</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(summary.todayProfit)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Sales Count</p>
                        <p className="text-lg font-bold text-white">{summary.todaySalesCount}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="card space-y-4">
                <h2 className="section-title">Closing Form</h2>

                {[
                    { name: 'openingCash', label: 'Opening Cash (LKR)' },
                    { name: 'totalSales', label: 'Total Sales Count' },
                    { name: 'totalRevenue', label: 'Total Revenue (LKR)' },
                    { name: 'totalProfit', label: 'Total Profit (LKR)' },
                    { name: 'totalExpenses', label: 'Total Expenses (LKR)' },
                    { name: 'closingCash', label: 'Closing Cash (LKR)' },
                ].map(({ name, label }) => (
                    <div key={name}>
                        <label className="label">{label}</label>
                        <input
                            {...register(name as keyof FormData)}
                            type="number"
                            step="0.01"
                            className="input"
                        />
                        {errors[name as keyof FormData] && (
                            <p className="text-red-400 text-xs mt-1">{errors[name as keyof FormData]?.message}</p>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={mutation.isPending || mutation.isSuccess}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Moon className="w-4 h-4" />}
                    {mutation.isPending ? 'Closing Day…' : mutation.isSuccess ? '✓ Day Closed' : 'Close Day'}
                </button>
            </form>
        </div>
    );
}
