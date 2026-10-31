import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';

const colorMap = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
};

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span className={cn(colorMap[variant] || colorMap.neutral, className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  const color = STATUS_COLORS[status] || 'neutral';
  return (
    <Badge variant={color} className={className}>
      {status}
    </Badge>
  );
}
