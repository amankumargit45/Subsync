import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, FileText,
  CreditCard, RefreshCw, Receipt, Clock, Calendar, ShieldCheck,
  Plus, ExternalLink
} from 'lucide-react';
import { customerApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customer, isLoading, isError, refetch } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id),
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !customer) {
    return <ErrorState title="Customer Not Found" message="Could not find client record." onRetry={refetch} />;
  }

  const subscriptions = customer.subscriptions || [];
  const invoices = customer.invoices || [];
  const payments = customer.payments || [];

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6 pt-2">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
              <span className="text-xs text-surface-500 font-medium">Active Subscriptions</span>
              <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
                {customer.activeSubscriptions}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
              <span className="text-xs text-surface-500 font-medium">Total Lifetime Revenue</span>
              <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
                {formatCurrency(customer.totalRevenue)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
              <span className="text-xs text-surface-500 font-medium">Outstanding Balance</span>
              <div className={`text-2xl font-bold mt-1 ${customer.outstanding > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-surface-900 dark:text-surface-100'}`}>
                {formatCurrency(customer.outstanding)}
              </div>
            </Card>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
                Business & Contact Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Mail className="h-4 w-4 text-surface-400 shrink-0" />
                  <span className="font-medium text-surface-900 dark:text-surface-100">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Phone className="h-4 w-4 text-surface-400 shrink-0" />
                  <span>{customer.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                  <Building2 className="h-4 w-4 text-surface-400 shrink-0" />
                  <span>GSTIN: <span className="font-mono font-medium">{customer.gstNumber || 'Unregistered'}</span></span>
                </div>
                <div className="flex items-start gap-3 text-surface-600 dark:text-surface-400">
                  <MapPin className="h-4 w-4 text-surface-400 shrink-0 mt-0.5" />
                  <span>{customer.address || 'No billing address specified'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
                Account Notes & Governance
              </h3>
              <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed min-h-[60px]">
                {customer.notes || 'No special notes or terms added for this customer account.'}
              </p>
              <div className="pt-2 border-t border-surface-100 dark:border-surface-800 text-[11px] text-surface-400">
                Customer since {formatDate(customer.createdAt)}
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      value: 'subscriptions',
      label: 'Subscriptions',
      count: subscriptions.length,
      content: (
        <div className="pt-2">
          {subscriptions.length === 0 ? (
            <EmptyState
              icon={RefreshCw}
              title="No subscriptions"
              description="This customer does not have any active subscriptions."
              action={() => navigate('/quotations/new')}
              actionLabel="Create Quotation"
            />
          ) : (
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden divide-y divide-surface-200 dark:divide-surface-800">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/subscriptions/${sub.id}`)}
                  className="p-4 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                        {sub.planName}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <div className="text-xs text-surface-500 mt-1 flex items-center gap-2">
                      <span>ID: <span className="font-mono">{String(sub.subscriptionNumber || sub.id || '').toUpperCase()}</span></span>
                      <span>•</span>
                      <span>Next Billing: {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right flex items-center gap-4">
                    <div>
                      <div className="font-bold text-sm text-surface-900 dark:text-surface-100">
                        {formatCurrency(sub.amount)}
                      </div>
                      <div className="text-[11px] text-surface-400">Terms: {sub.paymentTerms}</div>
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
      value: 'invoices',
      label: 'Invoices',
      count: invoices.length,
      content: (
        <div className="pt-2">
          {invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices generated"
              description="No billing cycles have run for this customer yet."
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
                        {String(inv.invoiceNumber || inv.id || '').toUpperCase()}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-xs text-surface-500 mt-0.5">
                      Issued: {formatDate(inv.issueDate)} • Due: {formatDate(inv.dueDate)}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-bold text-sm text-surface-900 dark:text-surface-100">
                        {formatCurrency(inv.total)}
                      </div>
                      <span className="text-[11px] text-surface-400">{inv.paymentStatus}</span>
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
              description="No incoming transactions recorded for this client."
            />
          ) : (
            <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden divide-y divide-surface-200 dark:divide-surface-800">
              {payments.map((p) => (
                <div key={p.id} className="p-4 bg-white dark:bg-surface-900 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">
                      Payment {String(p.paymentNumber || p.id || '').toUpperCase()}
                    </div>
                    <div className="text-surface-500 mt-0.5">
                      Method: <span className="font-medium text-surface-700 dark:text-surface-300">{p.method}</span> • {p.note || 'No notes'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-success-600 dark:text-success-500">
                      +{formatCurrency(p.amount)}
                    </div>
                    <div className="text-[10px] text-surface-400">{formatDate(p.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      value: 'activity',
      label: 'Timeline',
      content: (
        <div className="card p-6 space-y-4 text-xs">
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Customer Audit Trail</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-surface-800">
            <div className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-white dark:ring-surface-900" />
              <div className="font-medium text-surface-900 dark:text-surface-100">Subscription Renewed</div>
              <p className="text-surface-500 mt-0.5">Automated billing triggered for Cloud Storage Basic</p>
              <span className="text-[10px] text-surface-400">3 days ago</span>
            </div>
            <div className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-success-500 ring-4 ring-white dark:ring-surface-900" />
              <div className="font-medium text-surface-900 dark:text-surface-100">Payment Settled</div>
              <p className="text-surface-500 mt-0.5">UPI payment of ₹2,950 received successfully</p>
              <span className="text-[10px] text-surface-400">12 days ago</span>
            </div>
            <div className="relative">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-surface-400 ring-4 ring-white dark:ring-surface-900" />
              <div className="font-medium text-surface-900 dark:text-surface-100">Account Onboarded</div>
              <p className="text-surface-500 mt-0.5">Customer record initialized by staff</p>
              <span className="text-[10px] text-surface-400">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back button & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                {customer.name}
              </h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {customer.company} • {customer.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/quotations/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" /> New Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs navigation & content */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
}

