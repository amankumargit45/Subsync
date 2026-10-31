import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, CheckCircle2, User, FileText, Calendar, Building2 } from 'lucide-react';
import { quotationApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PriceBreakdown } from '@/components/ui/PriceBreakdown';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quotation, isLoading, isError, refetch } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationApi.getById(id),
  });

  const convertMutation = useMutation({
    mutationFn: () => quotationApi.convertToSubscription(id),
    onSuccess: (newSub) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Quotation successfully converted to Subscription ${newSub.id.toUpperCase()}`);
      navigate(`/subscriptions/${newSub.id}`);
    },
    onError: (err) => toast.error(err.message || 'Failed to convert quotation'),
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !quotation) {
    return <ErrorState title="Quotation Not Found" message="Could not locate quotation proposal." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-surface-900 dark:text-surface-100 tracking-tight">
                {String(quotation.quotationNumber || quotation.id || '').toUpperCase()}
              </h1>
              <StatusBadge status={quotation.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Drafted for {quotation.customerName} ({quotation.company})
            </p>
          </div>
        </div>

        {quotation.status !== 'CONFIRMED' && (
          <Button
            variant="primary"
            size="sm"
            loading={convertMutation.isPending}
            onClick={() => convertMutation.mutate()}
          >
            <RefreshCw className="h-4 w-4" /> Convert to Active Subscription
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
              Proposal Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-surface-400 block">Client</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{quotation.customerName}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Company</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{quotation.company}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Created Date</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{formatDate(quotation.createdAt)}</span>
              </div>
              <div>
                <span className="text-surface-400 block">Valid Until</span>
                <span className="font-semibold text-surface-800 dark:text-surface-200">{formatDate(quotation.validUntil)}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Line Items</h4>
              <div className="border border-surface-200 dark:border-surface-800 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-surface-50 dark:bg-surface-800/60 text-surface-500 border-b border-surface-200 dark:border-surface-800">
                    <tr>
                      <th className="p-3">Product / Plan</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {quotation.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-surface-900 dark:text-surface-100">{it.product}</td>
                        <td className="p-3">{it.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(it.unitPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Price Breakdown */}
        <div>
          <PriceBreakdown
            subtotal={quotation.amount}
            discount={quotation.discount}
            tax={quotation.tax}
            total={quotation.total}
          />
        </div>
      </div>
    </div>
  );
}

