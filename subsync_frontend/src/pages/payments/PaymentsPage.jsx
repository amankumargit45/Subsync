import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Banknote, Plus, Download, CheckCircle2, Clock,
  AlertCircle, CreditCard, Filter
} from 'lucide-react';
import { paymentApi, customerApi, invoiceApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function PaymentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: paymentsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentApi.getAll({ limit: 100 }),
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll({ limit: 100 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll({ limit: 100 }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      customerId: '',
      invoiceId: '',
      amount: 5000,
      method: 'UPI',
      note: 'Advance payment',
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data) => paymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment successfully recorded and allocated');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.message || 'Payment recording failed'),
  });

  const onSubmit = (values) => {
    const customer = customersData?.data?.find(c => c.id === values.customerId);
    createPaymentMutation.mutate({
      ...values,
      customerName: customer?.name || 'Customer',
      amount: Number(values.amount),
      reference: `MANUAL/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  const columns = [
    {
      header: 'Payment ID',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
          {(row.paymentNumber || row.id || '').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Invoice',
      accessorKey: 'invoiceId',
      cell: (row) => {
        const invVal = typeof row.invoiceId === 'object' && row.invoiceId !== null
          ? (row.invoiceId.invoiceNumber || row.invoiceId._id)
          : row.invoiceNumber || row.invoiceId;
        return (
          <span className="font-mono text-xs text-surface-600 dark:text-surface-400">
            {invVal ? String(invVal).toUpperCase() : 'Unallocated'}
          </span>
        );
      },
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (row) => (
        <span className="font-medium text-surface-900 dark:text-surface-100">
          {row.customerName}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row) => (
        <span className="font-bold text-success-600 dark:text-success-500">
          +{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Method',
      accessorKey: 'method',
      cell: (row) => (
        <span className="text-xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium">
          {row.method}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row) => (
        <span className="text-xs text-surface-400">
          {row.date ? formatDate(row.date) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <span className={`inline-flex items-center text-xs font-semibold ${
          row.status === 'Completed' ? 'text-success-600' : row.status === 'Failed' ? 'text-danger-600' : 'text-warning-600'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Note',
      accessorKey: 'note',
      cell: (row) => (
        <span className="text-xs text-surface-500 truncate max-w-xs block">
          {row.note || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Payments Ledger
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Incoming receipts across UPI, Cards, Bank Transfers, and settlement receipts.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Record Payment
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={paymentsData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search payments by ID, customer, method..."
      />

      {/* Record Payment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Incoming Payment"
        description="Allocate incoming funds to a customer or specific invoice."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Customer"
            options={(customersData?.data || []).map(c => ({ value: c.id, label: `${c.name} (${c.company})` }))}
            {...register('customerId', { required: 'Customer is required' })}
            error={errors.customerId?.message}
            required
          />

          <Select
            label="Linked Invoice (Optional)"
            options={[
              { value: '', label: 'None (Unallocated advance balance)' },
              ...(invoicesData?.data || []).map(inv => ({
                value: inv.id,
                label: `${inv.id.toUpperCase()} - ${inv.customerName} (${formatCurrency(inv.total)})`
              }))
            ]}
            {...register('invoiceId')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="5000"
              {...register('amount', { required: 'Amount required' })}
              error={errors.amount?.message}
              required
            />
            <Select
              label="Payment Method"
              options={[
                { value: 'UPI', label: 'UPI' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Other', label: 'Other' },
              ]}
              {...register('method')}
            />
          </div>

          <Input
            label="Notes / Transaction Details"
            placeholder="NEFT bank transaction ID, cheque number, etc."
            {...register('note')}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createPaymentMutation.isPending}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

