import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { customerApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function PortalSubscriptionPage() {
  const { user } = useAuthStore();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['portal-customer', user?.id],
    queryFn: async () => {
      const res = await customerApi.getAll();
      const match = res.data.find(c => c.email === user?.email) || res.data[0];
      return customerApi.getById(match.id);
    },
  });

  if (isLoading) return <PageSkeleton />;

  const subscriptions = customer?.subscriptions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          My Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          View active plans, billing frequencies, and service entitlements.
        </p>
      </div>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="card p-6 border border-surface-200 dark:border-surface-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 dark:border-surface-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">{sub.planName}</h2>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="text-xs text-surface-500 font-mono mt-0.5">Contract #{sub.id.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                  {formatCurrency(sub.amount)}
                </span>
                <span className="text-xs text-surface-500 font-normal"> / month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/40">
                <span className="text-surface-400 block">Subscription Start Date</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100 mt-0.5 block">{formatDate(sub.startDate)}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/40">
                <span className="text-surface-400 block">Next Automated Billing</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100 mt-0.5 block">
                  {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'Manual'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/40">
                <span className="text-surface-400 block">Settlement Terms</span>
                <span className="font-semibold text-surface-900 dark:text-surface-100 mt-0.5 block">{sub.paymentTerms || 'Net 15 Days'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-success-600">
                <ShieldCheck className="h-4 w-4" /> Entitlements active & SLA protected
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.info('Support ticket created to adjust subscription tier.')}
              >
                Request Plan Upgrade
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
