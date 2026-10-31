import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, RefreshCw, Package,
  CreditCard, Receipt, Banknote, Percent, Calculator,
  BarChart3, Settings, Search, Menu, X, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, User, Sparkles, Shield, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUIStore } from '@/store/uiStore';
import { NAV_SECTIONS, DEMO_ACCOUNTS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { toast } from 'sonner';

const iconMap = {
  LayoutDashboard,
  Users,
  FileText,
  RefreshCw,
  Package,
  CreditCard,
  Receipt,
  Banknote,
  Percent,
  Calculator,
  BarChart3,
  Settings,
};

export function AppLayout() {
  const { user, logout, login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, toggleMobileSidebar, closeMobileSidebar } = useUIStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const handleSwitchDemo = (demoAccount) => {
    login(
      {
        id: `usr-${demoAccount.role.toLowerCase()}`,
        name: demoAccount.name,
        email: demoAccount.email,
        role: demoAccount.role,
        company: 'Brightloop Software',
      },
      `mock-token-${Date.now()}`
    );
    toast.success(`Switched to ${demoAccount.role} demo account`);
    setUserMenuOpen(false);
    if (demoAccount.role === 'CUSTOMER') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col">
      {/* Global Search Dialog */}
      <GlobalSearchModal open={searchOpen} onClose={setSearchOpen} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-0 bottom-0 left-0 z-40
            flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
            transition-all duration-300 ease-in-out
            ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          `}
        >
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                S
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold tracking-tight text-sm text-surface-900 dark:text-surface-100">SubFlow</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400">
                      MVP
                    </span>
                  </div>
                  <span className="text-[10px] text-surface-400 truncate">Brightloop × Odoo</span>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Close toggle (Mobile) */}
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {NAV_SECTIONS.map((section) => {
              // Filter items by role
              const visibleItems = section.items.filter((item) =>
                !item.roles || item.roles.includes(user?.role || 'ADMIN')
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1">
                  {!sidebarCollapsed ? (
                    <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-1.5">
                      {section.title}
                    </div>
                  ) : (
                    <div className="h-px bg-surface-200 dark:bg-surface-800 my-2" />
                  )}

                  {visibleItems.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                    const navItem = (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative group
                          ${isActive
                            ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-semibold'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                          }
                          ${sidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'}`} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        {isActive && !sidebarCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                        )}
                      </NavLink>
                    );

                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.path} content={item.label} side="right">
                          {navItem}
                        </Tooltip>
                      );
                    }

                    return navItem;
                  })}
                </div>
              );
            })}
          </div>

          {/* Quick Demo Switcher / Portal Link in Footer */}
          <div className="p-3 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
            {!sidebarCollapsed ? (
              <div className="rounded-lg bg-surface-100 dark:bg-surface-800 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar name={user?.name || 'User'} size="sm" />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate text-surface-900 dark:text-surface-100">{user?.name}</div>
                    <div className="text-[10px] text-surface-400 flex items-center gap-1">
                      <span className="capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded text-surface-400 hover:text-danger-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-14 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Dynamic Breadcrumbs */}
              <Breadcrumbs />
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-2">
              {/* Search shortcut button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-200/80 dark:hover:bg-surface-700 transition-colors text-xs font-medium cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-[10px] font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Popover */}
              <NotificationPopover />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="h-4 w-px bg-surface-200 dark:bg-surface-800 mx-1" />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <Avatar name={user?.name || 'User'} size="sm" />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-surface-900 dark:text-surface-100 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-surface-400 leading-tight">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-900 rounded-xl shadow-xl border border-surface-200 dark:border-surface-800 py-1.5 z-50 text-xs"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-800">
                      <div className="font-semibold text-surface-900 dark:text-surface-100">{user?.name}</div>
                      <div className="text-[11px] text-surface-400">{user?.email}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        Role: {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                        Switch Demo Role
                      </div>
                      {DEMO_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.email}
                          onClick={() => handleSwitchDemo(acc)}
                          className="w-full text-left px-3 py-1.5 hover:bg-surface-50 dark:hover:bg-surface-800 flex items-center justify-between text-surface-700 dark:text-surface-300"
                        >
                          <span>{acc.role} ({acc.name.split(' ')[0]})</span>
                          {user?.role === acc.role && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-surface-100 dark:border-surface-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Main Content with smooth scrolling */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

