export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

export const SUBSCRIPTION_STATUSES = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED',
};

export const INVOICE_STATUSES = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
};

export const QUOTATION_STATUSES = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

export const PAYMENT_METHODS = {
  UPI: 'UPI',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  OTHER: 'Other',
};

export const BILLING_FREQUENCIES = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export const DISCOUNT_TYPES = {
  FIXED: 'Fixed',
  PERCENTAGE: 'Percentage',
};

export const PRODUCT_TYPES = {
  SERVICE: 'Service',
  CONSUMABLE: 'Consumable',
  SUBSCRIPTION: 'Subscription',
};

export const STATUS_COLORS = {
  DRAFT: 'neutral',
  QUOTATION: 'primary',
  CONFIRMED: 'primary',
  ACTIVE: 'success',
  PAUSED: 'warning',
  CLOSED: 'neutral',
  EXPIRED: 'danger',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
  PENDING: 'warning',
  REJECTED: 'danger',
  SCHEDULED: 'primary',
  EXHAUSTED: 'neutral',
};

export const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '3 months', value: '3m' },
  { label: '12 months', value: '12m' },
  { label: 'Custom', value: 'custom' },
];

export const DEMO_ACCOUNTS = [
  { email: 'admin@subflow.app', password: 'Admin@12345', role: 'ADMIN', name: 'Brightloop Admin' },
  { email: 'staff@subflow.app', password: 'Staff@12345', role: 'STAFF', name: 'Sarah Ops' },
  { email: 'acme@example.com', password: 'Customer@12345', role: 'CUSTOMER', name: 'John Doe (Acme)' },
];

export const NAV_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'SALES',
    items: [
      { label: 'Customers', path: '/customers', icon: 'Users', roles: ['ADMIN', 'STAFF'] },
      { label: 'Quotations', path: '/quotations', icon: 'FileText', roles: ['ADMIN', 'STAFF'] },
      { label: 'Subscriptions', path: '/subscriptions', icon: 'RefreshCw', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'CATALOG',
    items: [
      { label: 'Products', path: '/products', icon: 'Package', roles: ['ADMIN', 'STAFF'] },
      { label: 'Plans', path: '/plans', icon: 'CreditCard', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'BILLING',
    items: [
      { label: 'Invoices', path: '/invoices', icon: 'Receipt', roles: ['ADMIN', 'STAFF'] },
      { label: 'Payments', path: '/payments', icon: 'Banknote', roles: ['ADMIN', 'STAFF'] },
      { label: 'Discounts', path: '/discounts', icon: 'Percent', roles: ['ADMIN'] },
      { label: 'Taxes', path: '/taxes', icon: 'Calculator', roles: ['ADMIN'] },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Reports', path: '/reports', icon: 'BarChart3', roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', path: '/settings', icon: 'Settings', roles: ['ADMIN'] },
    ],
  },
];

export const PORTAL_NAV = [
  { label: 'Dashboard', path: '/portal', icon: 'LayoutDashboard' },
  { label: 'Subscription', path: '/portal/subscription', icon: 'RefreshCw' },
  { label: 'Invoices', path: '/portal/invoices', icon: 'Receipt' },
  { label: 'Payments', path: '/portal/payments', icon: 'Banknote' },
  { label: 'Profile', path: '/portal/profile', icon: 'User' },
];
