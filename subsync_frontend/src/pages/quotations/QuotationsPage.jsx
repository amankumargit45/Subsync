import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, Plus, RefreshCw, CheckCircle2, ArrowRight,
  Eye, Check, Clock, AlertCircle, Calendar
} from 'lucide-react';
import { quotationApi } from '@/api';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function QuotationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quotationsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['quotations'],
    queryFn: () => quotationApi.getAll({ limit: 100 }),
  });

  const convertMutation = useMutation({
    mutationFn: (id) => quotationApi.convertToSubscription(id),
    onSuccess: (newSub) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Converted to active subscription ${newSub.id.toUpperCase()}`);
      navigate(`/subscriptions/${newSub.id}`);
    },
    onError: (err) => toast.error(err.message || 'Failed to convert quotation'),
  });

  const columns = [
    {
      header: 'Quotation #',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
          {(row.quotationNumber || row.id || '').toUpperCase()}
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
      header: 'Plan',
      accessorKey: 'planName',
      cell: (row) => (
        <span className="text-xs text-surface-700 dark:text-surface-300">
          {row.planName}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      cell: (row) => (
        <div>
          <div className="font-semibold text-surface-900 dark:text-surface-100">
            {formatCurrency(row.total || row.amount)}
          </div>
          {row.discount > 0 && (
            <div className="text-[10px] text-success-600">Saved {formatCurrency(row.discount)}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Valid Until',
      accessorKey: 'validUntil',
      cell: (row) => (
        <span className="text-xs text-surface-500">
          {row.validUntil ? formatDate(row.validUntil) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-surface-400">
          {row.createdAt ? formatDate(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status !== 'CONFIRMED' && row.status !== 'REJECTED' && (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-7 px-2 text-primary-600 dark:text-primary-400"
              loading={convertMutation.isPending && convertMutation.variables === row.id}
              onClick={(e) => {
                e.stopPropagation();
                convertMutation.mutate(row.id);
              }}
              title="Convert to Active Subscription"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Convert</span>
            </Button>
          )}
          <button
            onClick={() => navigate(`/quotations/${row.id}`)}
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
            Quotations & Proposals
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Create multi-item estimates, apply discounts & taxes, and convert seamlessly to subscriptions.
          </p>
        </div>
        <Link to="/quotations/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" /> Create Quotation
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={quotationsData?.data || []}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        searchPlaceholder="Search quotations by #, customer, plan..."
        onRowClick={(row) => navigate(`/quotations/${row.id}`)}
        emptyTitle="No quotations drafted"
        emptyDescription="Create your first client estimate with live pricing preview."
        emptyAction={() => navigate('/quotations/new')}
        emptyActionLabel="Create Quotation"
      />
    </div>
  );
}

