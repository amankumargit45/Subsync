import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Percent, Plus, Edit, Trash2, Tag, Calendar,
  ShieldAlert, Check, Clock
} from 'lucide-react';
import { discountApi, productApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function DiscountsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const { data: discountsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => discountApi.getAll({ limit: 100 }),
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'Percentage',
      value: 10,
      minQuantity: 1,
      minPurchase: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      usageLimit: 100,
      status: 'Active',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => discountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount rule created');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => discountApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount updated');
      setModalOpen(false);
      setEditingDiscount(null);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => discountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount rule removed');
      setSelectedForDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingDiscount(null);
    reset({
      name: '',
      type: 'Percentage',
      value: 10,
      minQuantity: 1,
      minPurchase: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      usageLimit: 100,
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (discount, e) => {
    e?.stopPropagation();
    setEditingDiscount(discount);
    reset({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      minQuantity: discount.minQuantity,
      minPurchase: discount.minPurchase,
      startDate: discount.startDate || '',
      endDate: discount.endDate || '',
      usageLimit: discount.usageLimit,
      status: discount.status || 'Active',
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      value: Number(values.value),
      minQuantity: Number(values.minQuantity),
      minPurchase: Number(values.minPurchase),
      usageLimit: Number(values.usageLimit),
    };

    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      header: 'Campaign Name',
      accessorKey: 'name',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {row.name}
        </span>
      ),
    },
    {
      header: 'Benefit',
      accessorKey: 'value',
      cell: (row) => (
        <span className="font-bold text-success-600 dark:text-success-500">
          {row.type === 'Percentage' ? `${row.value}% OFF` : `${formatCurrency(row.value)} OFF`}
        </span>
      ),
    },
    {
      header: 'Usage Progress',
      cell: (row) => {
        const pct = Math.min(100, Math.round(((row.usageCount || 0) / (row.usageLimit || 1)) * 100));
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[11px] text-surface-500">
              <span>{row.usageCount || 0} / {row.usageLimit}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-danger-500' : 'bg-primary-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Validity Window',
      cell: (row) => (
        <span className="text-xs text-surface-500">
          {row.endDate ? `Until ${formatDate(row.endDate)}` : 'No expiry'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    ...(isAdmin ? [{
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedForDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-surface-400 hover:text-danger-600 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Discounts & Coupons
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Administer promotional percentage codes, loyalty vouchers, and volume tier cuts.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Create Discount
          </Button>
        )}
      </div>

      {/* Discount Cards visual overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {discountsData?.data?.slice(0, 3).map((disc) => {
          const pct = Math.min(100, Math.round(((disc.usageCount || 0) / (disc.usageLimit || 1)) * 100));
          return (
            <div key={disc.id} className="card p-5 border border-surface-200 dark:border-surface-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-sm text-surface-900 dark:text-surface-100 block">{disc.name}</span>
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-0.5 block">
                    {disc.type === 'Percentage' ? `${disc.value}% OFF` : `${formatCurrency(disc.value)} OFF`}
                  </span>
                </div>
                <StatusBadge status={disc.status} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-surface-500">
                  <span>Usage: {disc.usageCount} / {disc.usageLimit}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div className={`h-full ${pct >= 100 ? 'bg-danger-500' : 'bg-primary-600'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="text-[11px] text-surface-400 pt-1">
                Valid until {disc.endDate ? formatDate(disc.endDate) : 'Indefinite'}
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={discountsData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search discounts..."
      />

      {/* Modal for Admin */}
      {isAdmin && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDiscount ? `Edit Discount: ${editingDiscount.name}` : 'Create Discount Rule'}
          description="Configure discount rules, threshold conditions, and usage caps."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Discount Campaign Name"
              placeholder="e.g. Q4 Growth Promo"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Discount Type"
                options={[
                  { value: 'Percentage', label: 'Percentage (%)' },
                  { value: 'Fixed', label: 'Fixed Amount (₹)' },
                ]}
                {...register('type')}
              />
              <Input
                label="Discount Value"
                type="number"
                placeholder="10"
                {...register('value', { required: 'Value is required' })}
                error={errors.value?.message}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Usage Limit"
                type="number"
                placeholder="100"
                {...register('usageLimit')}
              />
              <Input
                label="Valid Until"
                type="date"
                {...register('endDate')}
              />
            </div>

            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Expired', label: 'Expired' },
                { value: 'Exhausted', label: 'Exhausted' },
              ]}
              {...register('status')}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending || updateMutation.isPending}>
                Save Discount
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Discount?"
        message={`Are you sure you want to delete ${selectedForDelete?.name}?`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutateAsync(selectedForDelete?.id)}
      />
    </div>
  );
}

