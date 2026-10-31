import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'QUOTATION', label: 'Quotation' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'CLOSED', label: 'Closed' },
];

export function SubscriptionTimeline({ currentStatus = 'ACTIVE', className }) {
  const isPaused = currentStatus === 'PAUSED';
  const isExpired = currentStatus === 'EXPIRED';

  const statusIndexMap = {
    DRAFT: 0,
    QUOTATION: 1,
    CONFIRMED: 2,
    ACTIVE: 3,
    PAUSED: 3,
    CLOSED: 4,
    EXPIRED: 4,
  };

  const currentIndex = statusIndexMap[currentStatus] ?? 3;

  return (
    <div className={cn('py-4 px-2', className)}>
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-surface-200 dark:bg-surface-800 -z-0" />
        
        {/* Active connector progress */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-primary-600 transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 100))}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 border-2',
                  isDone && 'bg-primary-600 text-white border-primary-600 shadow-sm',
                  isCurrent && !isPaused && !isExpired && 'bg-white dark:bg-surface-900 border-primary-600 text-primary-600 ring-4 ring-primary-500/20',
                  isCurrent && isPaused && 'bg-white dark:bg-surface-900 border-warning-500 text-warning-600 ring-4 ring-warning-500/20',
                  isCurrent && isExpired && 'bg-white dark:bg-surface-900 border-danger-500 text-danger-600 ring-4 ring-danger-500/20',
                  isPending && 'bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-700 text-surface-400'
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isCurrent ? (
                  isPaused ? (
                    <Clock className="h-4 w-4 text-warning-500" />
                  ) : isExpired ? (
                    <XCircle className="h-4 w-4 text-danger-500" />
                  ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
                  )
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium mt-2 whitespace-nowrap',
                  isCurrent ? 'text-surface-900 dark:text-surface-100 font-semibold' : 'text-surface-500'
                )}
              >
                {stage.label}
                {isCurrent && isPaused && ' (Paused)'}
                {isCurrent && isExpired && ' (Expired)'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

