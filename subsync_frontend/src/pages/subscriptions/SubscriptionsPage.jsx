import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  RefreshCw, Plus, Pause, Play, XCircle, FileText,
  Eye, Calendar, DollarSign, Filter
} from 'lucide-react';
import { subscriptionApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: subsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscriptions', statusFilter],
    queryFn: () => subscriptionApi.getAll({ status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 }),
  });

  const pauseMutation = useMutation({
    mutationFn: (id) => subscriptionApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription paused');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => subscriptionApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription resumed');
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (id) => subscriptionApi.generateInvoice(id),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Generated invoice ${inv.id.toUpperCase()}`);
      navigate(`/invoices/${inv.id}`);
    },
  });

  const columns = [
    {
      header: 'Subscription #',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
          {(row.subscriptionNumber || row.id || '').toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (row) => (
        <div>
          <div className="font-semibold text-surface-900 dark:text-surface-100">{row.customerName}</div>
          <div className="text-[11px] text-surface-400">{row.company}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessorKey: 'planName',
      cell: (row) => (
        <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
          {row.planName}
        </span>
      ),
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: (row) => (
        <span className="text-xs text-surface-500">
          {row.startDate ? formatDate(row.startDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Next Billing',
      accessorKey: 'nextBillingDate',
      cell: (row) => (
        <span className="text-xs font-medium text-surface-800 dark:text-surface-200">
          {row.nextBillingDate ? formatDate(row.nextBillingDate) : '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row) => (
        <span className="font-semibold text-surface-900 dark:text-surface-100">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => pauseMutation.mutate(row.id)}
              className="p-1 rounded text-surface-400 hover:text-warning-600 hover:bg-surface-100 dark:hover:bg-surface-800"
              title="Pause Subscription"
            >
              <Pause className="h-3.5 w-3.5" />
            </button>
          )}
          {row.status === 'PAUSED' && (
            <button
              onClick={() => resumeMutation.mutate(row.id)}
              className="p-1 rounded text-surface-400 hover:text-success-600 hover:bg-surface-100 dark:hover:bg-surface-800"
              title="Resume Subscription"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => generateInvoiceMutation.mutate(row.id)}
              className="p-1 rounded text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-800"
              title="Generate Invoice Now"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => navigate(`/subscriptions/${row.id}`)}
            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
            title="View Details"
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
            Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Active customer contracts, scheduled renewal cycles, and recurring billing streams.
          </p>
        </div>
        <Link to="/quotations/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> New Subscription
          </Button>
        </Link>
      </div>

      {/* Filter Tabs by status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'ACTIVE', 'PAUSED', 'DRAFT', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === st
                ? 'bg-primary-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50'
            }`}
          >
            {st === 'all' ? 'All Subscriptions' : st}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={subsData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search subscriptions by #, customer, or plan..."
        onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
      />
    </div>
  );
}

