import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center card p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-danger-600 dark:text-danger-400">
            Error 403 • Access Restricted
          </span>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Insufficient Permissions
          </h1>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Your current account role <span className="font-semibold text-surface-700 dark:text-surface-300">({user?.role || 'Guest'})</span> does not have privileges to view this area.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Link to={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'}>
            <Button variant="primary" size="sm">
              <Home className="h-4 w-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

