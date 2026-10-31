import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Calculator, Plus, Edit, Trash2, CheckCircle2,
  Receipt, ShieldCheck, ArrowRight
} from 'lucide-react';
import { taxApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function TaxesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [testAmount, setTestAmount] = useState(10000);

  const { data: taxesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => taxApi.getAll({ limit: 100 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      rate: 18,
      type: 'Percentage',
      description: '',
      status: 'Active',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => taxApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax rule created');
      setModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taxApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax rule updated');
      setModalOpen(false);
      setEditingTax(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taxApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
      toast.success('Tax rule deleted');
      setSelectedForDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingTax(null);
    reset({
      name: '',
      rate: 18,
      type: 'Percentage',
      description: '',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (tax, e) => {
    e?.stopPropagation();
    setEditingTax(tax);
    reset({
      name: tax.name,
      rate: tax.rate,
      type: tax.type,
      description: tax.description || '',
      status: tax.status || 'Active',
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      rate: Number(values.rate),
    };

    if (editingTax) {
      updateMutation.mutate({ id: editingTax.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      header: 'Tax Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <span className="font-semibold text-surface-900 dark:text-surface-100">{row.name}</span>
          <div className="text-[11px] text-surface-400">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Rate',
      accessorKey: 'rate',
      cell: (row) => (
        <span className="font-bold text-primary-600 dark:text-primary-400">
          {row.rate}%
        </span>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Tax on ₹10,000 Sample',
      cell: (row) => (
        <span className="text-xs text-surface-600 dark:text-surface-300">
          +{formatCurrency((testAmount * row.rate) / 100)} = <span className="font-semibold text-surface-900 dark:text-surface-100">{formatCurrency(testAmount * (1 + row.rate / 100))}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-surface-400">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
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
            Tax Rules & GST Rates
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Configure central, state, and unified GST percentages for automated recurring invoicing.
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Add Tax Rule
          </Button>
        )}
      </div>

      {/* Tax Interactive Preview Calculator */}
      <div className="card p-5 border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-surface-400">Live Tax Preview Tool</span>
            <div className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Calculate output tax on test base amount
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">Base Amount: ₹</span>
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
            className="input-base py-1 px-3 w-32 text-xs"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={taxesData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search taxes..."
      />

      {isAdmin && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTax ? `Edit Tax: ${editingTax.name}` : 'Create Tax Rule'}
          description="Specify tax designation and percentage levy."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Tax Name"
              placeholder="e.g. GST or SGST"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.1"
                placeholder="18"
                {...register('rate', { required: 'Rate is required' })}
                error={errors.rate?.message}
                required
              />
              <Select
                label="Type"
                options={[
                  { value: 'Percentage', label: 'Percentage (%)' },
                  { value: 'Fixed', label: 'Fixed' },
                ]}
                {...register('type')}
              />
            </div>

            <Input
              label="Description / Legal Reference"
              placeholder="Goods and Services Tax (inter-state)"
              {...register('description')}
            />

            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              {...register('status')}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
              <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending || updateMutation.isPending}>
                Save Tax Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Tax Rule?"
        message={`Are you sure you want to delete ${selectedForDelete?.name}?`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutateAsync(selectedForDelete?.id)}
      />
    </div>
  );
}

