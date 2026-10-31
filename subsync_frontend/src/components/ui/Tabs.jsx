import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Tabs({ tabs, defaultTab, className, onChange }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.value);

  const handleChange = (value) => {
    setActive(value);
    onChange?.(value);
  };

  const activeTab = tabs.find(t => t.value === active);

  return (
    <div className={className}>
      <div className="flex items-center gap-1 border-b border-surface-200 dark:border-surface-800 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleChange(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative',
              active === tab.value
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                active === tab.value
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
              )}>
                {tab.count}
              </span>
            )}
            {active === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
