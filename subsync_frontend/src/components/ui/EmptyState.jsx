import { cn } from '@/lib/utils';
import { FileX, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon = FileX, title, description, action, actionLabel, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="p-4 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
        <Icon className="h-8 w-8 text-surface-400" />
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm text-center mb-4">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action}>
          {actionLabel || 'Get Started'}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="p-4 rounded-full bg-danger-50 dark:bg-danger-500/10 mb-4">
        <AlertCircle className="h-8 w-8 text-danger-500" />
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-surface-500 max-w-sm text-center mb-4">{message}</p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
