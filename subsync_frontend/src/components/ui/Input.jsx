import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(({ className, label, error, hint, icon: Icon, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
        {props.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="h-4 w-4 text-surface-400" />
        </div>
      )}
      <input
        ref={ref}
        className={cn('input-base', Icon && 'pl-9', error && 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500', className)}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-danger-500">{error}</p>}
    {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
  </div>
));

Input.displayName = 'Input';

export const Textarea = forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
        {props.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={cn('input-base min-h-[80px] resize-y', error && 'border-danger-500', className)}
      {...props}
    />
    {error && <p className="text-xs text-danger-500">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ className, label, error, options = [], placeholder, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
        {props.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={cn('input-base appearance-none cursor-pointer', error && 'border-danger-500', className)}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-danger-500">{error}</p>}
  </div>
));

Select.displayName = 'Select';
