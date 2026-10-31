import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { reportApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const PAYMENT_METHOD_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'];

export function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('12m');

  const { data: reports, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports', selectedRange],
    queryFn: () => reportApi.getReports({ range: selectedRange }),
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !reports) {
    return <ErrorState title="Failed to load analytics workspace" message="Could not compile reporting models." onRetry={refetch} />;
  }

  const { revenue, subscriptions, invoices, charts } = reports;

  const paymentMethodsData = [
    { name: 'UPI', value: 45 },
    { name: 'Card', value: 25 },
    { name: 'Bank Transfer', value: 20 },
    { name: 'Cash', value: 7 },
    { name: 'Other', value: 3 },
  ];

  const handleExportReport = () => {
    toast.success('Generated PDF Financial Summary report');
    window.print();
  };

  const tabs = [
    {
      value: 'revenue',
      label: 'Revenue Analytics',
      content: (
        <div className="space-y-6 pt-2">
          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Total Billed Revenue</span>
              <div className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">
                {formatCurrency(revenue.total)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Recurring Base</span>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                {formatCurrency(revenue.recurring)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Collected Cash</span>
              <div className="text-xl font-bold text-success-600 mt-1">
                {formatCurrency(revenue.collected)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Outstanding Balances</span>
              <div className="text-xl font-bold text-warning-600 mt-1">
                {formatCurrency(revenue.outstanding)}
              </div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Overdue Recovery</span>
              <div className="text-xl font-bold text-danger-600 mt-1">
                {formatCurrency(revenue.overdue)}
              </div>
            </Card>
          </div>

          {/* Revenue Trend Area Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100 mb-4">
              Historical MRR & Billed Invoices Trend
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevRep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                  <RechartsTooltip formatter={(v) => [formatCurrency(Number(v)), '']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevRep)" />
                  <Area type="monotone" dataKey="recurring" stroke="#22c55e" strokeWidth={2} strokeDasharray="3 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'subscriptions',
      label: 'Subscriptions',
      content: (
        <div className="space-y-6 pt-2">
          {/* Subscriptions Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Active Subs</span>
              <div className="text-xl font-bold text-success-600 mt-1">{subscriptions.active}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">New Additions</span>
              <div className="text-xl font-bold text-primary-600 mt-1">{subscriptions.new}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Auto-Renewed</span>
              <div className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{subscriptions.renewed}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Paused</span>
              <div className="text-xl font-bold text-warning-600 mt-1">{subscriptions.paused}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Closed / Cancelled</span>
              <div className="text-xl font-bold text-surface-500 mt-1">{subscriptions.closed}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Expired</span>
              <div className="text-xl font-bold text-danger-600 mt-1">{subscriptions.expired}</div>
            </Card>
          </div>

          {/* Subscription Growth Chart */}
          <div className="card p-6">
            <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100 mb-4">
              Subscriber Growth vs Churn Distribution
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.subscriptionGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="churned" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'invoices',
      label: 'Invoices & Settlements',
      content: (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Total Invoices</span>
              <div className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{invoices.total}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Settled (Paid)</span>
              <div className="text-xl font-bold text-success-600 mt-1">{invoices.paid}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Pending Term</span>
              <div className="text-xl font-bold text-warning-600 mt-1">{invoices.pending}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Overdue</span>
              <div className="text-xl font-bold text-danger-600 mt-1">{invoices.overdue}</div>
            </Card>
            <Card className="p-4 bg-surface-50 dark:bg-surface-800/40">
              <span className="text-xs text-surface-500 font-medium">Cancelled</span>
              <div className="text-xl font-bold text-surface-400 mt-1">{invoices.cancelled}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100 mb-4">
                Payment Channel Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethodsData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {paymentMethodsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100 mb-4">
                Revenue by Plan Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.revenueByPlan} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="plan" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <RechartsTooltip formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            Financial & Subscription Reports
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Real-time analytics workspace for recurring revenue, cohort retention, and cash collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg text-xs">
            {['30d', '3m', '12m'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedRange === r ? 'bg-white dark:bg-surface-900 text-primary-600 shadow-xs font-semibold' : 'text-surface-500'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="revenue" />
    </div>
  );
}
