import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex gap-4">
        <div className={`p-3 rounded-full shrink-0 h-fit ${variant === 'danger' ? 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'}`}>
          {variant === 'danger' ? <AlertTriangle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          loading={loading}
          onClick={async () => {
            await onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

