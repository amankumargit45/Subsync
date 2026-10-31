import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, CreditCard, Layers, Tag, ExternalLink } from 'lucide-react';
import { productApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !product) {
    return <ErrorState title="Product Not Found" message="Could not locate product details." onRetry={refetch} />;
  }

  const plans = product.plans || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                {product.name}
              </h1>
              <StatusBadge status={product.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Type: {product.type} • SKU: {product.id}
            </p>
          </div>
        </div>

        <Link to="/plans">
          <Button variant="secondary" size="sm">
            <CreditCard className="h-4 w-4" /> View Associated Plans
          </Button>
        </Link>
      </div>

      {/* Pricing & Margin Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Base Sales Price</span>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {formatCurrency(product.salesPrice)}
          </div>
        </Card>
        <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Cost Price</span>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {formatCurrency(product.costPrice)}
          </div>
        </Card>
        <Card className="p-4 bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-800">
          <span className="text-xs text-surface-500 font-medium">Estimated Gross Margin</span>
          <div className="text-2xl font-bold text-success-600 dark:text-success-500 mt-1">
            {formatCurrency(product.salesPrice - product.costPrice)} ({(((product.salesPrice - product.costPrice) / (product.salesPrice || 1)) * 100).toFixed(0)}%)
          </div>
        </Card>
      </div>

      {/* Product description & Variants table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description & metadata */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
            Overview & Specifications
          </h3>
          <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
            {product.description || 'No detailed description provided for this product catalogue entry.'}
          </p>
          <div className="pt-4 border-t border-surface-100 dark:border-surface-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-surface-400 block">Product Category</span>
              <span className="font-semibold text-surface-800 dark:text-surface-200">{product.type}</span>
            </div>
            <div>
              <span className="text-surface-400 block">Created On</span>
              <span className="font-semibold text-surface-800 dark:text-surface-200">{formatDate(product.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Variants List */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2 flex items-center justify-between">
            <span>Configured Variants</span>
            <span className="text-xs text-surface-500 font-normal">
              {product.variants?.length || 0} tier(s)
            </span>
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {product.variants && product.variants.length > 0 ? (
              product.variants.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800 text-xs">
                  <div>
                    <span className="font-medium text-surface-900 dark:text-surface-100">{v.name}</span>
                    <div className="text-[10px] text-surface-400">
                      Adjustment: {v.priceAdjustment >= 0 ? `+₹${v.priceAdjustment}` : `-₹${Math.abs(v.priceAdjustment)}`}
                    </div>
                  </div>
                  <div className="text-right font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(product.salesPrice + (v.priceAdjustment || 0))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-surface-400 py-4 text-center">No variants configured for this product.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Subscription Plans using this product */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-2">
          Recurring Plans Linked to {product.name}
        </h3>
        {plans.length === 0 ? (
          <p className="text-xs text-surface-500 py-3">No plans currently packaging this product.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((pl) => (
              <div key={pl.id} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-surface-900 dark:text-surface-100">{pl.name}</span>
                  <StatusBadge status={pl.status} />
                </div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(pl.price)} <span className="text-xs font-normal text-surface-500">/{pl.billingFrequency}</span>
                </div>
                <div className="text-[11px] text-surface-500 flex justify-between">
                  <span>Subscribers: {pl.subscriberCount || 0}</span>
                  <span>Min Qty: {pl.minQuantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

