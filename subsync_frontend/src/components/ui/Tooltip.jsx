import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({ children, content, side = 'top', className }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-surface-900 dark:bg-surface-100 text-surface-50 dark:text-surface-900 px-2 py-1 text-xs font-medium shadow-md pointer-events-none transition-opacity duration-150',
            positions[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

