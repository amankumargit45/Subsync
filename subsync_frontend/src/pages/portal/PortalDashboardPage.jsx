import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { customerApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PortalDashboardPage() {
  const { user } = useAuthStore();

  // For customer demo, fetch customer details (e.g. cust-001 or first customer matching user)
  const { data: customer, isLoading } = useQuery({
    queryKey: ['portal-customer', user?.id],
    queryFn: async () => {
      // Find matching customer or default to cust-001
      const res = await customerApi.getAll();
      const match = res.data.find(c => c.email === user?.email) || res.data[0];
      return customerApi.getById(match.id);
    },
  });

  if (isLoading) return <PageSkeleton />;

  const subscriptions = customer?.subscriptions || [];
  const primarySub = subscriptions[0];
  const invoices = customer?.invoices || [];
  const pendingInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
  const recentPayments = customer?.payments || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-none shadow-md">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-200">
            Client Portal Account
          </span>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Welcome back, {user?.name || 'Valued Partner'}
          </h1>
          <p className="text-xs text-primary-100 mt-1">
            Manage your subscription tier, download official GST tax invoices, and track payments.
          </p>
        </div>
      </div>

      {/* 4 Customer Portal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Current Plan</span>
          <div className="text-lg font-bold text-surface-900 dark:text-surface-100 mt-1 truncate">
            {primarySub?.planName || 'Cloud Storage Basic'}
          </div>
          <span className="text-[11px] text-surface-400">Monthly renewal</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Next Billing</span>
          <div className="text-lg font-bold text-surface-900 dark:text-surface-100 mt-1">
            {primarySub?.nextBillingDate ? formatDate(primarySub.nextBillingDate) : 'Auto-charge ready'}
          </div>
          <span className="text-[11px] text-primary-600 dark:text-primary-400">Scheduled</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Amount Due</span>
          <div className={`text-lg font-bold mt-1 ${customer?.outstanding > 0 ? 'text-danger-600 dark:text-danger-400' : 'text-surface-900 dark:text-surface-100'}`}>
            {formatCurrency(customer?.outstanding || 0)}
          </div>
          <span className="text-[11px] text-surface-400">Current balance</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Subscription Status</span>
          <div className="mt-2">
            <StatusBadge status={primarySub?.status || 'ACTIVE'} />
          </div>
          <span className="text-[11px] text-surface-400 block mt-1">Auto-renew active</span>
        </Card>
      </div>

      {/* Main Grid: Active Subscriptions & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Subscriptions Overview */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                Your Subscriptions
              </h3>
              <p className="text-xs text-surface-500">Currently provisioned cloud services</p>
            </div>
            <Link to="/portal/subscription" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-surface-900 dark:text-surface-100">{sub.planName}</div>
                  <div className="text-surface-500 mt-0.5">Contract: <span className="font-mono">{sub.id.toUpperCase()}</span></div>
                  <div className="text-[11px] text-surface-400 mt-1">Next Bill: {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'Auto'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base text-surface-900 dark:text-surface-100">{formatCurrency(sub.amount)}</div>
                  <StatusBadge status={sub.status} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices & Payment Ledger */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                Recent Invoices
              </h3>
              <p className="text-xs text-surface-500">Official tax invoices & payment status</p>
            </div>
            <Link to="/portal/invoices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              All Invoices <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {invoices.slice(0, 4).map((inv) => (
              <div key={inv.id} className="p-3 rounded-lg border border-surface-100 dark:border-surface-800 flex items-center justify-between text-xs hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                <div>
                  <div className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                    <span>{inv.id.toUpperCase()}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="text-[11px] text-surface-400 mt-0.5">
                    Due: {formatDate(inv.dueDate)}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold text-sm text-surface-900 dark:text-surface-100">
                    {formatCurrency(inv.total)}
                  </span>
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="p-1 rounded text-surface-400 hover:text-primary-600"
                    title="View & Download Invoice"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
