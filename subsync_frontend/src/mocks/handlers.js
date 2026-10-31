/**
 * Mock API handler that simulates backend responses.
 * All mock data is centralized here so replacing with real API calls
 * requires zero changes to UI components — only swap the implementation
 * in the api/ layer files.
 */
import { sleep } from '@/lib/utils';
import {
  mockUsers, mockCustomers, mockProducts, mockPlans,
  mockSubscriptions, mockInvoices, mockPayments,
  mockQuotations, mockDiscounts, mockTaxes, mockDashboardData,
} from './data';
import { DEMO_ACCOUNTS } from '@/lib/constants';

const MOCK_DELAY = 400;

// Deep clone to avoid mutating original data
const clone = (data) => JSON.parse(JSON.stringify(data));

// In-memory stores (mutable copies for CRUD)
let customers = clone(mockCustomers);
let products = clone(mockProducts);
let plans = clone(mockPlans);
let subscriptions = clone(mockSubscriptions);
let invoices = clone(mockInvoices);
let payments = clone(mockPayments);
let quotations = clone(mockQuotations);
let discounts = clone(mockDiscounts);
let taxes = clone(mockTaxes);

function paginate(data, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: data.slice(start, end),
    total: data.length,
    page,
    limit,
    totalPages: Math.ceil(data.length / limit),
  };
}

function filterAndSort(data, { search, status, sortBy, sortOrder = 'desc' } = {}) {
  let result = [...data];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(item =>
      Object.values(item).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(q)
      )
    );
  }
  if (status && status !== 'all') {
    result = result.filter(item =>
      (item.status || '').toLowerCase() === status.toLowerCase()
    );
  }
  if (sortBy) {
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'number') return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }
  return result;
}

export const mockApi = {
  // ─── Auth ───────────────────────────
  async login({ email, password }) {
    await sleep(MOCK_DELAY);
    const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (!account) throw new Error('Invalid email or password');
    const user = mockUsers.find(u => u.email === email) || {
      id: 'usr-demo',
      name: account.name,
      email: account.email,
      role: account.role,
      company: 'Brightloop Software',
    };
    return { user, token: `mock-token-${Date.now()}` };
  },

  async register(data) {
    await sleep(MOCK_DELAY);
    return { user: { id: `usr-${Date.now()}`, ...data, role: 'CUSTOMER' }, token: `mock-token-${Date.now()}` };
  },

  // ─── Dashboard ──────────────────────
  async getDashboard() {
    await sleep(MOCK_DELAY);
    return clone(mockDashboardData);
  },

  // ─── Customers ──────────────────────
  async getCustomers(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(customers, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getCustomer(id) {
    await sleep(MOCK_DELAY);
    const customer = customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return {
      ...customer,
      subscriptions: subscriptions.filter(s => s.customerId === id),
      invoices: invoices.filter(i => i.customerId === id),
      payments: payments.filter(p => p.customerId === id),
    };
  },

  async createCustomer(data) {
    await sleep(MOCK_DELAY);
    const customer = { id: `cust-${Date.now()}`, ...data, activeSubscriptions: 0, totalRevenue: 0, outstanding: 0, status: 'Active', createdAt: new Date().toISOString().split('T')[0] };
    customers.unshift(customer);
    return customer;
  },

  async updateCustomer(id, data) {
    await sleep(MOCK_DELAY);
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customers[idx] = { ...customers[idx], ...data };
    return customers[idx];
  },

  async deleteCustomer(id) {
    await sleep(MOCK_DELAY);
    customers = customers.filter(c => c.id !== id);
    return { success: true };
  },

  // ─── Products ───────────────────────
  async getProducts(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(products, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getProduct(id) {
    await sleep(MOCK_DELAY);
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return { ...product, plans: plans.filter(pl => pl.productId === id) };
  },

  async createProduct(data) {
    await sleep(MOCK_DELAY);
    const product = { id: `prod-${Date.now()}`, ...data, status: 'Active', createdAt: new Date().toISOString().split('T')[0], variants: data.variants || [] };
    products.unshift(product);
    return product;
  },

  async updateProduct(id, data) {
    await sleep(MOCK_DELAY);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    products[idx] = { ...products[idx], ...data };
    return products[idx];
  },

  async deleteProduct(id) {
    await sleep(MOCK_DELAY);
    products = products.filter(p => p.id !== id);
    return { success: true };
  },

  // ─── Plans ──────────────────────────
  async getPlans(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(plans, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getPlan(id) {
    await sleep(MOCK_DELAY);
    const plan = plans.find(p => p.id === id);
    if (!plan) throw new Error('Plan not found');
    return plan;
  },

  async createPlan(data) {
    await sleep(MOCK_DELAY);
    const product = products.find(p => p.id === data.productId);
    const plan = { id: `plan-${Date.now()}`, ...data, productName: product?.name || '', subscriberCount: 0, status: 'Active', createdAt: new Date().toISOString().split('T')[0] };
    plans.unshift(plan);
    return plan;
  },

  async updatePlan(id, data) {
    await sleep(MOCK_DELAY);
    const idx = plans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    plans[idx] = { ...plans[idx], ...data };
    return plans[idx];
  },

  async deletePlan(id) {
    await sleep(MOCK_DELAY);
    plans = plans.filter(p => p.id !== id);
    return { success: true };
  },

  // ─── Quotations ─────────────────────
  async getQuotations(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(quotations, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getQuotation(id) {
    await sleep(MOCK_DELAY);
    const q = quotations.find(qt => qt.id === id);
    if (!q) throw new Error('Quotation not found');
    return q;
  },

  async createQuotation(data) {
    await sleep(MOCK_DELAY);
    const qt = { id: `qt-${Date.now()}`, ...data, status: 'DRAFT', createdAt: new Date().toISOString().split('T')[0] };
    quotations.unshift(qt);
    return qt;
  },

  async updateQuotation(id, data) {
    await sleep(MOCK_DELAY);
    const idx = quotations.findIndex(q => q.id === id);
    if (idx === -1) throw new Error('Quotation not found');
    quotations[idx] = { ...quotations[idx], ...data };
    return quotations[idx];
  },

  async convertQuotationToSubscription(id) {
    await sleep(MOCK_DELAY);
    const qt = quotations.find(q => q.id === id);
    if (!qt) throw new Error('Quotation not found');
    qt.status = 'CONFIRMED';
    const sub = {
      id: `sub-${Date.now()}`, customerId: qt.customerId, customerName: qt.customerName, company: qt.company,
      planId: qt.planId, planName: qt.planName, startDate: new Date().toISOString().split('T')[0],
      endDate: null, nextBillingDate: null, amount: qt.amount, status: 'ACTIVE', paymentTerms: 'Net 15',
      createdAt: new Date().toISOString().split('T')[0],
    };
    subscriptions.unshift(sub);
    return sub;
  },

  // ─── Subscriptions ──────────────────
  async getSubscriptions(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(subscriptions, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getSubscription(id) {
    await sleep(MOCK_DELAY);
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) throw new Error('Subscription not found');
    return {
      ...sub,
      invoices: invoices.filter(i => i.subscriptionId === id),
      payments: payments.filter(p => invoices.some(i => i.subscriptionId === id && i.id === p.invoiceId)),
    };
  },

  async updateSubscription(id, data) {
    await sleep(MOCK_DELAY);
    const idx = subscriptions.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Subscription not found');
    subscriptions[idx] = { ...subscriptions[idx], ...data };
    return subscriptions[idx];
  },

  async pauseSubscription(id) {
    return this.updateSubscription(id, { status: 'PAUSED' });
  },

  async resumeSubscription(id) {
    return this.updateSubscription(id, { status: 'ACTIVE' });
  },

  async closeSubscription(id) {
    return this.updateSubscription(id, { status: 'CLOSED', nextBillingDate: null });
  },

  async generateInvoice(subscriptionId) {
    await sleep(MOCK_DELAY);
    const sub = subscriptions.find(s => s.id === subscriptionId);
    if (!sub) throw new Error('Subscription not found');
    const inv = {
      id: `inv-${Date.now()}`, customerId: sub.customerId, customerName: sub.customerName, company: sub.company,
      subscriptionId, planName: sub.planName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      amount: sub.amount, tax: Math.round(sub.amount * 0.18), discount: 0,
      total: Math.round(sub.amount * 1.18),
      status: 'CONFIRMED', paymentStatus: 'Pending',
      items: [{ product: sub.planName, variant: '', quantity: 1, unitPrice: sub.amount, tax: Math.round(sub.amount * 0.18), discount: 0, amount: Math.round(sub.amount * 1.18) }],
    };
    invoices.unshift(inv);
    return inv;
  },

  // ─── Invoices ───────────────────────
  async getInvoices(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(invoices, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getInvoice(id) {
    await sleep(MOCK_DELAY);
    const inv = invoices.find(i => i.id === id);
    if (!inv) throw new Error('Invoice not found');
    return inv;
  },

  async updateInvoice(id, data) {
    await sleep(MOCK_DELAY);
    const idx = invoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    invoices[idx] = { ...invoices[idx], ...data };
    return invoices[idx];
  },

  async confirmInvoice(id) {
    return this.updateInvoice(id, { status: 'CONFIRMED' });
  },

  async cancelInvoice(id) {
    return this.updateInvoice(id, { status: 'CANCELLED', paymentStatus: 'Cancelled' });
  },

  // ─── Payments ───────────────────────
  async getPayments(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(payments, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getPayment(id) {
    await sleep(MOCK_DELAY);
    return payments.find(p => p.id === id);
  },

  async createPayment(data) {
    await sleep(MOCK_DELAY);
    const payment = { id: `pay-${Date.now()}`, ...data, status: 'Completed', date: new Date().toISOString().split('T')[0] };
    payments.unshift(payment);
    // Update invoice status if linked
    if (data.invoiceId) {
      const idx = invoices.findIndex(i => i.id === data.invoiceId);
      if (idx !== -1) {
        invoices[idx].status = 'PAID';
        invoices[idx].paymentStatus = 'Paid';
      }
    }
    return payment;
  },

  // ─── Discounts ──────────────────────
  async getDiscounts(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(discounts, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getDiscount(id) {
    await sleep(MOCK_DELAY);
    return discounts.find(d => d.id === id);
  },

  async createDiscount(data) {
    await sleep(MOCK_DELAY);
    const discount = { id: `disc-${Date.now()}`, ...data, usageCount: 0, status: 'Active' };
    discounts.unshift(discount);
    return discount;
  },

  async updateDiscount(id, data) {
    await sleep(MOCK_DELAY);
    const idx = discounts.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Discount not found');
    discounts[idx] = { ...discounts[idx], ...data };
    return discounts[idx];
  },

  async deleteDiscount(id) {
    await sleep(MOCK_DELAY);
    discounts = discounts.filter(d => d.id !== id);
    return { success: true };
  },

  // ─── Taxes ──────────────────────────
  async getTaxes(params = {}) {
    await sleep(MOCK_DELAY);
    const filtered = filterAndSort(taxes, params);
    return paginate(filtered, params.page, params.limit);
  },

  async getTax(id) {
    await sleep(MOCK_DELAY);
    return taxes.find(t => t.id === id);
  },

  async createTax(data) {
    await sleep(MOCK_DELAY);
    const tax = { id: `tax-${Date.now()}`, ...data, status: 'Active', createdAt: new Date().toISOString().split('T')[0] };
    taxes.unshift(tax);
    return tax;
  },

  async updateTax(id, data) {
    await sleep(MOCK_DELAY);
    const idx = taxes.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Tax not found');
    taxes[idx] = { ...taxes[idx], ...data };
    return taxes[idx];
  },

  async deleteTax(id) {
    await sleep(MOCK_DELAY);
    taxes = taxes.filter(t => t.id !== id);
    return { success: true };
  },

  // ─── Reports ────────────────────────
  async getReports() {
    await sleep(MOCK_DELAY);
    return {
      revenue: {
        total: 4280000,
        recurring: 3950000,
        collected: 3850000,
        outstanding: 320000,
        overdue: 110000,
      },
      subscriptions: {
        active: 1248,
        new: 156,
        renewed: 89,
        paused: 23,
        closed: 45,
        expired: 12,
      },
      invoices: {
        total: 1258,
        paid: 892,
        pending: 234,
        overdue: 87,
        cancelled: 45,
      },
      charts: mockDashboardData,
    };
  },
};
