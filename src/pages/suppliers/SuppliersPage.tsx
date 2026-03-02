import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, Phone, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supplierService } from '../../api/supplierService';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import { useState } from 'react';
import { formatDate } from '../../utils/formatDate';

const schema = z.object({
    name: z.string().min(1, 'Name required'),
    phone: z.string().optional(),
    address: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SuppliersPage() {
    const [open, setOpen] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const qc = useQueryClient();

    const { data: suppliers = [], isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.getAll().then(r => r.data),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

    const createMutation = useMutation({
        mutationFn: supplierService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier added'); reset(); setOpen(false); },
        onError: () => toast.error('Failed to add supplier'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => supplierService.remove(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Supplier deleted'); setConfirmId(null); },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Failed to delete supplier';
            toast.error(msg);
            setConfirmId(null);
        },
    });

    const supplierToDelete = suppliers.find((s: any) => s._id === confirmId);

    return (
        <div className="p-6 space-y-5">
            <PageHeader
                title="Suppliers"
                subtitle="Manage your shoe suppliers"
                actions={
                    <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Add Supplier
                    </button>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading && <div className="col-span-3 flex justify-center py-10"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}
                {suppliers.map((s: any) => (
                    <div key={s._id} className="card space-y-2">
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-white">{s.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="badge-blue text-xs">Supplier</span>
                                <button
                                    onClick={() => setConfirmId(s._id)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                    title="Delete supplier"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {s.phone && <p className="text-sm text-gray-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {s.phone}</p>}
                        {s.address && <p className="text-sm text-gray-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {s.address}</p>}
                        <p className="text-xs text-gray-600">Added {formatDate(s.createdAt)}</p>
                    </div>
                ))}
                {!isLoading && suppliers.length === 0 && (
                    <div className="col-span-3 text-center text-gray-500 py-10">No suppliers yet</div>
                )}
            </div>

            {/* Add Supplier Modal */}
            <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Supplier" size="sm">
                <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
                    <div>
                        <label className="label">Name *</label>
                        <input {...register('name')} className="input" placeholder="Supplier Co." />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input {...register('phone')} className="input" placeholder="+94 77 123 4567" />
                    </div>
                    <div>
                        <label className="label">Address</label>
                        <input {...register('address')} className="input" placeholder="123 Main St, Colombo" />
                    </div>
                    <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {createMutation.isPending ? 'Adding…' : 'Add Supplier'}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Delete Supplier" size="sm">
                <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                        Are you sure you want to delete <span className="font-semibold text-white">{supplierToDelete?.name}</span>?
                    </p>
                    <p className="text-gray-500 text-xs">
                        This will fail if the supplier has existing purchases or products linked to them.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmId(null)}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => confirmId && deleteMutation.mutate(confirmId)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
