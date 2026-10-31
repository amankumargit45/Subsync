import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, RefreshCw, Receipt, Banknote, User, LogOut, Sun, Moon, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { PORTAL_NAV } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from 'sonner';

const portalIconMap = {
  LayoutDashboard,
  RefreshCw,
  Receipt,
  Banknote,
  User,
};

export function PortalLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out from Customer Portal');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col">
      {/* Top customer portal navbar */}
      <header className="h-16 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-2">
                SubFlow <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400">Customer Portal</span>
              </div>
              <div className="text-[10px] text-surface-400">{user?.company || 'My Account'}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {PORTAL_NAV.map((item) => {
              const Icon = portalIconMap[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/portal'}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-surface-200 dark:border-surface-800">
            <Avatar name={user?.name || 'Customer'} size="sm" />
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-surface-900 dark:text-surface-100">{user?.name}</div>
              <div className="text-[10px] text-surface-400">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav bar */}
      <div className="md:hidden border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {PORTAL_NAV.map((item) => {
          const Icon = portalIconMap[item.icon] || LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/portal'}
              className={({ isActive }) => `
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-surface-600 dark:text-surface-400'
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Main Portal View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

