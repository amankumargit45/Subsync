import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Pause, Play, RefreshCw, XCircle, FileText,
  User, Calendar, Clock, DollarSign, Receipt, CreditCard,
  CheckCircle2, ExternalLink
} from 'lucide-react';
import { subscriptionApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { SubscriptionTimeline } from '@/components/ui/SubscriptionTimeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function SubscriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  const { data: sub, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => subscriptionApi.getById(id),
  });

  const pauseMutation = useMutation({
    mutationFn: () => subscriptionApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription paused');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => subscriptionApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription resumed');
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => subscriptionApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription closed');
      setCloseConfirmOpen(false);
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: () => subscriptionApi.generateInvoice(id),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Generated recurring invoice ${inv.id.toUpperCase()}`);
      navigate(`/invoices/${inv.id}`);
    },
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !sub) {
    return <ErrorState title="Subscription Not Found" message="Could not find subscription contract." onRetry={refetch} />;
  }

  const invoices = sub.invoices || [];
  const payments = sub.payments || [];

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6 pt-2">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Monthly Billed</span>
              <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
                {formatCurrency(sub.amount)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Next Billing Date</span>
              <div className="text-base font-bold text-surface-900 dark:text-surface-100 mt-2">
                {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'Manual / None'}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Payment Terms</span>
              <div className="text-base font-bold text-surface-900 dark:text-surface-100 mt-2">
                {sub.paymentTerms || 'Net 15'}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Total Invoiced</span>
              <div className="text-base font-bold text-primary-600 dark:text-primary-400 mt-2">
                {invoices.length} invoices
              </div>
            </Card>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
                Customer & Account Details
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Customer Name:</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">{sub.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Company:</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">{sub.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Customer ID:</span>
                  <span className="font-mono text-surface-600 dark:text-surface-400">{sub.customerId}</span>
                </div>
              </div>
              <div className="pt-2">
                <Link to={`/customers/${sub.customerId}`}>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    <User className="h-3.5 w-3.5" /> View Full Customer Record
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
                Subscription Contract Terms
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Start Date:</span>
                  <span className="font-medium">{sub.startDate ? formatDate(sub.startDate) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Expiry Date:</span>
                  <span className="font-medium">{sub.endDate ? formatDate(sub.endDate) : 'Indefinite / Auto-renew'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Plan Associated:</span>
                  <span className="font-semibold text-primary-600">{sub.planName}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      value: 'lines',
      label: 'Subscription Lines',
      content: (
        <div className="card p-5 space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Configured Line Items</h3>
          <div className="border border-surface-200 dark:border-surface-800 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-surface-50 dark:bg-surface-800 text-surface-500 border-b border-surface-200 dark:border-surface-800">
                <tr>
                  <th className="p-3">Plan / Product</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3 text-right">Recurring Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 font-medium text-surface-900 dark:text-surface-100">{sub.planName}</td>
                  <td className="p-3">Monthly</td>
                  <td className="p-3">1 license</td>
                  <td className="p-3 text-right">{formatCurrency(sub.amount)}</td>
                  <td className="p-3 text-right font-bold text-primary-600">{formatCurrency(sub.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      value: 'invoices',
      label: 'Invoices',
      count: invoices.length,
      content: (
        <div className="pt-2">
          {invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Invoices Generated"
              description="Click 'Generate Invoice' in the top action bar to immediately create this cycle's bill."
              action={() => generateInvoiceMutation.mutate()}
              actionLabel="Generate First Invoice"
            />
          ) : (
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden divide-y divide-surface-200 dark:divide-surface-800">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="p-4 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                        {inv.id.toUpperCase()}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-xs text-surface-500 mt-0.5">
                      Issued: {formatDate(inv.issueDate)} • Due: {formatDate(inv.dueDate)}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-bold text-sm text-surface-900 dark:text-surface-100">
                      {formatCurrency(inv.total)}
                    </div>
                    <ExternalLink className="h-4 w-4 text-surface-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: 'payments',
      label: 'Payments',
      count: payments.length,
      content: (
        <div className="pt-2">
          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments recorded"
              description="No payments have settled against this subscription yet."
            />
          ) : (
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden divide-y divide-surface-200 dark:divide-surface-800">
              {payments.map((p) => (
                <div key={p.id} className="p-4 bg-white dark:bg-surface-900 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">
                      {p.id.toUpperCase()}
                    </div>
                    <div className="text-surface-500 mt-0.5">Method: {p.method} • {p.reference || 'Auto'}</div>
                  </div>
                  <div className="text-right font-bold text-sm text-success-600">
                    +{formatCurrency(p.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: 'timeline',
      label: 'Audit Trail',
      content: (
        <div className="card p-6 space-y-4 text-xs">
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Subscription History</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
            <div className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-white dark:ring-surface-900" />
              <div className="font-medium text-surface-900 dark:text-surface-100">Subscription Activated</div>
              <p className="text-surface-500 mt-0.5">Converted from quotation proposal</p>
              <span className="text-[10px] text-surface-400">{formatDate(sub.startDate || sub.createdAt)}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/subscriptions')}
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-surface-900 dark:text-surface-100 tracking-tight">
                {String(sub.subscriptionNumber || sub.id || '').toUpperCase()}
              </h1>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {sub.customerName} ({sub.company}) • {sub.planName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {sub.status === 'ACTIVE' && (
            <Button
              variant="secondary"
              size="sm"
              loading={pauseMutation.isPending}
              onClick={() => pauseMutation.mutate()}
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          )}

          {sub.status === 'PAUSED' && (
            <Button
              variant="secondary"
              size="sm"
              loading={resumeMutation.isPending}
              onClick={() => resumeMutation.mutate()}
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            loading={generateInvoiceMutation.isPending}
            onClick={() => generateInvoiceMutation.mutate()}
          >
            <FileText className="h-3.5 w-3.5" /> Generate Invoice
          </Button>

          {sub.status !== 'CLOSED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCloseConfirmOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" /> Close Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Visually impressive Lifecycle Status Timeline */}
      <Card className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2">
          Subscription Lifecycle State
        </div>
        <SubscriptionTimeline currentStatus={sub.status} />
      </Card>

      {/* Detailed Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />

      {/* Close Subscription Confirmation Dialog */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        title="Close Subscription?"
        message={`Are you sure you want to terminate subscription ${sub.id.toUpperCase()}? Recurring auto-invoicing will immediately cease.`}
        confirmText="Confirm Close"
        loading={closeMutation.isPending}
        onConfirm={() => closeMutation.mutateAsync()}
      />
    </div>
  );
}

