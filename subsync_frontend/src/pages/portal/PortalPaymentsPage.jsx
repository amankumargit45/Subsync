import { useQuery } from '@tanstack/react-query';
import { Banknote, CheckCircle2 } from 'lucide-react';
import { customerApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PortalPaymentsPage() {
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

  const payments = customer?.payments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Payment Transactions
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Settled payments and automated recurring charge records.
        </p>
      </div>

      <div className="card overflow-hidden border border-surface-200 dark:border-surface-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50 dark:bg-surface-800/60 text-surface-500 border-b border-surface-200 dark:border-surface-800 font-semibold">
            <tr>
              <th className="p-3.5">Payment ID</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5">Reference</th>
              <th className="p-3.5">Amount</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/40">
                <td className="p-3.5 font-mono font-semibold text-primary-600 dark:text-primary-400">
                  {p.id.toUpperCase()}
                </td>
                <td className="p-3.5 text-surface-600 dark:text-surface-300">{formatDate(p.date)}</td>
                <td className="p-3.5 font-medium">{p.method}</td>
                <td className="p-3.5 font-mono text-[11px] text-surface-500">{p.reference || '—'}</td>
                <td className="p-3.5 font-bold text-success-600">+{formatCurrency(p.amount)}</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 text-xs text-success-600 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Settled
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

