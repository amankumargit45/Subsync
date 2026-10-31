import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Receipt, Plus, CheckCircle2, XCircle, Eye,
  CreditCard, Send, Printer, Download, Filter
} from 'lucide-react';
import { invoiceApi, paymentApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  const { data: invoicesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => invoiceApi.getAll({ status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data) => paymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment recorded! Invoice marked as PAID.');
      setRecordPaymentModalOpen(false);
      setSelectedInvoice(null);
    },
    onError: (err) => toast.error(err.message || 'Payment recording failed'),
  });

  const handleOpenPaymentModal = (invoice, e) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setPaymentRef(`TXN/${Math.floor(100000000 + Math.random() * 900000000)}`);
    setRecordPaymentModalOpen(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    recordPaymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      amount: selectedInvoice.total,
      method: paymentMethod,
      reference: paymentRef,
      note: `Settlement for invoice ${selectedInvoice.id.toUpperCase()}`,
    });
  };

  const columns = [
    {
      header: 'Invoice #',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
          {(row.invoiceNumber || row.id || '').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (row) => (
        <div>
          <div className="font-medium text-surface-900 dark:text-surface-100">{row.customerName}</div>
          <div className="text-[11px] text-surface-400">{row.company}</div>
        </div>
      ),
    },
    {
      header: 'Subscription',
      accessorKey: 'subscriptionId',
      cell: (row) => {
        const subVal = typeof row.subscriptionId === 'object' && row.subscriptionId !== null
          ? (row.subscriptionId.subscriptionNumber || row.subscriptionId._id)
          : row.subscriptionNumber || row.subscriptionId;
        return (
          <span className="text-xs font-mono text-surface-600 dark:text-surface-400">
            {subVal ? String(subVal).toUpperCase() : 'One-time'}
          </span>
        );
      },
    },
    {
      header: 'Issue Date',
      accessorKey: 'issueDate',
      cell: (row) => (
        <span className="text-xs text-surface-500">
          {row.issueDate ? formatDate(row.issueDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (row) => (
        <span className="text-xs text-surface-500">
          {row.dueDate ? formatDate(row.dueDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: (row) => (
        <span className={`inline-flex items-center text-xs font-medium ${
          row.paymentStatus === 'Paid' ? 'text-success-600 dark:text-success-500' :
          row.paymentStatus === 'Overdue' ? 'text-danger-600 dark:text-danger-500' : 'text-warning-600 dark:text-warning-500'
        }`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status !== 'PAID' && row.status !== 'CANCELLED' && (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-7 px-2 text-success-600"
              onClick={(e) => handleOpenPaymentModal(row, e)}
              title="Record Payment"
            >
              <CreditCard className="h-3 w-3" /> Pay
            </Button>
          )}
          <button
            onClick={() => navigate(`/invoices/${row.id}`)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            title="View Invoice"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Recurring Invoices
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Auto-generated bills, payment receipts, and collection settlement ledger.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'PAID', 'CONFIRMED', 'OVERDUE', 'DRAFT', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === st
                ? 'bg-primary-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50'
            }`}
          >
            {st === 'all' ? 'All Invoices' : st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={invoicesData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search invoices by #, customer, or company..."
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
      />

      {/* Record Payment Modal */}
      <Modal
        open={recordPaymentModalOpen}
        onClose={() => setRecordPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.id.toUpperCase()}`}
        description={`Customer: ${selectedInvoice?.customerName} (${selectedInvoice?.company})`}
        size="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 flex justify-between items-center text-xs">
            <span className="text-surface-500">Invoice Balance Due:</span>
            <span className="font-bold text-base text-primary-600">
              {formatCurrency(selectedInvoice?.total || 0)}
            </span>
          </div>

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'UPI (PhonePe / GPay)' },
              { value: 'Card', label: 'Credit / Debit Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT / RTGS)' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Input
            label="Transaction Reference / ID"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="UPI/123456789"
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setRecordPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={recordPaymentMutation.isPending}>
              Confirm & Settle Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

