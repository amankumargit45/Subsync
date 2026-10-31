import { Outlet, Link } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon } from 'lucide-react';

export function AuthLayout() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-between p-4 sm:p-6 selection:bg-primary-500 selection:text-white">
      {/* Top Navbar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-surface-900 dark:text-surface-100">SubFlow</span>
            <span className="text-[10px] text-surface-400">Brightloop Subscription Platform</span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-surface-400 py-4 max-w-5xl mx-auto w-full border-t border-surface-200/50 dark:border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>SubFlow &copy; 2026 Brightloop Software. Odoo × Flux Hackathon MVP.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-surface-600 dark:hover:text-surface-300">Privacy</a>
          <a href="#" className="hover:text-surface-600 dark:hover:text-surface-300">Terms of Service</a>
          <a href="#" className="hover:text-surface-600 dark:hover:text-surface-300">Documentation</a>
        </div>
      </div>
    </div>
  );
}

