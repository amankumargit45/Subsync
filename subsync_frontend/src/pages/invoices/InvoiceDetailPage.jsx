import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Printer, Download, Send, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Building2, Mail
} from 'lucide-react';
import { invoiceApi, paymentApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  const { data: invoice, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getById(id),
  });

  const confirmMutation = useMutation({
    mutationFn: () => invoiceApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice confirmed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => invoiceApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.info('Invoice cancelled');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data) => paymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payment settled! Invoice marked as PAID.');
      setPaymentModalOpen(false);
    },
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !invoice) {
    return <ErrorState title="Invoice Not Found" message="Could not find invoice document." onRetry={refetch} />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    toast.success(`Invoice dispatched to ${invoice.customerName}'s billing email`);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    recordPaymentMutation.mutate({
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      amount: invoice.total,
      method: paymentMethod,
      reference: paymentRef || `TXN/${Date.now()}`,
      note: `Settled online for ${invoice.id.toUpperCase()}`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-surface-900 dark:text-surface-100 tracking-tight">
                {invoice.id.toUpperCase()}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Due Date: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === 'DRAFT' && (
            <Button
              variant="secondary"
              size="sm"
              loading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate()}
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm Invoice
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={handleSend}>
            <Send className="h-4 w-4" /> Send Email
          </Button>

          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>

          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> PDF
          </Button>

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard className="h-4 w-4" /> Record Payment
            </Button>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button
              variant="danger"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Professional Printable Invoice Sheet */}
      <div className="card p-8 sm:p-12 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-surface-200 dark:border-surface-800 pb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black text-lg">
                S
              </div>
              <span className="text-2xl font-black tracking-tight text-surface-900 dark:text-surface-100">
                SubFlow
              </span>
            </div>
            <p className="text-xs text-surface-500 pt-2">
              Brightloop Software Pvt Ltd<br />
              100 Feet Ring Road, Indiranagar<br />
              Bangalore, Karnataka 560038, India<br />
              GSTIN: 29AABCB1234F1Z8
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              TAX INVOICE
            </span>
            <div className="text-2xl font-mono font-bold text-surface-900 dark:text-surface-100">
              #{String(invoice.invoiceNumber || invoice.id || '').toUpperCase()}
            </div>
            <div className="pt-2 text-xs text-surface-500 space-y-0.5">
              <div>Issue Date: <span className="font-medium text-surface-900 dark:text-surface-100">{formatDate(invoice.issueDate)}</span></div>
              <div>Due Date: <span className="font-medium text-surface-900 dark:text-surface-100">{formatDate(invoice.dueDate)}</span></div>
              {invoice.subscriptionId && (
                <div>Subscription: <span className="font-mono text-primary-600">
                  {String(typeof invoice.subscriptionId === 'object' ? (invoice.subscriptionId.subscriptionNumber || invoice.subscriptionId._id) : invoice.subscriptionId).toUpperCase()}
                </span></div>
              )}
            </div>
          </div>
        </div>

        {/* Billed To / Client Info */}
        <div className="py-6 border-b border-surface-200 dark:border-surface-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-1">
              Billed To:
            </span>
            <div className="text-sm font-bold text-surface-900 dark:text-surface-100">
              {invoice.company || invoice.customerName}
            </div>
            <div className="text-surface-600 dark:text-surface-400 mt-0.5">
              Attn: {invoice.customerName}<br />
              Client ID: {invoice.customerId}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider block mb-1">
              Payment Status:
            </span>
            <div className="inline-block mt-0.5">
              <StatusBadge status={invoice.paymentStatus?.toUpperCase() || invoice.status} />
            </div>
            <div className="text-surface-500 mt-1">
              Terms: Net 15 Days
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">Tax (18%)</th>
                <th className="py-3 px-2 text-right">Discount</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 px-2">
                      <div className="font-semibold text-surface-900 dark:text-surface-100">{item.product}</div>
                      {item.variant && <div className="text-[11px] text-surface-400">{item.variant}</div>}
                    </td>
                    <td className="py-4 px-2 text-center">{item.quantity}</td>
                    <td className="py-4 px-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 px-2 text-right">{formatCurrency(item.tax)}</td>
                    <td className="py-4 px-2 text-right">{item.discount > 0 ? `-${formatCurrency(item.discount)}` : '—'}</td>
                    <td className="py-4 px-2 text-right font-bold text-surface-900 dark:text-surface-100">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 px-2">
                    <div className="font-semibold text-surface-900 dark:text-surface-100">{invoice.planName}</div>
                    <div className="text-[11px] text-surface-400">Subscription recurring billing</div>
                  </td>
                  <td className="py-4 px-2 text-center">1</td>
                  <td className="py-4 px-2 text-right">{formatCurrency(invoice.amount)}</td>
                  <td className="py-4 px-2 text-right">{formatCurrency(invoice.tax)}</td>
                  <td className="py-4 px-2 text-right">{invoice.discount > 0 ? `-${formatCurrency(invoice.discount)}` : '—'}</td>
                  <td className="py-4 px-2 text-right font-bold text-surface-900 dark:text-surface-100">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="border-t border-surface-200 dark:border-surface-800 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
          <div className="text-surface-500 max-w-sm space-y-2">
            <span className="font-semibold text-surface-700 dark:text-surface-300 block">Bank Settlement Details</span>
            <p>
              Bank: HDFC Bank Ltd<br />
              A/C Name: Brightloop Software Private Limited<br />
              A/C Number: 50200012345678<br />
              IFSC: HDFC0001234 • UPI ID: subflow@hdfcbank
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>Subtotal:</span>
              <span className="font-medium text-surface-900 dark:text-surface-100">{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-success-600">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-surface-600 dark:text-surface-400">
              <span>GST (18%):</span>
              <span className="font-medium text-surface-900 dark:text-surface-100">+{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t border-surface-200 dark:border-surface-800 pt-2 flex justify-between font-bold text-sm text-surface-900 dark:text-surface-100">
              <span>Total Balance:</span>
              <span className="text-primary-600 text-base">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-surface-100 dark:border-surface-800/60 text-center text-[11px] text-surface-400">
          Thank you for choosing SubFlow. Generated electronically. No physical signature required.
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${invoice.id.toUpperCase()}`}
        description={`Record customer settlement of ${formatCurrency(invoice.total)}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Payment Mode"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'UPI (PhonePe / Google Pay)' },
              { value: 'Card', label: 'Credit / Debit Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT / RTGS)' },
              { value: 'Cash', label: 'Cash' },
            ]}
          />

          <Input
            label="Transaction Reference"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="UPI/123456789"
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={recordPaymentMutation.isPending}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

