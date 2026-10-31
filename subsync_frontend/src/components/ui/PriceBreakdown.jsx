import { formatCurrency } from '@/lib/utils';
import { Card } from './Card';

export function PriceBreakdown({
  subtotal = 0,
  discount = 0,
  discountLabel = 'Discount',
  tax = 0,
  taxLabel = 'Tax (GST 18%)',
  total = 0,
  currency = 'INR',
  className = '',
}) {
  const calculatedTotal = total || Math.max(0, subtotal - discount + tax);

  return (
    <Card className={`p-4 bg-surface-50 dark:bg-surface-900/50 border-surface-200 dark:border-surface-800 ${className}`}>
      <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Payment Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-surface-600 dark:text-surface-400">
          <span>Subtotal</span>
          <span className="font-medium text-surface-900 dark:text-surface-100">{formatCurrency(subtotal, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success-600 dark:text-success-500">
            <span>{discountLabel}</span>
            <span>- {formatCurrency(discount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-surface-600 dark:text-surface-400">
          <span>{taxLabel}</span>
          <span className="font-medium text-surface-900 dark:text-surface-100">+ {formatCurrency(tax, currency)}</span>
        </div>
        <div className="border-t border-surface-200 dark:border-surface-800 pt-2.5 mt-2 flex justify-between items-baseline">
          <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">Total Amount</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(calculatedTotal, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}

