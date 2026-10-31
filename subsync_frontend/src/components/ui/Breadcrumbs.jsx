import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  plans: 'Plans',
  quotations: 'Quotations',
  subscriptions: 'Subscriptions',
  invoices: 'Invoices',
  payments: 'Payments',
  discounts: 'Discounts',
  taxes: 'Taxes',
  reports: 'Reports',
  settings: 'Settings',
  portal: 'Portal',
  new: 'Create New',
};

export function Breadcrumbs({ items, className = '' }) {
  const location = useLocation();

  let breadcrumbItems = items;

  if (!breadcrumbItems) {
    const paths = location.pathname.split('/').filter(Boolean);
    breadcrumbItems = paths.map((segment, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;
      const label = routeLabels[segment.toLowerCase()] || segment.toUpperCase();
      return { label, url, isLast };
    });
  }

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={`flex items-center text-xs text-surface-500 ${className}`} aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {breadcrumbItems.map((item, idx) => (
        <div key={idx} className="flex items-center">
          <ChevronRight className="h-3 w-3 mx-1.5 text-surface-400" />
          {item.isLast || !item.url ? (
            <span className="font-semibold text-surface-800 dark:text-surface-200">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.url}
              className="hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

