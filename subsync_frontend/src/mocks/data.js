import { addDays, subDays, subMonths, format } from 'date-fns';

const now = new Date();

// ─── Users ──────────────────────────────────────────────
export const mockUsers = [
  { id: 'usr-001', name: 'Rajesh Kumar', email: 'admin@subflow.io', role: 'ADMIN', avatar: null, company: 'Brightloop Software', phone: '+91 98765 43210', createdAt: '2024-01-15' },
  { id: 'usr-002', name: 'Priya Sharma', email: 'staff@subflow.io', role: 'STAFF', avatar: null, company: 'Brightloop Software', phone: '+91 98765 43211', createdAt: '2024-02-01' },
  { id: 'usr-003', name: 'Vikram Patel', email: 'customer@subflow.io', role: 'CUSTOMER', avatar: null, company: 'ABC Technologies', phone: '+91 98765 43212', createdAt: '2024-03-10' },
];

// ─── Customers ──────────────────────────────────────────
export const mockCustomers = [
  { id: 'cust-001', name: 'Vikram Patel', email: 'vikram@abctech.in', company: 'ABC Technologies', phone: '+91 98765 43212', address: '123 MG Road, Bangalore', gstNumber: '29AABCT1234A1ZV', activeSubscriptions: 3, totalRevenue: 1250000, outstanding: 45000, status: 'Active', createdAt: '2024-03-10', notes: 'Enterprise customer, priority support' },
  { id: 'cust-002', name: 'Ananya Singh', email: 'ananya@cloudware.io', company: 'Cloudware Solutions', phone: '+91 87654 32101', address: '456 Whitefield, Bangalore', gstNumber: '29AABCS5678B2ZW', activeSubscriptions: 2, totalRevenue: 890000, outstanding: 0, status: 'Active', createdAt: '2024-04-22', notes: 'Mid-market customer' },
  { id: 'cust-003', name: 'Arjun Mehta', email: 'arjun@nexgen.co', company: 'NexGen Pvt Ltd', phone: '+91 76543 21098', address: '789 Koramangala, Bangalore', gstNumber: '29AABCN9012C3ZX', activeSubscriptions: 1, totalRevenue: 560000, outstanding: 18000, status: 'Active', createdAt: '2024-05-15', notes: '' },
  { id: 'cust-004', name: 'Deepa Krishnan', email: 'deepa@techvista.com', company: 'TechVista', phone: '+91 65432 10987', address: '321 HSR Layout, Bangalore', gstNumber: '29AABCT3456D4ZY', activeSubscriptions: 4, totalRevenue: 2100000, outstanding: 92000, status: 'Active', createdAt: '2024-02-28', notes: 'Key account, quarterly business reviews' },
  { id: 'cust-005', name: 'Sanjay Reddy', email: 'sanjay@infrabuild.in', company: 'InfraBuild Corp', phone: '+91 54321 09876', address: '654 Indiranagar, Bangalore', gstNumber: '29AABCI7890E5ZZ', activeSubscriptions: 0, totalRevenue: 320000, outstanding: 32000, status: 'Inactive', createdAt: '2024-06-12', notes: 'Churned - follow up needed' },
  { id: 'cust-006', name: 'Meera Joshi', email: 'meera@dataflow.ai', company: 'DataFlow AI', phone: '+91 43210 98765', address: '987 Electronic City, Bangalore', gstNumber: '29AABCD2345F6ZA', activeSubscriptions: 2, totalRevenue: 780000, outstanding: 0, status: 'Active', createdAt: '2024-07-01', notes: 'Startup, growing fast' },
  { id: 'cust-007', name: 'Rohan Gupta', email: 'rohan@smarterp.com', company: 'SmartERP Solutions', phone: '+91 32109 87654', address: '147 Jayanagar, Bangalore', gstNumber: '29AABCS6789G7ZB', activeSubscriptions: 1, totalRevenue: 450000, outstanding: 15000, status: 'Active', createdAt: '2024-08-20', notes: '' },
  { id: 'cust-008', name: 'Kavitha Nair', email: 'kavitha@greensoft.in', company: 'GreenSoft Technologies', phone: '+91 21098 76543', address: '258 JP Nagar, Bangalore', gstNumber: '29AABCG0123H8ZC', activeSubscriptions: 1, totalRevenue: 280000, outstanding: 0, status: 'Active', createdAt: '2024-09-05', notes: '' },
  { id: 'cust-009', name: 'Amit Deshmukh', email: 'amit@horizonit.co', company: 'Horizon IT Services', phone: '+91 10987 65432', address: '369 Marathahalli, Bangalore', gstNumber: '29AABCH4567I9ZD', activeSubscriptions: 2, totalRevenue: 670000, outstanding: 24000, status: 'Active', createdAt: '2024-10-18', notes: 'Referred by ABC Technologies' },
  { id: 'cust-010', name: 'Neha Kapoor', email: 'neha@pixelcraft.io', company: 'PixelCraft Studios', phone: '+91 09876 54321', address: '741 Bellandur, Bangalore', gstNumber: '29AABCP8901J0ZE', activeSubscriptions: 1, totalRevenue: 190000, outstanding: 0, status: 'Active', createdAt: '2024-11-02', notes: 'Design agency' },
];

// ─── Products ───────────────────────────────────────────
export const mockProducts = [
  {
    id: 'prod-001', name: 'Cloud Storage', type: 'Subscription', salesPrice: 2500, costPrice: 800, status: 'Active', createdAt: '2024-01-20',
    description: 'Scalable cloud storage solution with automatic backup and encryption',
    variants: [
      { id: 'var-001', name: '100 GB', priceAdjustment: 0 },
      { id: 'var-002', name: '500 GB', priceAdjustment: 1500 },
      { id: 'var-003', name: '1 TB', priceAdjustment: 3500 },
      { id: 'var-004', name: 'Unlimited', priceAdjustment: 7500 },
    ],
  },
  {
    id: 'prod-002', name: 'CRM Suite', type: 'Subscription', salesPrice: 4500, costPrice: 1200, status: 'Active', createdAt: '2024-01-20',
    description: 'Complete customer relationship management platform',
    variants: [
      { id: 'var-005', name: 'Starter', priceAdjustment: 0 },
      { id: 'var-006', name: 'Professional', priceAdjustment: 3000 },
      { id: 'var-007', name: 'Enterprise', priceAdjustment: 8000 },
    ],
  },
  {
    id: 'prod-003', name: 'Email Marketing', type: 'Subscription', salesPrice: 1800, costPrice: 400, status: 'Active', createdAt: '2024-02-15',
    description: 'Advanced email marketing with automation and analytics',
    variants: [
      { id: 'var-008', name: '5K contacts', priceAdjustment: 0 },
      { id: 'var-009', name: '25K contacts', priceAdjustment: 2200 },
      { id: 'var-010', name: '100K contacts', priceAdjustment: 5800 },
    ],
  },
  {
    id: 'prod-004', name: 'Analytics Platform', type: 'Subscription', salesPrice: 6000, costPrice: 2000, status: 'Active', createdAt: '2024-03-01',
    description: 'Real-time business intelligence and analytics dashboard',
    variants: [
      { id: 'var-011', name: 'Basic', priceAdjustment: 0 },
      { id: 'var-012', name: 'Pro', priceAdjustment: 4000 },
    ],
  },
  {
    id: 'prod-005', name: 'Project Management', type: 'Subscription', salesPrice: 3200, costPrice: 900, status: 'Active', createdAt: '2024-03-20',
    description: 'Agile project management with boards, sprints and reporting',
    variants: [
      { id: 'var-013', name: 'Team (up to 10)', priceAdjustment: 0 },
      { id: 'var-014', name: 'Business (up to 50)', priceAdjustment: 4800 },
      { id: 'var-015', name: 'Enterprise (unlimited)', priceAdjustment: 12000 },
    ],
  },
  {
    id: 'prod-006', name: 'API Gateway', type: 'Service', salesPrice: 8000, costPrice: 3000, status: 'Active', createdAt: '2024-04-10',
    description: 'Managed API gateway with rate limiting and monitoring',
    variants: [
      { id: 'var-016', name: '10K requests/day', priceAdjustment: 0 },
      { id: 'var-017', name: '100K requests/day', priceAdjustment: 7000 },
    ],
  },
  {
    id: 'prod-007', name: 'Support Desk', type: 'Subscription', salesPrice: 2000, costPrice: 600, status: 'Active', createdAt: '2024-05-05',
    description: 'Customer support ticketing with SLA management',
    variants: [
      { id: 'var-018', name: '3 agents', priceAdjustment: 0 },
      { id: 'var-019', name: '10 agents', priceAdjustment: 3000 },
    ],
  },
  {
    id: 'prod-008', name: 'Compliance Manager', type: 'Subscription', salesPrice: 12000, costPrice: 4500, status: 'Active', createdAt: '2024-06-01',
    description: 'Regulatory compliance tracking and audit management',
    variants: [
      { id: 'var-020', name: 'Standard', priceAdjustment: 0 },
      { id: 'var-021', name: 'Premium', priceAdjustment: 8000 },
    ],
  },
];

// ─── Plans ──────────────────────────────────────────────
export const mockPlans = [
  { id: 'plan-001', name: 'Cloud Storage Basic', productId: 'prod-001', productName: 'Cloud Storage', price: 2500, billingFrequency: 'Monthly', minQuantity: 1, startDate: '2024-01-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, status: 'Active', subscriberCount: 45, createdAt: '2024-01-20' },
  { id: 'plan-002', name: 'CRM Professional', productId: 'prod-002', productName: 'CRM Suite', price: 7500, billingFrequency: 'Monthly', minQuantity: 1, startDate: '2024-02-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, status: 'Active', subscriberCount: 32, createdAt: '2024-02-01' },
  { id: 'plan-003', name: 'Email Marketing Pro', productId: 'prod-003', productName: 'Email Marketing', price: 4000, billingFrequency: 'Monthly', minQuantity: 1, startDate: '2024-03-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: false, allowRenewal: true, status: 'Active', subscriberCount: 28, createdAt: '2024-03-01' },
  { id: 'plan-004', name: 'Analytics Enterprise', productId: 'prod-004', productName: 'Analytics Platform', price: 10000, billingFrequency: 'Monthly', minQuantity: 1, startDate: '2024-03-15', endDate: null, autoClose: false, allowPause: false, allowEarlyClose: true, allowRenewal: true, status: 'Active', subscriberCount: 15, createdAt: '2024-03-15' },
  { id: 'plan-005', name: 'Cloud Storage Annual', productId: 'prod-001', productName: 'Cloud Storage', price: 25000, billingFrequency: 'Yearly', minQuantity: 1, startDate: '2024-04-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, status: 'Active', subscriberCount: 18, createdAt: '2024-04-01' },
  { id: 'plan-006', name: 'Project Management Team', productId: 'prod-005', productName: 'Project Management', price: 3200, billingFrequency: 'Monthly', minQuantity: 1, startDate: '2024-05-01', endDate: null, autoClose: false, allowPause: true, allowEarlyClose: true, allowRenewal: true, status: 'Active', subscriberCount: 22, createdAt: '2024-05-01' },
];

// ─── Subscriptions ──────────────────────────────────────
export const mockSubscriptions = [
  { id: 'sub-10001', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', planId: 'plan-001', planName: 'Cloud Storage Basic', startDate: '2024-04-01', endDate: '2025-04-01', nextBillingDate: format(addDays(now, 12), 'yyyy-MM-dd'), amount: 2500, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-03-28' },
  { id: 'sub-10002', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', planId: 'plan-002', planName: 'CRM Professional', startDate: '2024-05-01', endDate: '2025-05-01', nextBillingDate: format(addDays(now, 5), 'yyyy-MM-dd'), amount: 7500, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-04-28' },
  { id: 'sub-10003', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', planId: 'plan-004', planName: 'Analytics Enterprise', startDate: '2024-06-01', endDate: '2025-06-01', nextBillingDate: format(addDays(now, 18), 'yyyy-MM-dd'), amount: 10000, status: 'ACTIVE', paymentTerms: 'Net 30', createdAt: '2024-05-28' },
  { id: 'sub-10004', customerId: 'cust-002', customerName: 'Ananya Singh', company: 'Cloudware Solutions', planId: 'plan-002', planName: 'CRM Professional', startDate: '2024-06-15', endDate: '2025-06-15', nextBillingDate: format(addDays(now, 8), 'yyyy-MM-dd'), amount: 7500, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-06-12' },
  { id: 'sub-10005', customerId: 'cust-002', customerName: 'Ananya Singh', company: 'Cloudware Solutions', planId: 'plan-003', planName: 'Email Marketing Pro', startDate: '2024-07-01', endDate: '2025-07-01', nextBillingDate: format(addDays(now, 22), 'yyyy-MM-dd'), amount: 4000, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-06-28' },
  { id: 'sub-10006', customerId: 'cust-003', customerName: 'Arjun Mehta', company: 'NexGen Pvt Ltd', planId: 'plan-006', planName: 'Project Management Team', startDate: '2024-08-01', endDate: '2025-08-01', nextBillingDate: format(addDays(now, 3), 'yyyy-MM-dd'), amount: 3200, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-07-28' },
  { id: 'sub-10007', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', planId: 'plan-001', planName: 'Cloud Storage Basic', startDate: '2024-03-01', endDate: '2025-03-01', nextBillingDate: format(addDays(now, 15), 'yyyy-MM-dd'), amount: 2500, status: 'ACTIVE', paymentTerms: 'Net 30', createdAt: '2024-02-28' },
  { id: 'sub-10008', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', planId: 'plan-002', planName: 'CRM Professional', startDate: '2024-04-01', endDate: '2025-04-01', nextBillingDate: format(addDays(now, 10), 'yyyy-MM-dd'), amount: 7500, status: 'ACTIVE', paymentTerms: 'Net 30', createdAt: '2024-03-28' },
  { id: 'sub-10009', customerId: 'cust-005', customerName: 'Sanjay Reddy', company: 'InfraBuild Corp', planId: 'plan-005', planName: 'Cloud Storage Annual', startDate: '2024-01-01', endDate: '2025-01-01', nextBillingDate: null, amount: 25000, status: 'CLOSED', paymentTerms: 'Net 15', createdAt: '2023-12-28' },
  { id: 'sub-10010', customerId: 'cust-006', customerName: 'Meera Joshi', company: 'DataFlow AI', planId: 'plan-004', planName: 'Analytics Enterprise', startDate: '2024-09-01', endDate: '2025-09-01', nextBillingDate: format(addDays(now, 25), 'yyyy-MM-dd'), amount: 10000, status: 'ACTIVE', paymentTerms: 'Net 15', createdAt: '2024-08-28' },
  { id: 'sub-10011', customerId: 'cust-007', customerName: 'Rohan Gupta', company: 'SmartERP Solutions', planId: 'plan-003', planName: 'Email Marketing Pro', startDate: '2024-10-01', endDate: '2025-10-01', nextBillingDate: format(addDays(now, 2), 'yyyy-MM-dd'), amount: 4000, status: 'PAUSED', paymentTerms: 'Net 15', createdAt: '2024-09-28' },
  { id: 'sub-10012', customerId: 'cust-009', customerName: 'Amit Deshmukh', company: 'Horizon IT Services', planId: 'plan-006', planName: 'Project Management Team', startDate: '2024-11-01', endDate: '2025-11-01', nextBillingDate: format(addDays(now, 28), 'yyyy-MM-dd'), amount: 3200, status: 'DRAFT', paymentTerms: 'Net 15', createdAt: '2024-10-28' },
];

// ─── Invoices ───────────────────────────────────────────
export const mockInvoices = [
  { id: 'inv-10001', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', subscriptionId: 'sub-10001', planName: 'Cloud Storage Basic', issueDate: format(subDays(now, 45), 'yyyy-MM-dd'), dueDate: format(subDays(now, 30), 'yyyy-MM-dd'), amount: 2500, tax: 450, discount: 0, total: 2950, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Cloud Storage', variant: '100 GB', quantity: 1, unitPrice: 2500, tax: 450, discount: 0, amount: 2950 }] },
  { id: 'inv-10002', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', subscriptionId: 'sub-10002', planName: 'CRM Professional', issueDate: format(subDays(now, 30), 'yyyy-MM-dd'), dueDate: format(subDays(now, 15), 'yyyy-MM-dd'), amount: 7500, tax: 1350, discount: 750, total: 8100, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500, tax: 1350, discount: 750, amount: 8100 }] },
  { id: 'inv-10003', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', subscriptionId: 'sub-10003', planName: 'Analytics Enterprise', issueDate: format(subDays(now, 15), 'yyyy-MM-dd'), dueDate: format(addDays(now, 15), 'yyyy-MM-dd'), amount: 10000, tax: 1800, discount: 0, total: 11800, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'Analytics Platform', variant: 'Pro', quantity: 1, unitPrice: 10000, tax: 1800, discount: 0, amount: 11800 }] },
  { id: 'inv-10004', customerId: 'cust-002', customerName: 'Ananya Singh', company: 'Cloudware Solutions', subscriptionId: 'sub-10004', planName: 'CRM Professional', issueDate: format(subDays(now, 40), 'yyyy-MM-dd'), dueDate: format(subDays(now, 25), 'yyyy-MM-dd'), amount: 7500, tax: 1350, discount: 0, total: 8850, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500, tax: 1350, discount: 0, amount: 8850 }] },
  { id: 'inv-10005', customerId: 'cust-002', customerName: 'Ananya Singh', company: 'Cloudware Solutions', subscriptionId: 'sub-10005', planName: 'Email Marketing Pro', issueDate: format(subDays(now, 10), 'yyyy-MM-dd'), dueDate: format(addDays(now, 5), 'yyyy-MM-dd'), amount: 4000, tax: 720, discount: 400, total: 4320, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'Email Marketing', variant: '25K contacts', quantity: 1, unitPrice: 4000, tax: 720, discount: 400, amount: 4320 }] },
  { id: 'inv-10006', customerId: 'cust-003', customerName: 'Arjun Mehta', company: 'NexGen Pvt Ltd', subscriptionId: 'sub-10006', planName: 'Project Management Team', issueDate: format(subDays(now, 60), 'yyyy-MM-dd'), dueDate: format(subDays(now, 45), 'yyyy-MM-dd'), amount: 3200, tax: 576, discount: 0, total: 3776, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Project Management', variant: 'Team', quantity: 1, unitPrice: 3200, tax: 576, discount: 0, amount: 3776 }] },
  { id: 'inv-10007', customerId: 'cust-003', customerName: 'Arjun Mehta', company: 'NexGen Pvt Ltd', subscriptionId: 'sub-10006', planName: 'Project Management Team', issueDate: format(subDays(now, 5), 'yyyy-MM-dd'), dueDate: format(addDays(now, 10), 'yyyy-MM-dd'), amount: 3200, tax: 576, discount: 0, total: 3776, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'Project Management', variant: 'Team', quantity: 1, unitPrice: 3200, tax: 576, discount: 0, amount: 3776 }] },
  { id: 'inv-10008', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', subscriptionId: 'sub-10007', planName: 'Cloud Storage Basic', issueDate: format(subDays(now, 35), 'yyyy-MM-dd'), dueDate: format(subDays(now, 5), 'yyyy-MM-dd'), amount: 2500, tax: 450, discount: 0, total: 2950, status: 'OVERDUE', paymentStatus: 'Overdue', items: [{ product: 'Cloud Storage', variant: '100 GB', quantity: 1, unitPrice: 2500, tax: 450, discount: 0, amount: 2950 }] },
  { id: 'inv-10009', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', subscriptionId: 'sub-10008', planName: 'CRM Professional', issueDate: format(subDays(now, 20), 'yyyy-MM-dd'), dueDate: format(addDays(now, 10), 'yyyy-MM-dd'), amount: 7500, tax: 1350, discount: 0, total: 8850, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500, tax: 1350, discount: 0, amount: 8850 }] },
  { id: 'inv-10010', customerId: 'cust-005', customerName: 'Sanjay Reddy', company: 'InfraBuild Corp', subscriptionId: 'sub-10009', planName: 'Cloud Storage Annual', issueDate: format(subDays(now, 90), 'yyyy-MM-dd'), dueDate: format(subDays(now, 60), 'yyyy-MM-dd'), amount: 25000, tax: 4500, discount: 2500, total: 27000, status: 'OVERDUE', paymentStatus: 'Overdue', items: [{ product: 'Cloud Storage', variant: 'Unlimited', quantity: 1, unitPrice: 25000, tax: 4500, discount: 2500, amount: 27000 }] },
  { id: 'inv-10011', customerId: 'cust-006', customerName: 'Meera Joshi', company: 'DataFlow AI', subscriptionId: 'sub-10010', planName: 'Analytics Enterprise', issueDate: format(subDays(now, 25), 'yyyy-MM-dd'), dueDate: format(subDays(now, 10), 'yyyy-MM-dd'), amount: 10000, tax: 1800, discount: 1000, total: 10800, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Analytics Platform', variant: 'Pro', quantity: 1, unitPrice: 10000, tax: 1800, discount: 1000, amount: 10800 }] },
  { id: 'inv-10012', customerId: 'cust-007', customerName: 'Rohan Gupta', company: 'SmartERP Solutions', subscriptionId: 'sub-10011', planName: 'Email Marketing Pro', issueDate: format(subDays(now, 50), 'yyyy-MM-dd'), dueDate: format(subDays(now, 35), 'yyyy-MM-dd'), amount: 4000, tax: 720, discount: 0, total: 4720, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Email Marketing', variant: '25K contacts', quantity: 1, unitPrice: 4000, tax: 720, discount: 0, amount: 4720 }] },
  { id: 'inv-10013', customerId: 'cust-008', customerName: 'Kavitha Nair', company: 'GreenSoft Technologies', subscriptionId: null, planName: 'Support Desk', issueDate: format(subDays(now, 8), 'yyyy-MM-dd'), dueDate: format(addDays(now, 7), 'yyyy-MM-dd'), amount: 2000, tax: 360, discount: 0, total: 2360, status: 'DRAFT', paymentStatus: 'Pending', items: [{ product: 'Support Desk', variant: '3 agents', quantity: 1, unitPrice: 2000, tax: 360, discount: 0, amount: 2360 }] },
  { id: 'inv-10014', customerId: 'cust-009', customerName: 'Amit Deshmukh', company: 'Horizon IT Services', subscriptionId: 'sub-10012', planName: 'Project Management Team', issueDate: format(subDays(now, 3), 'yyyy-MM-dd'), dueDate: format(addDays(now, 12), 'yyyy-MM-dd'), amount: 3200, tax: 576, discount: 320, total: 3456, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'Project Management', variant: 'Team', quantity: 1, unitPrice: 3200, tax: 576, discount: 320, amount: 3456 }] },
  { id: 'inv-10015', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', subscriptionId: 'sub-10007', planName: 'Cloud Storage Basic', issueDate: format(subDays(now, 70), 'yyyy-MM-dd'), dueDate: format(subDays(now, 40), 'yyyy-MM-dd'), amount: 2500, tax: 450, discount: 0, total: 2950, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Cloud Storage', variant: '100 GB', quantity: 1, unitPrice: 2500, tax: 450, discount: 0, amount: 2950 }] },
  { id: 'inv-10016', customerId: 'cust-006', customerName: 'Meera Joshi', company: 'DataFlow AI', subscriptionId: 'sub-10010', planName: 'Analytics Enterprise', issueDate: format(subDays(now, 55), 'yyyy-MM-dd'), dueDate: format(subDays(now, 40), 'yyyy-MM-dd'), amount: 10000, tax: 1800, discount: 1000, total: 10800, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Analytics Platform', variant: 'Pro', quantity: 1, unitPrice: 10000, tax: 1800, discount: 1000, amount: 10800 }] },
  { id: 'inv-10017', customerId: 'cust-009', customerName: 'Amit Deshmukh', company: 'Horizon IT Services', subscriptionId: null, planName: 'Project Management Team', issueDate: format(subDays(now, 30), 'yyyy-MM-dd'), dueDate: format(subDays(now, 15), 'yyyy-MM-dd'), amount: 3200, tax: 576, discount: 0, total: 3776, status: 'CANCELLED', paymentStatus: 'Cancelled', items: [{ product: 'Project Management', variant: 'Team', quantity: 1, unitPrice: 3200, tax: 576, discount: 0, amount: 3776 }] },
  { id: 'inv-10018', customerId: 'cust-010', customerName: 'Neha Kapoor', company: 'PixelCraft Studios', subscriptionId: null, planName: 'CRM Professional', issueDate: format(subDays(now, 12), 'yyyy-MM-dd'), dueDate: format(addDays(now, 3), 'yyyy-MM-dd'), amount: 7500, tax: 1350, discount: 0, total: 8850, status: 'CONFIRMED', paymentStatus: 'Pending', items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500, tax: 1350, discount: 0, amount: 8850 }] },
  { id: 'inv-10019', customerId: 'cust-004', customerName: 'Deepa Krishnan', company: 'TechVista', subscriptionId: 'sub-10008', planName: 'CRM Professional', issueDate: format(subDays(now, 50), 'yyyy-MM-dd'), dueDate: format(subDays(now, 20), 'yyyy-MM-dd'), amount: 7500, tax: 1350, discount: 0, total: 8850, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500, tax: 1350, discount: 0, amount: 8850 }] },
  { id: 'inv-10020', customerId: 'cust-001', customerName: 'Vikram Patel', company: 'ABC Technologies', subscriptionId: 'sub-10001', planName: 'Cloud Storage Basic', issueDate: format(subDays(now, 75), 'yyyy-MM-dd'), dueDate: format(subDays(now, 60), 'yyyy-MM-dd'), amount: 2500, tax: 450, discount: 0, total: 2950, status: 'PAID', paymentStatus: 'Paid', items: [{ product: 'Cloud Storage', variant: '100 GB', quantity: 1, unitPrice: 2500, tax: 450, discount: 0, amount: 2950 }] },
];

// ─── Payments ───────────────────────────────────────────
export const mockPayments = [
  { id: 'pay-10001', invoiceId: 'inv-10001', customerId: 'cust-001', customerName: 'Vikram Patel', amount: 2950, method: 'UPI', date: format(subDays(now, 44), 'yyyy-MM-dd'), status: 'Completed', note: 'Auto-debit via PhonePe', reference: 'UPI/123456789' },
  { id: 'pay-10002', invoiceId: 'inv-10002', customerId: 'cust-001', customerName: 'Vikram Patel', amount: 8100, method: 'Bank Transfer', date: format(subDays(now, 28), 'yyyy-MM-dd'), status: 'Completed', note: 'NEFT transfer', reference: 'NEFT/987654321' },
  { id: 'pay-10003', invoiceId: 'inv-10004', customerId: 'cust-002', customerName: 'Ananya Singh', amount: 8850, method: 'Card', date: format(subDays(now, 38), 'yyyy-MM-dd'), status: 'Completed', note: 'Visa ending 4242', reference: 'TXN/456789012' },
  { id: 'pay-10004', invoiceId: 'inv-10006', customerId: 'cust-003', customerName: 'Arjun Mehta', amount: 3776, method: 'UPI', date: format(subDays(now, 58), 'yyyy-MM-dd'), status: 'Completed', note: 'Google Pay', reference: 'UPI/345678901' },
  { id: 'pay-10005', invoiceId: 'inv-10011', customerId: 'cust-006', customerName: 'Meera Joshi', amount: 10800, method: 'Bank Transfer', date: format(subDays(now, 22), 'yyyy-MM-dd'), status: 'Completed', note: 'RTGS', reference: 'RTGS/234567890' },
  { id: 'pay-10006', invoiceId: 'inv-10012', customerId: 'cust-007', customerName: 'Rohan Gupta', amount: 4720, method: 'UPI', date: format(subDays(now, 48), 'yyyy-MM-dd'), status: 'Completed', note: 'Paytm', reference: 'UPI/567890123' },
  { id: 'pay-10007', invoiceId: 'inv-10015', customerId: 'cust-004', customerName: 'Deepa Krishnan', amount: 2950, method: 'Card', date: format(subDays(now, 65), 'yyyy-MM-dd'), status: 'Completed', note: 'Mastercard ending 5678', reference: 'TXN/678901234' },
  { id: 'pay-10008', invoiceId: 'inv-10016', customerId: 'cust-006', customerName: 'Meera Joshi', amount: 10800, method: 'UPI', date: format(subDays(now, 52), 'yyyy-MM-dd'), status: 'Completed', note: 'PhonePe', reference: 'UPI/789012345' },
  { id: 'pay-10009', invoiceId: 'inv-10019', customerId: 'cust-004', customerName: 'Deepa Krishnan', amount: 8850, method: 'Bank Transfer', date: format(subDays(now, 48), 'yyyy-MM-dd'), status: 'Completed', note: 'NEFT transfer', reference: 'NEFT/890123456' },
  { id: 'pay-10010', invoiceId: 'inv-10020', customerId: 'cust-001', customerName: 'Vikram Patel', amount: 2950, method: 'UPI', date: format(subDays(now, 73), 'yyyy-MM-dd'), status: 'Completed', note: 'Auto-debit via PhonePe', reference: 'UPI/901234567' },
  { id: 'pay-10011', invoiceId: null, customerId: 'cust-004', customerName: 'Deepa Krishnan', amount: 5000, method: 'Cash', date: format(subDays(now, 15), 'yyyy-MM-dd'), status: 'Completed', note: 'Partial payment for pending invoices', reference: 'CASH/001' },
  { id: 'pay-10012', invoiceId: null, customerId: 'cust-009', customerName: 'Amit Deshmukh', amount: 3200, method: 'Card', date: format(subDays(now, 5), 'yyyy-MM-dd'), status: 'Pending', note: 'Awaiting bank confirmation', reference: 'TXN/012345678' },
  { id: 'pay-10013', invoiceId: null, customerId: 'cust-005', customerName: 'Sanjay Reddy', amount: 15000, method: 'Bank Transfer', date: format(subDays(now, 2), 'yyyy-MM-dd'), status: 'Failed', note: 'Insufficient funds', reference: 'NEFT/FAILED/001' },
  { id: 'pay-10014', invoiceId: null, customerId: 'cust-010', customerName: 'Neha Kapoor', amount: 8850, method: 'UPI', date: format(subDays(now, 1), 'yyyy-MM-dd'), status: 'Pending', note: 'Processing', reference: 'UPI/112233445' },
  { id: 'pay-10015', invoiceId: null, customerId: 'cust-008', customerName: 'Kavitha Nair', amount: 2360, method: 'UPI', date: format(now, 'yyyy-MM-dd'), status: 'Completed', note: 'Google Pay', reference: 'UPI/556677889' },
];

// ─── Quotations ─────────────────────────────────────────
export const mockQuotations = [
  { id: 'qt-10001', customerId: 'cust-009', customerName: 'Amit Deshmukh', company: 'Horizon IT Services', planId: 'plan-006', planName: 'Project Management Team', amount: 3200, tax: 576, discount: 320, total: 3456, validUntil: format(addDays(now, 15), 'yyyy-MM-dd'), status: 'DRAFT', createdAt: format(subDays(now, 2), 'yyyy-MM-dd'), items: [{ product: 'Project Management', variant: 'Team', quantity: 1, unitPrice: 3200 }] },
  { id: 'qt-10002', customerId: 'cust-010', customerName: 'Neha Kapoor', company: 'PixelCraft Studios', planId: 'plan-002', planName: 'CRM Professional', amount: 7500, tax: 1350, discount: 0, total: 8850, validUntil: format(addDays(now, 10), 'yyyy-MM-dd'), status: 'QUOTATION', createdAt: format(subDays(now, 5), 'yyyy-MM-dd'), items: [{ product: 'CRM Suite', variant: 'Professional', quantity: 1, unitPrice: 7500 }] },
  { id: 'qt-10003', customerId: 'cust-008', customerName: 'Kavitha Nair', company: 'GreenSoft Technologies', planId: 'plan-001', planName: 'Cloud Storage Basic', amount: 2500, tax: 450, discount: 250, total: 2700, validUntil: format(subDays(now, 5), 'yyyy-MM-dd'), status: 'EXPIRED', createdAt: format(subDays(now, 40), 'yyyy-MM-dd'), items: [{ product: 'Cloud Storage', variant: '100 GB', quantity: 1, unitPrice: 2500 }] },
  { id: 'qt-10004', customerId: 'cust-006', customerName: 'Meera Joshi', company: 'DataFlow AI', planId: 'plan-004', planName: 'Analytics Enterprise', amount: 10000, tax: 1800, discount: 1000, total: 10800, validUntil: format(addDays(now, 20), 'yyyy-MM-dd'), status: 'CONFIRMED', createdAt: format(subDays(now, 10), 'yyyy-MM-dd'), items: [{ product: 'Analytics Platform', variant: 'Pro', quantity: 1, unitPrice: 10000 }] },
  { id: 'qt-10005', customerId: 'cust-005', customerName: 'Sanjay Reddy', company: 'InfraBuild Corp', planId: 'plan-005', planName: 'Cloud Storage Annual', amount: 25000, tax: 4500, discount: 0, total: 29500, validUntil: format(subDays(now, 2), 'yyyy-MM-dd'), status: 'REJECTED', createdAt: format(subDays(now, 20), 'yyyy-MM-dd'), items: [{ product: 'Cloud Storage', variant: 'Unlimited', quantity: 1, unitPrice: 25000 }] },
];

// ─── Discounts ──────────────────────────────────────────
export const mockDiscounts = [
  { id: 'disc-001', name: 'Early Bird', type: 'Percentage', value: 10, minQuantity: 1, minPurchase: 0, startDate: '2024-01-01', endDate: '2026-11-30', usageLimit: 100, usageCount: 64, applicableProducts: ['prod-001', 'prod-002'], applicableSubscriptions: [], status: 'Active' },
  { id: 'disc-002', name: 'Annual Loyalty', type: 'Fixed', value: 2500, minQuantity: 1, minPurchase: 20000, startDate: '2024-03-01', endDate: '2026-12-31', usageLimit: 50, usageCount: 18, applicableProducts: [], applicableSubscriptions: ['plan-005'], status: 'Active' },
  { id: 'disc-003', name: 'Launch Special', type: 'Percentage', value: 15, minQuantity: 1, minPurchase: 0, startDate: '2024-01-01', endDate: '2024-06-30', usageLimit: 200, usageCount: 200, applicableProducts: ['prod-003', 'prod-004'], applicableSubscriptions: [], status: 'Exhausted' },
  { id: 'disc-004', name: 'Bundle Deal', type: 'Fixed', value: 1000, minQuantity: 3, minPurchase: 10000, startDate: '2027-01-01', endDate: '2027-06-30', usageLimit: 75, usageCount: 0, applicableProducts: [], applicableSubscriptions: [], status: 'Scheduled' },
  { id: 'disc-005', name: 'Festive Offer', type: 'Percentage', value: 20, minQuantity: 1, minPurchase: 5000, startDate: '2024-10-15', endDate: '2024-11-15', usageLimit: 150, usageCount: 89, applicableProducts: [], applicableSubscriptions: [], status: 'Expired' },
];

// ─── Taxes ──────────────────────────────────────────────
export const mockTaxes = [
  { id: 'tax-001', name: 'GST', rate: 18, type: 'Percentage', description: 'Goods and Services Tax', status: 'Active', createdAt: '2024-01-01' },
  { id: 'tax-002', name: 'IGST', rate: 18, type: 'Percentage', description: 'Integrated GST for inter-state', status: 'Active', createdAt: '2024-01-01' },
  { id: 'tax-003', name: 'CGST', rate: 9, type: 'Percentage', description: 'Central GST', status: 'Active', createdAt: '2024-01-01' },
  { id: 'tax-004', name: 'SGST', rate: 9, type: 'Percentage', description: 'State GST', status: 'Active', createdAt: '2024-01-01' },
];

// ─── Dashboard Data ─────────────────────────────────────
export const mockDashboardData = {
  kpis: {
    activeSubscriptions: { value: 1248, change: 8.4, previousValue: 1151 },
    revenue: { value: 4280000, change: 12.7, previousValue: 3798000 },
    outstanding: { value: 320000, change: -5.2, previousValue: 337600 },
    overdueInvoices: { value: 87, change: 3.1, previousValue: 84 },
    paymentsCollected: { value: 3850000, change: 15.3, previousValue: 3339000 },
    upcomingRenewals: { value: 156, change: 0, previousValue: 156 },
  },
  revenueChart: Array.from({ length: 12 }, (_, i) => ({
    month: format(subMonths(now, 11 - i), 'MMM yyyy'),
    revenue: Math.floor(Math.random() * 2000000) + 2500000,
    recurring: Math.floor(Math.random() * 1500000) + 2000000,
  })),
  subscriptionGrowth: Array.from({ length: 12 }, (_, i) => ({
    month: format(subMonths(now, 11 - i), 'MMM yyyy'),
    active: Math.floor(800 + i * 40 + Math.random() * 50),
    new: Math.floor(30 + Math.random() * 40),
    churned: Math.floor(5 + Math.random() * 15),
  })),
  invoiceStatus: {
    paid: 892,
    pending: 234,
    overdue: 87,
    cancelled: 45,
  },
  revenueByPlan: [
    { plan: 'Cloud Basic', revenue: 1125000 },
    { plan: 'CRM Pro', revenue: 2400000 },
    { plan: 'Email Pro', revenue: 1120000 },
    { plan: 'Analytics Ent', revenue: 1500000 },
    { plan: 'Storage Annual', revenue: 4500000 },
    { plan: 'PM Team', revenue: 704000 },
  ],
  upcomingRenewals: mockSubscriptions
    .filter(s => s.status === 'ACTIVE' && s.nextBillingDate)
    .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate))
    .slice(0, 5),
  recentPayments: mockPayments.slice(0, 5),
  recentInvoices: mockInvoices.slice(0, 5),
};
