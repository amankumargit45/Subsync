import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Package, Plus, Trash2, Edit, Check, ArrowRight,
  Sliders, Layers, Tag, DollarSign, Eye
} from 'lucide-react';
import { productApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const { data: productsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  });

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'Subscription',
      salesPrice: 2500,
      costPrice: 800,
      description: '',
      status: 'Active',
      variants: [{ name: 'Default', priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchedSalesPrice = Number(watch('salesPrice', 0)) || 0;
  const watchedVariants = watch('variants') || [];

  const createMutation = useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      setModalOpen(false);
      setEditingProduct(null);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setSelectedForDelete(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete product'),
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      name: '',
      type: 'Subscription',
      salesPrice: 2500,
      costPrice: 800,
      description: '',
      status: 'Active',
      variants: [
        { name: 'Standard Edition', priceAdjustment: 0 },
        { name: 'Enterprise Edition', priceAdjustment: 1500 },
      ],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product, e) => {
    e.stopPropagation();
    setEditingProduct(product);
    reset({
      name: product.name,
      type: product.type || 'Subscription',
      salesPrice: product.salesPrice,
      costPrice: product.costPrice,
      description: product.description || '',
      status: product.status || 'Active',
      variants: product.variants?.length ? product.variants : [{ name: 'Default', priceAdjustment: 0 }],
    });
    setModalOpen(true);
  };

  const handleFormSubmit = (values) => {
    const payload = {
      ...values,
      salesPrice: Number(values.salesPrice),
      costPrice: Number(values.costPrice),
      variants: values.variants.map((v, i) => ({
        id: v.id || `var-${Date.now()}-${i}`,
        name: v.name,
        priceAdjustment: Number(v.priceAdjustment) || 0,
      })),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = [
    {
      header: 'Product',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-surface-900 dark:text-surface-100 hover:text-primary-600 transition-colors">
            {row.name}
          </span>
          <span className="text-[11px] text-surface-400 truncate max-w-xs">{row.description || 'No description'}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row) => (
        <span className="text-xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium">
          {row.type}
        </span>
      ),
    },
    {
      header: 'Sales Price',
      accessorKey: 'salesPrice',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {formatCurrency(row.salesPrice)}
        </span>
      ),
    },
    {
      header: 'Cost Price',
      accessorKey: 'costPrice',
      cell: (row) => (
        <span className="text-surface-500">
          {formatCurrency(row.costPrice)}
        </span>
      ),
    },
    {
      header: 'Variants',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {row.variants && row.variants.length > 0 ? (
            row.variants.slice(0, 2).map((v, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40">
                {v.name} {v.priceAdjustment !== 0 && `(+${v.priceAdjustment})`}
              </span>
            ))
          ) : (
            <span className="text-surface-400 text-xs">Standard</span>
          )}
          {row.variants?.length > 2 && (
            <span className="text-[10px] text-surface-400">+{row.variants.length - 2} more</span>
          )}
        </div>
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
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            title="Edit product"
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
            title="Delete product"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Products & Variants
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Configure subscription products, SKU specifications, and multi-tier variant pricing.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={productsData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search products by title or type..."
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        emptyTitle="No products found"
        emptyDescription="Create your first sellable service or recurring product."
        emptyAction={handleOpenCreate}
        emptyActionLabel="Add Product"
      />

      {/* Create / Edit Product Modal with Variant Builder */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create Product with Variant Builder'}
        description="Specify core pricing, product type, and configure custom variant adjustments."
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                placeholder="Cloud Storage Enterprise"
                {...register('name', { required: 'Product name is required' })}
                error={errors.name?.message}
                required
              />
            </div>
            <div>
              <Select
                label="Product Type"
                options={[
                  { value: 'Subscription', label: 'Subscription' },
                  { value: 'Service', label: 'Service' },
                  { value: 'Consumable', label: 'Consumable' },
                ]}
                {...register('type')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Sales Price (₹)"
              type="number"
              placeholder="2500"
              {...register('salesPrice', { required: 'Sales price required' })}
              error={errors.salesPrice?.message}
              required
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              placeholder="800"
              {...register('costPrice', { required: 'Cost price required' })}
            />
          </div>

          <Textarea
            label="Product Description"
            placeholder="Key features, storage quotas, compute limits..."
            {...register('description')}
          />

          {/* Variant Builder Section */}
          <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary-600" /> Variant Builder & Pricing Preview
                </h4>
                <p className="text-[11px] text-surface-500">
                  Each variant adds or discounts from the base price.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ name: '', priceAdjustment: 0 })}
              >
                <Plus className="h-3.5 w-3.5" /> Add Variant
              </Button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {fields.map((field, idx) => {
                const adj = Number(watchedVariants[idx]?.priceAdjustment) || 0;
                const finalCalculated = watchedSalesPrice + adj;

                return (
                  <div key={field.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-xs">
                    <div className="flex-1">
                      <input
                        placeholder="Variant name (e.g. 500 GB, Odoo Brand)"
                        className="input-base py-1 px-2 text-xs"
                        {...register(`variants.${idx}.name`, { required: true })}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Adjustment (₹)"
                        className="input-base py-1 px-2 text-xs"
                        {...register(`variants.${idx}.priceAdjustment`)}
                      />
                    </div>
                    <div className="w-24 text-right font-semibold text-primary-600 dark:text-primary-400">
                      = {formatCurrency(finalCalculated)}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-1 rounded text-surface-400 hover:text-danger-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Save Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Product?"
        message={`Are you sure you want to delete ${selectedForDelete?.name}? Existing subscriptions using this product will remain unaffected.`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutateAsync(selectedForDelete?.id)}
      />
    </div>
  );
}

