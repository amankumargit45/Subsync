import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  CreditCard, Plus, LayoutGrid, List, Check, X,
  Clock, Calendar, RefreshCw, Edit, Trash2, ArrowRight,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { planApi, productApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function PlansPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const { data: plansData, isLoading, isError, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planApi.getAll({ limit: 100 }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      productId: '',
      price: 2500,
      billingFrequency: 'Monthly',
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenewal: true,
      status: 'Active',
    },
  });

  // Watch form fields for live preview card
  const watchedName = watch('name') || 'Enterprise Subscription Plan';
  const watchedPrice = watch('price') || 0;
  const watchedFrequency = watch('billingFrequency') || 'Monthly';
  const watchedAllowPause = watch('allowPause');
  const watchedAllowRenewal = watch('allowRenewal');
  const watchedAllowEarlyClose = watch('allowEarlyClose');
  const watchedAutoClose = watch('autoClose');
  const watchedProductId = watch('productId');

  const selectedProduct = productsData?.data?.find(p => p.id === watchedProductId);

  const createMutation = useMutation({
    mutationFn: (data) => planApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Subscription plan created successfully');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to create plan'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => planApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Subscription plan updated');
      setModalOpen(false);
      setEditingPlan(null);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to update plan'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => planApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted');
      setSelectedForDelete(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete plan'),
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    reset({
      name: '',
      productId: productsData?.data?.[0]?.id || '',
      price: 2500,
      billingFrequency: 'Monthly',
      minQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenewal: true,
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan, e) => {
    e?.stopPropagation();
    setEditingPlan(plan);
    reset({
      name: plan.name,
      productId: plan.productId,
      price: plan.price,
      billingFrequency: plan.billingFrequency,
      minQuantity: plan.minQuantity,
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      autoClose: !!plan.autoClose,
      allowPause: !!plan.allowPause,
      allowEarlyClose: !!plan.allowEarlyClose,
      allowRenewal: !!plan.allowRenewal,
      status: plan.status || 'Active',
    });
    setModalOpen(true);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      price: Number(values.price),
      minQuantity: Number(values.minQuantity),
      autoClose: Boolean(values.autoClose),
      allowPause: Boolean(values.allowPause),
      allowEarlyClose: Boolean(values.allowEarlyClose),
      allowRenewal: Boolean(values.allowRenewal),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      header: 'Plan Name',
      accessorKey: 'name',
      cell: (row) => (
        <div>
          <span className="font-semibold text-surface-900 dark:text-surface-100">{row.name}</span>
          <div className="text-[11px] text-surface-400">{row.productName}</div>
        </div>
      ),
    },
    {
      header: 'Frequency',
      accessorKey: 'billingFrequency',
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
          {row.billingFrequency}
        </span>
      ),
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {formatCurrency(row.price)}
        </span>
      ),
    },
    {
      header: 'Subscribers',
      accessorKey: 'subscriberCount',
      cell: (row) => (
        <span className="text-xs text-surface-600 dark:text-surface-400">
          {row.subscriberCount || 0} active
        </span>
      ),
    },
    {
      header: 'Policies',
      cell: (row) => (
        <div className="flex items-center gap-2 text-[11px] text-surface-500">
          {row.allowPause && <span className="text-primary-600 dark:text-primary-400">Pauseable</span>}
          {row.allowRenewal && <span>• Auto-Renew</span>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedForDelete(row);
              setDeleteConfirmOpen(true);
            }}
            className="p-1 rounded text-surface-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & View toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Define recurring billing frequencies, renewal rules, and packaging terms.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Grid vs Table toggle */}
          <div className="flex items-center p-1 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-surface-900 shadow-xs text-primary-600' : 'text-surface-400'}`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-surface-900 shadow-xs text-primary-600' : 'text-surface-400'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Create Plan
          </Button>
        </div>
      </div>

      {/* Main Content: Cards Grid or Data Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansData?.data?.map((plan) => (
            <div
              key={plan.id}
              className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 border border-surface-200 dark:border-surface-800"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
                      {plan.name}
                    </h3>
                    <span className="text-xs text-surface-500">{plan.productName}</span>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>

                <div className="py-4 border-y border-surface-100 dark:border-surface-800 my-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-surface-900 dark:text-surface-100">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs font-medium text-surface-500">
                      / {plan.billingFrequency.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 mt-1">
                    Minimum commitment: {plan.minQuantity} seat(s)
                  </p>
                </div>

                {/* Plan rules checklist */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    {plan.allowPause ? (
                      <Check className="h-3.5 w-3.5 text-success-600 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-surface-300 shrink-0" />
                    )}
                    <span>Allows temporary subscription pause</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    {plan.allowRenewal ? (
                      <Check className="h-3.5 w-3.5 text-success-600 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-surface-300 shrink-0" />
                    )}
                    <span>Automated billing renewal</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400">
                    {plan.allowEarlyClose ? (
                      <Check className="h-3.5 w-3.5 text-success-600 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-surface-300 shrink-0" />
                    )}
                    <span>Early termination permitted</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {plan.subscriberCount || 0} active subscribers
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedForDelete(plan);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-surface-100 dark:hover:bg-surface-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={plansData?.data || []}
          loading={isLoading}
          error={isError}
          onRetry={refetch}
          searchPlaceholder="Search plans..."
        />
      )}

      {/* Multi-section Create / Edit Plan Modal with Pricing Preview Card */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
        description="Configure subscription billing cycles, minimum requirements, and governance rules."
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Multi-section inputs */}
            <div className="lg:col-span-2 space-y-5">
              {/* SECTION 1: Basic Identity */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
                  1. Plan Identity & Packaging
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Plan Name"
                    placeholder="e.g. Cloud Storage Pro Monthly"
                    {...register('name', { required: 'Plan name is required' })}
                    error={errors.name?.message}
                    required
                  />
                  <Select
                    label="Associated Product"
                    options={(productsData?.data || []).map(p => ({ value: p.id, label: `${p.name} (₹${p.salesPrice})` }))}
                    {...register('productId', { required: 'Select a product' })}
                    required
                  />
                </div>
              </div>

              {/* SECTION 2: Pricing & Cycles */}
              <div className="space-y-3 pt-3 border-t border-surface-100 dark:border-surface-800">
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
                  2. Pricing & Frequency
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Plan Price (₹)"
                    type="number"
                    placeholder="7500"
                    {...register('price', { required: 'Price is required' })}
                    error={errors.price?.message}
                    required
                  />
                  <Select
                    label="Billing Frequency"
                    options={[
                      { value: 'Daily', label: 'Daily' },
                      { value: 'Weekly', label: 'Weekly' },
                      { value: 'Monthly', label: 'Monthly' },
                      { value: 'Yearly', label: 'Yearly' },
                    ]}
                    {...register('billingFrequency')}
                  />
                  <Input
                    label="Min Quantity"
                    type="number"
                    placeholder="1"
                    {...register('minQuantity')}
                  />
                </div>
              </div>

              {/* SECTION 3: Lifecycle & Rules */}
              <div className="space-y-3 pt-3 border-t border-surface-100 dark:border-surface-800">
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
                  3. Subscription Rules & Permissions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input type="checkbox" className="rounded text-primary-600" {...register('allowPause')} />
                    <span>Allow customer to pause subscription</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input type="checkbox" className="rounded text-primary-600" {...register('allowRenewal')} />
                    <span>Enable automated renewal billing</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input type="checkbox" className="rounded text-primary-600" {...register('allowEarlyClose')} />
                    <span>Allow early termination by customer</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                    <input type="checkbox" className="rounded text-primary-600" {...register('autoClose')} />
                    <span>Auto-close at end date (no rollover)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Col: Live Pricing Preview Card */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block">
                Live Pricing Preview
              </span>
              <div className="p-5 rounded-xl border border-primary-200 dark:border-primary-800/60 bg-primary-50/40 dark:bg-primary-950/20 text-xs space-y-4">
                <div>
                  <span className="text-[10px] font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                    Client Invoice Preview
                  </span>
                  <div className="font-bold text-base text-surface-900 dark:text-surface-100 mt-0.5">
                    {watchedName}
                  </div>
                  <div className="text-[11px] text-surface-500">
                    {selectedProduct?.name || 'Linked Product'}
                  </div>
                </div>

                <div className="text-2xl font-black text-primary-600 dark:text-primary-400">
                  {formatCurrency(watchedPrice)} <span className="text-xs font-normal text-surface-500">/{watchedFrequency}</span>
                </div>

                <div className="border-t border-primary-200/50 dark:border-primary-800/40 pt-3 space-y-1.5 text-[11px] text-surface-600 dark:text-surface-400">
                  <div className="flex justify-between">
                    <span>Recurring cycle:</span>
                    <span className="font-medium text-surface-900 dark:text-surface-100">{watchedFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%):</span>
                    <span className="font-medium text-surface-900 dark:text-surface-100">+{formatCurrency(watchedPrice * 0.18)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-surface-900 dark:text-surface-100 pt-1 border-t border-primary-200/40 dark:border-primary-800/30">
                    <span>Gross Billed:</span>
                    <span className="text-primary-600 dark:text-primary-400">{formatCurrency(watchedPrice * 1.18)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Plan?"
        message={`Are you sure you want to delete ${selectedForDelete?.name}?`}
        confirmText="Delete Plan"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutateAsync(selectedForDelete?.id)}
      />
    </div>
  );
}

