import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { customerApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

export function PortalInvoicesPage() {
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

  const invoices = customer?.invoices || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Billing Invoices
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          View official tax invoices, billing line items, and print receipts.
        </p>
      </div>

      <div className="card overflow-hidden border border-surface-200 dark:border-surface-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50 dark:bg-surface-800/60 text-surface-500 border-b border-surface-200 dark:border-surface-800 font-semibold">
            <tr>
              <th className="p-3.5">Invoice #</th>
              <th className="p-3.5">Issue Date</th>
              <th className="p-3.5">Due Date</th>
              <th className="p-3.5">Total Amount</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/40 transition-colors">
                <td className="p-3.5 font-mono font-semibold text-primary-600 dark:text-primary-400">
                  {inv.id.toUpperCase()}
                </td>
                <td className="p-3.5 text-surface-600 dark:text-surface-300">{formatDate(inv.issueDate)}</td>
                <td className="p-3.5 text-surface-600 dark:text-surface-300">{formatDate(inv.dueDate)}</td>
                <td className="p-3.5 font-bold text-surface-900 dark:text-surface-100">{formatCurrency(inv.total)}</td>
                <td className="p-3.5">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="p-3.5 text-right">
                  <Link to={`/invoices/${inv.id}`}>
                    <Button variant="secondary" size="sm" className="h-7 text-xs">
                      <Eye className="h-3 w-3" /> View / Print
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
