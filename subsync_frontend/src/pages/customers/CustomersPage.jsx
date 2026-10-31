import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Users, Plus, Download, Edit, Trash2, Eye, Mail,
  Phone, Building2, CheckCircle2, MoreHorizontal, ArrowUpDown
} from 'lucide-react';
import { customerApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function CustomersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const { data: customersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll({ limit: 100 }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to create customer'),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
      setModalOpen(false);
      setEditingCustomer(null);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Failed to update customer'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer archived');
      setSelectedForDelete(null);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete customer'),
  });

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    reset({
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      gstNumber: '',
      notes: '',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      email: customer.email,
      company: customer.company,
      phone: customer.phone || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      notes: customer.notes || '',
      status: customer.status || 'Active',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = (values) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleExportCSV = () => {
    if (!customersData?.data) return;
    const headers = ['ID,Name,Email,Company,Phone,ActiveSubscriptions,TotalRevenue,Outstanding,Status,CreatedAt'];
    const rows = customersData.data.map(c =>
      `"${c.id}","${c.name}","${c.email}","${c.company}","${c.phone || ''}","${c.activeSubscriptions}","${c.totalRevenue}","${c.outstanding}","${c.status}","${c.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customer list exported to CSV');
  };

  const columns = [
    {
      header: 'Customer',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-surface-900 dark:text-surface-100 hover:text-primary-600 transition-colors">
            {row.name}
          </span>
          <span className="text-[11px] text-surface-400">{row.id}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (row) => (
        <span className="text-surface-600 dark:text-surface-400 text-xs">
          {row.email}
        </span>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (row) => (
        <span className="font-medium text-surface-800 dark:text-surface-200">
          {row.company || '—'}
        </span>
      ),
    },
    {
      header: 'Active Subs',
      accessorKey: 'activeSubscriptions',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
          {row.activeSubscriptions} active
        </span>
      ),
    },
    {
      header: 'Total Revenue',
      accessorKey: 'totalRevenue',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {formatCurrency(row.totalRevenue)}
        </span>
      ),
    },
    {
      header: 'Outstanding',
      accessorKey: 'outstanding',
      cell: (row) => (
        <span className={row.outstanding > 0 ? 'font-semibold text-danger-600 dark:text-danger-400' : 'text-surface-400'}>
          {row.outstanding > 0 ? formatCurrency(row.outstanding) : '₹0'}
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
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            title="Edit customer"
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
            title="Archive customer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Manage your customer database, company accounts, and billing ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={customersData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search by customer, company, or email..."
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        emptyTitle="No customers registered"
        emptyDescription="Get started by adding your first B2B client account."
        emptyAction={handleOpenCreate}
        emptyActionLabel="Add First Customer"
      />

      {/* Create / Edit Customer Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Create New Customer'}
        description="Add company profile and billing contact information."
        size="lg"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              placeholder="e.g. Vikram Patel"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="vikram@abctech.in"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
              })}
              error={errors.email?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="ABC Technologies Pvt Ltd"
              {...register('company', { required: 'Company is required' })}
              error={errors.company?.message}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              {...register('phone')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GST / Tax Identification"
              placeholder="29AABCT1234A1ZV"
              {...register('gstNumber')}
            />
            <Select
              label="Account Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              {...register('status')}
            />
          </div>

          <Input
            label="Billing Address"
            placeholder="123 MG Road, Bangalore, Karnataka"
            {...register('address')}
          />

          <Textarea
            label="Internal Notes"
            placeholder="Account tier, SLA agreements, or special invoice requirements..."
            {...register('notes')}
          />

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
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive / Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Archive Customer?"
        message={`Are you sure you want to archive ${selectedForDelete?.name} (${selectedForDelete?.company})? Active subscriptions will not be immediately cancelled.`}
        confirmText="Archive Customer"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutateAsync(selectedForDelete?.id)}
      />
    </div>
  );
}

