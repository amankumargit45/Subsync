import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, AlertCircle, Clock, CheckCircle2,
  Calendar, ArrowUpRight, TrendingUp, RefreshCw, ChevronRight,
  Filter, FileText, ArrowRight, ShieldAlert, CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { dashboardApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { DATE_FILTERS } from '@/lib/constants';
import { formatCurrency, formatNumber, formatDate, getGreeting } from '@/lib/utils';

const PIE_COLORS = {
  paid: '#22c55e',      // Success green
  pending: '#f59e0b',   // Warning amber
  overdue: '#ef4444',   // Danger red
  cancelled: '#94a3b8', // Surface slate
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState('30d');
  const [revenueGranularity, setRevenueGranularity] = useState('monthly');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', selectedFilter],
    queryFn: () => dashboardApi.getDashboard({ range: selectedFilter }),
  });

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return <ErrorState title="Failed to load dashboard" message="Could not retrieve real-time metrics." onRetry={refetch} />;
  }

  const { kpis, revenueChart, subscriptionGrowth, invoiceStatus, revenueByPlan, upcomingRenewals, recentPayments, recentInvoices } = data;

  const invoiceDonutData = [
    { name: 'Paid', value: invoiceStatus.paid, color: PIE_COLORS.paid },
    { name: 'Pending', value: invoiceStatus.pending, color: PIE_COLORS.pending },
    { name: 'Overdue', value: invoiceStatus.overdue, color: PIE_COLORS.overdue },
    { name: 'Cancelled', value: invoiceStatus.cancelled, color: PIE_COLORS.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with Greeting & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Partner'}
          </h1>
          <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
            Here's what's happening with your subscription business today.
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 self-start sm:self-auto overflow-x-auto max-w-full">
          {DATE_FILTERS.map((df) => (
            <button
              key={df.value}
              onClick={() => setSelectedFilter(df.value)}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors
                ${selectedFilter === df.value
                  ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-xs font-semibold'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                }
              `}
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(kpis.activeSubscriptions.value)}
          change={kpis.activeSubscriptions.change}
          changeLabel="vs last month"
          icon={Users}
          description="Growing steadily"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(kpis.revenue.value)}
          change={kpis.revenue.change}
          changeLabel="vs last month"
          icon={DollarSign}
          description="Recurring billing"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(kpis.outstanding.value)}
          change={kpis.outstanding.change}
          changeLabel="vs last month"
          icon={Clock}
          description="Awaiting collection"
        />
        <StatCard
          title="Overdue Invoices"
          value={kpis.overdueInvoices.value}
          change={kpis.overdueInvoices.change}
          changeLabel="dunning queue"
          icon={AlertCircle}
          description="Action required"
        />
        <StatCard
          title="Payments Collected"
          value={formatCurrency(kpis.paymentsCollected.value)}
          change={kpis.paymentsCollected.change}
          changeLabel="vs last month"
          icon={CheckCircle2}
          description="Net settled to bank"
        />
        <StatCard
          title="Upcoming Renewals"
          value={kpis.upcomingRenewals.value}
          change={0}
          changeLabel="next 14 days"
          icon={Calendar}
          description="Auto-charge queued"
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview (Area Chart) */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly billed subscription revenue and recurring components</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg text-xs self-start">
              {['daily', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenueGranularity(period)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    revenueGranularity === period
                      ? 'bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                      : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-surface-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <RechartsTooltip
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="recurring" name="Recurring" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (Donut Chart) */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <CardTitle>Invoice Health</CardTitle>
            <CardDescription>Breakdown by invoice settlement status</CardDescription>
          </div>
          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {invoiceDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-surface-900 dark:text-surface-100">
                {formatNumber(invoiceStatus.paid + invoiceStatus.pending + invoiceStatus.overdue + invoiceStatus.cancelled)}
              </span>
              <span className="text-[10px] text-surface-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-surface-100 dark:border-surface-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-success-500 shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">Paid:</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">{invoiceStatus.paid}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-warning-500 shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">Pending:</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">{invoiceStatus.pending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-danger-500 shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">Overdue:</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">{invoiceStatus.overdue}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-400 shrink-0" />
              <span className="text-surface-600 dark:text-surface-400">Cancelled:</span>
              <span className="font-semibold text-surface-900 dark:text-surface-100">{invoiceStatus.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Charts Row: Subscription Growth & Revenue by Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Growth Trend (Line Chart) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Subscription Growth & Churn</CardTitle>
              <CardDescription>Monthly active accounts vs new signups</CardDescription>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriptionGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-surface-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="active" name="Active Subscribers" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="new" name="New Additions" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan (Bar Chart) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>Top subscription plans generating ARR</CardDescription>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-surface-800" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                <YAxis dataKey="plan" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={85} />
                <RechartsTooltip
                  formatter={(val) => [formatCurrency(Number(val)), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Highlights: Upcoming Renewals, Recent Payments & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Renewals */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Upcoming Renewals</CardTitle>
                <CardDescription>Next subscriptions billing</CardDescription>
              </div>
              <Link to="/subscriptions" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingRenewals.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800 text-xs">
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">{sub.customerName}</div>
                    <div className="text-[11px] text-surface-500">{sub.planName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-surface-900 dark:text-surface-100">{formatCurrency(sub.amount)}</div>
                    <div className="text-[10px] text-primary-600 dark:text-primary-400">
                      Due: {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'Auto'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest generated bills</CardDescription>
              </div>
              <Link to="/invoices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors border border-surface-100 dark:border-surface-800/60 text-xs"
                >
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
                      <span>{inv.id.toUpperCase()}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-[11px] text-surface-500 truncate max-w-[140px]">{inv.company || inv.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-surface-900 dark:text-surface-100">{formatCurrency(inv.total)}</div>
                    <div className="text-[10px] text-surface-400">{formatDate(inv.issueDate)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest completed settlements</CardDescription>
              </div>
              <Link to="/payments" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPayments.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800 text-xs">
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-surface-100">{pay.customerName}</div>
                    <div className="text-[11px] text-surface-500 flex items-center gap-1">
                      <span className="font-mono text-[10px]">{pay.method}</span>
                      {pay.reference && <span>• {pay.reference}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success-600 dark:text-success-500">+{formatCurrency(pay.amount)}</div>
                    <div className="text-[10px] text-surface-400">
                      {formatDate(pay.date || pay.paymentDate || pay.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

