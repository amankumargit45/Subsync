import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PortalLayout } from '@/layouts/PortalLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Admin & Staff Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';
import { PlansPage } from '@/pages/plans/PlansPage';
import { QuotationsPage } from '@/pages/quotations/QuotationsPage';
import { CreateQuotationPage } from '@/pages/quotations/CreateQuotationPage';
import { QuotationDetailPage } from '@/pages/quotations/QuotationDetailPage';
import { SubscriptionsPage } from '@/pages/subscriptions/SubscriptionsPage';
import { SubscriptionDetailPage } from '@/pages/subscriptions/SubscriptionDetailPage';
import { InvoicesPage } from '@/pages/invoices/InvoicesPage';
import { InvoiceDetailPage } from '@/pages/invoices/InvoiceDetailPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';
import { DiscountsPage } from '@/pages/discounts/DiscountsPage';
import { TaxesPage } from '@/pages/taxes/TaxesPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

// Customer Portal Pages
import { PortalDashboardPage } from '@/pages/portal/PortalDashboardPage';
import { PortalSubscriptionPage } from '@/pages/portal/PortalSubscriptionPage';
import { PortalInvoicesPage } from '@/pages/portal/PortalInvoicesPage';
import { PortalPaymentsPage } from '@/pages/portal/PortalPaymentsPage';
import { PortalProfilePage } from '@/pages/portal/PortalProfilePage';

// Error Pages
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // Customer Portal Routes
  {
    path: '/portal',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['CUSTOMER', 'ADMIN', 'STAFF']}>
          <PortalLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PortalDashboardPage /> },
      { path: 'subscription', element: <PortalSubscriptionPage /> },
      { path: 'invoices', element: <PortalInvoicesPage /> },
      { path: 'payments', element: <PortalPaymentsPage /> },
      { path: 'profile', element: <PortalProfilePage /> },
    ],
  },

  // Main B2B Platform (Admin & Staff)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN', 'STAFF']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'quotations', element: <QuotationsPage /> },
      { path: 'quotations/new', element: <CreateQuotationPage /> },
      { path: 'quotations/:id', element: <QuotationDetailPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'subscriptions/:id', element: <SubscriptionDetailPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'invoices/:id', element: <InvoiceDetailPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      {
        path: 'discounts',
        element: (
          <RoleRoute allowedRoles={['ADMIN']}>
            <DiscountsPage />
          </RoleRoute>
        ),
      },
      {
        path: 'taxes',
        element: (
          <RoleRoute allowedRoles={['ADMIN']}>
            <TaxesPage />
          </RoleRoute>
        ),
      },
      { path: 'reports', element: <ReportsPage /> },
      {
        path: 'settings',
        element: (
          <RoleRoute allowedRoles={['ADMIN']}>
            <SettingsPage />
          </RoleRoute>
        ),
      },
    ],
  },

  // Error Pages
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

