import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({ title, value, change, changeLabel, icon: Icon, description, className }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className={cn('card p-5 group hover:shadow-md transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="section-title">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
        {value}
      </div>
      <div className="flex items-center gap-1.5">
        {!isNeutral && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium',
            isPositive ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {isNeutral && (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-surface-500">
            <Minus className="h-3 w-3" />
            0%
          </span>
        )}
        <span className="text-xs text-surface-500">{changeLabel || 'vs last month'}</span>
      </div>
      {description && (
        <p className="text-xs text-surface-400 mt-2">{description}</p>
      )}
    </div>
  );
}
