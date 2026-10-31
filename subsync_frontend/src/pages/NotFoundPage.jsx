import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center card p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-500 mx-auto flex items-center justify-center">
          <FileQuestion className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
            Error 404
          </span>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Page Not Found
          </h1>
          <p className="text-xs text-surface-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

