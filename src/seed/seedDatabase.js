const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');
const { hashPassword } = require('../utils/password');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const Quotation = require('../models/Quotation');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Discount = require('../models/Discount');
const Tax = require('../models/Tax');

const seed = async () => {
  try {
    console.log('🌱 Starting SubFlow database seeding...');
    await connectDB();

    // Clean existing collections
    console.log('🧹 Clearing collections...');
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Plan.deleteMany({}),
      Quotation.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Discount.deleteMany({}),
      Tax.deleteMany({}),
    ]);
    const Counter = mongoose.connection.collection('counters');
    await Counter.deleteMany({});

    // 1. Users
    console.log('👤 Creating Users...');
    const adminPasswordHash = await hashPassword('Admin@12345');
    const staffPasswordHash = await hashPassword('Staff@12345');
    const custPasswordHash = await hashPassword('Customer@12345');

    const admin = await User.create({
      name: 'Brightloop Admin',
      email: 'admin@subflow.app',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    });

    const staff = await User.create({
      name: 'Sarah Ops',
      email: 'staff@subflow.app',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isActive: true,
    });

    const custUser1 = await User.create({
      name: 'John Doe',
      email: 'acme@example.com',
      passwordHash: custPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
    });

    const custUser2 = await User.create({
      name: 'Jane Smith',
      email: 'nexus@example.com',
      passwordHash: custPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
    });

    const custUser3 = await User.create({
      name: 'Bob Miller',
      email: 'zenith@example.com',
      passwordHash: custPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
    });

    // 2. Customers
    console.log('🏢 Creating Customers...');
    const customer1 = await Customer.create({
      userId: custUser1._id,
      companyName: 'Acme Innovations Ltd',
      contactName: 'John Doe',
      email: 'acme@example.com',
      phone: '+91 98765 43210',
      address: {
        street: '101 Cyber City, Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122002',
        country: 'India',
      },
      taxId: '06AAAAA0000A1Z5',
      status: 'ACTIVE',
    });

    const customer2 = await Customer.create({
      userId: custUser2._id,
      companyName: 'Nexus Cloud Systems',
      contactName: 'Jane Smith',
      email: 'nexus@example.com',
      phone: '+91 98111 22334',
      address: {
        street: '404 Silicon Hub, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      taxId: '29BBBBB1111B2Z4',
      status: 'ACTIVE',
    });

    const customer3 = await Customer.create({
      userId: custUser3._id,
      companyName: 'Zenith Enterprise Labs',
      contactName: 'Bob Miller',
      email: 'zenith@example.com',
      phone: '+91 99000 88776',
      address: {
        street: '12 High Street, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      taxId: '27CCCCC2222C3Z3',
      status: 'ACTIVE',
    });

    // 3. Products
    console.log('📦 Creating Products...');
    const storageProduct = await Product.create({
      name: 'Cloud Storage',
      type: 'SERVICE',
      salesPrice: 2000,
      costPrice: 600,
      notes: 'Enterprise high-availability object storage with automatic replication.',
      variants: [
        { name: 'Storage Size', value: '100 GB', priceAdjustment: 0 },
        { name: 'Storage Size', value: '500 GB', priceAdjustment: 1500 },
        { name: 'Storage Size', value: '1 TB', priceAdjustment: 3000 },
      ],
      status: 'ACTIVE',
    });

    const crmProduct = await Product.create({
      name: 'CRM',
      type: 'SERVICE',
      salesPrice: 5000,
      costPrice: 1500,
      notes: 'End-to-end customer relationship and pipeline tracking suite.',
      variants: [
        { name: 'Seat Count', value: '5 Seats', priceAdjustment: 0 },
        { name: 'Seat Count', value: '20 Seats', priceAdjustment: 4000 },
        { name: 'Seat Count', value: 'Unlimited', priceAdjustment: 10000 },
      ],
      status: 'ACTIVE',
    });

    const analyticsProduct = await Product.create({
      name: 'Analytics',
      type: 'SERVICE',
      salesPrice: 4000,
      costPrice: 1200,
      notes: 'Business intelligence and automated recurring revenue metrics.',
      variants: [
        { name: 'Tier', value: 'Standard', priceAdjustment: 0 },
        { name: 'Tier', value: 'Real-Time Streaming', priceAdjustment: 2500 },
      ],
      status: 'ACTIVE',
    });

    const pmProduct = await Product.create({
      name: 'Project Management',
      type: 'SERVICE',
      salesPrice: 3000,
      costPrice: 900,
      notes: 'Agile sprints, Kanban boards, and milestone tracking.',
      variants: [
        { name: 'Workspaces', value: '3 Projects', priceAdjustment: 0 },
        { name: 'Workspaces', value: '10 Projects', priceAdjustment: 2000 },
        { name: 'Workspaces', value: 'Unlimited', priceAdjustment: 5000 },
      ],
      status: 'ACTIVE',
    });

    // 4. Plans
    console.log('📋 Creating Plans...');
    const basicMonthlyPlan = await Plan.create({
      name: 'Basic Monthly',
      productId: storageProduct._id,
      price: 2000,
      billingFrequency: 'MONTHLY',
      minimumQuantity: 1,
      lifecycleRules: {
        autoClose: false,
        allowPause: true,
        allowEarlyClose: true,
        allowRenewal: true,
      },
      status: 'ACTIVE',
    });

    const proMonthlyPlan = await Plan.create({
      name: 'Pro Monthly',
      productId: crmProduct._id,
      price: 5000,
      billingFrequency: 'MONTHLY',
      minimumQuantity: 1,
      lifecycleRules: {
        autoClose: false,
        allowPause: true,
        allowEarlyClose: true,
        allowRenewal: true,
      },
      status: 'ACTIVE',
    });

    const entMonthlyPlan = await Plan.create({
      name: 'Enterprise Monthly',
      productId: analyticsProduct._id,
      price: 8000,
      billingFrequency: 'MONTHLY',
      minimumQuantity: 1,
      lifecycleRules: {
        autoClose: false,
        allowPause: true,
        allowEarlyClose: true,
        allowRenewal: true,
      },
      status: 'ACTIVE',
    });

    const entYearlyPlan = await Plan.create({
      name: 'Enterprise Yearly',
      productId: pmProduct._id,
      price: 30000,
      billingFrequency: 'YEARLY',
      minimumQuantity: 1,
      lifecycleRules: {
        autoClose: false,
        allowPause: true,
        allowEarlyClose: true,
        allowRenewal: true,
      },
      status: 'ACTIVE',
    });

    // 5. Taxes
    console.log('🏛️ Creating Taxes...');
    const gst18 = await Tax.create({
      name: 'GST 18%',
      rate: 18,
      type: 'EXCLUSIVE',
      status: 'ACTIVE',
    });

    const gst12 = await Tax.create({
      name: 'GST 12%',
      rate: 12,
      type: 'EXCLUSIVE',
      status: 'ACTIVE',
    });

    // 6. Discounts
    console.log('🎟️ Creating Discounts...');
    const annualDiscount = await Discount.create({
      name: '10% Annual Discount',
      type: 'PERCENTAGE',
      value: 10,
      minimumPurchase: 10000,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usedCount: 12,
      status: 'ACTIVE',
    });

    const bulkDiscount = await Discount.create({
      name: '₹500 Bulk Discount',
      type: 'FIXED_AMOUNT',
      value: 500,
      minimumQuantity: 2,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
      usedCount: 5,
      status: 'ACTIVE',
    });

    // 7. Quotations
    console.log('📑 Creating Quotations...');
    const quotation1 = await Quotation.create({
      quotationNumber: 'QUO-000001',
      customerId: customer1._id,
      templateId: basicMonthlyPlan._id,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      lines: [
        {
          productId: storageProduct._id,
          productName: storageProduct.name,
          quantity: 2,
          unitPrice: 2000,
          taxIds: [gst18._id],
          discountId: bulkDiscount._id,
          amount: 4000,
          discountAmount: 500,
          taxAmount: 630, // 18% on (4000 - 500 = 3500)
        },
      ],
      subtotal: 4000,
      discountTotal: 500,
      taxTotal: 630,
      grandTotal: 4130,
      status: 'CONFIRMED',
      createdBy: staff._id,
    });

    const quotation2 = await Quotation.create({
      quotationNumber: 'QUO-000002',
      customerId: customer2._id,
      templateId: proMonthlyPlan._id,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lines: [
        {
          productId: crmProduct._id,
          productName: crmProduct.name,
          quantity: 1,
          unitPrice: 5000,
          taxIds: [gst18._id],
          discountId: null,
          amount: 5000,
          discountAmount: 0,
          taxAmount: 900,
        },
      ],
      subtotal: 5000,
      discountTotal: 0,
      taxTotal: 900,
      grandTotal: 5900,
      status: 'DRAFT',
      createdBy: staff._id,
    });

    // 8. Subscriptions
    console.log('🔄 Creating Subscriptions...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const sub1 = await Subscription.create({
      subscriptionNumber: 'SUB-000001',
      customerId: customer1._id,
      planId: basicMonthlyPlan._id,
      quotationId: quotation1._id,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      nextBillingDate: nextMonth,
      paymentTerms: 15,
      status: 'ACTIVE',
      lines: [
        {
          productId: storageProduct._id,
          productName: storageProduct.name,
          quantity: 2,
          unitPrice: 2000,
          taxIds: [gst18._id],
          discountId: bulkDiscount._id,
          amount: 4000,
          discountAmount: 500,
          taxAmount: 630,
        },
      ],
      billingPeriod: 'MONTHLY',
    });

    const sub2 = await Subscription.create({
      subscriptionNumber: 'SUB-000002',
      customerId: customer2._id,
      planId: proMonthlyPlan._id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      paymentTerms: 15,
      status: 'ACTIVE',
      lines: [
        {
          productId: crmProduct._id,
          productName: crmProduct.name,
          quantity: 1,
          unitPrice: 5000,
          taxIds: [gst18._id],
          discountId: null,
          amount: 5000,
          discountAmount: 0,
          taxAmount: 900,
        },
      ],
      billingPeriod: 'MONTHLY',
    });

    const sub3 = await Subscription.create({
      subscriptionNumber: 'SUB-000003',
      customerId: customer3._id,
      planId: entYearlyPlan._id,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
      paymentTerms: 30,
      status: 'ACTIVE',
      lines: [
        {
          productId: pmProduct._id,
          productName: pmProduct.name,
          quantity: 1,
          unitPrice: 30000,
          taxIds: [gst18._id],
          discountId: annualDiscount._id,
          amount: 30000,
          discountAmount: 3000,
          taxAmount: 4860,
        },
      ],
      billingPeriod: 'YEARLY',
    });

    const sub4Paused = await Subscription.create({
      subscriptionNumber: 'SUB-000004',
      customerId: customer1._id,
      planId: entMonthlyPlan._id,
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      paymentTerms: 15,
      status: 'PAUSED',
      lines: [
        {
          productId: analyticsProduct._id,
          productName: analyticsProduct.name,
          quantity: 1,
          unitPrice: 8000,
          taxIds: [gst18._id],
          discountId: null,
          amount: 8000,
          discountAmount: 0,
          taxAmount: 1440,
        },
      ],
      billingPeriod: 'MONTHLY',
    });

    // 9. Invoices (Paid, Pending, Overdue)
    console.log('🧾 Creating Invoices...');
    // Paid invoice
    const invPaid = await Invoice.create({
      invoiceNumber: 'INV-000001',
      subscriptionId: sub1._id,
      customerId: customer1._id,
      issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      billingPeriod: '2026-09',
      items: [
        {
          productId: storageProduct._id,
          productName: storageProduct.name,
          quantity: 2,
          unitPrice: 2000,
          taxIds: [gst18._id],
          discountId: bulkDiscount._id,
          amount: 4000,
          discountAmount: 500,
          taxAmount: 630,
        },
      ],
      subtotal: 4000,
      discountTotal: 500,
      taxTotal: 630,
      grandTotal: 4130,
      amountPaid: 4130,
      amountDue: 0,
      status: 'PAID',
    });

    // Pending invoice (CONFIRMED, not yet due)
    const invPending = await Invoice.create({
      invoiceNumber: 'INV-000002',
      subscriptionId: sub2._id,
      customerId: customer2._id,
      issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      billingPeriod: '2026-10',
      items: [
        {
          productId: crmProduct._id,
          productName: crmProduct.name,
          quantity: 1,
          unitPrice: 5000,
          taxIds: [gst18._id],
          discountId: null,
          amount: 5000,
          discountAmount: 0,
          taxAmount: 900,
        },
      ],
      subtotal: 5000,
      discountTotal: 0,
      taxTotal: 900,
      grandTotal: 5900,
      amountPaid: 0,
      amountDue: 5900,
      status: 'CONFIRMED',
    });

    // Overdue invoice (past dueDate, amountDue > 0)
    const invOverdue = await Invoice.create({
      invoiceNumber: 'INV-000003',
      subscriptionId: sub3._id,
      customerId: customer3._id,
      issueDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      billingPeriod: '2026',
      items: [
        {
          productId: pmProduct._id,
          productName: pmProduct.name,
          quantity: 1,
          unitPrice: 30000,
          taxIds: [gst18._id],
          discountId: annualDiscount._id,
          amount: 30000,
          discountAmount: 3000,
          taxAmount: 4860,
        },
      ],
      subtotal: 30000,
      discountTotal: 3000,
      taxTotal: 4860,
      grandTotal: 31860,
      amountPaid: 10000,
      amountDue: 21860,
      status: 'OVERDUE',
    });

    // 10. Payments (UPI, Card, Bank Transfer)
    console.log('💳 Creating Payments...');
    await Payment.create({
      paymentNumber: 'PAY-000001',
      invoiceId: invPaid._id,
      customerId: customer1._id,
      amount: 4130,
      method: 'UPI',
      paymentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      note: 'UPI Payment via Google Pay (Ref: UPI/7829103)',
      status: 'SUCCESS',
    });

    await Payment.create({
      paymentNumber: 'PAY-000002',
      invoiceId: invOverdue._id,
      customerId: customer3._id,
      amount: 10000,
      method: 'BANK_TRANSFER',
      paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      note: 'NEFT Part payment (UTR: HDFC000123984)',
      status: 'SUCCESS',
    });

    // Initialize sequence counters
    await Counter.insertMany([
      { _id: 'QUO', seq: 2 },
      { _id: 'SUB', seq: 4 },
      { _id: 'INV', seq: 3 },
      { _id: 'PAY', seq: 2 },
    ]);

    console.log('\n==================================================');
    console.log('🎉 SubFlow Database Seeded Successfully!');
    console.log('==================================================');
    console.log('🔑 TEST CREDENTIALS:');
    console.log('   ADMIN:    admin@subflow.app  / Admin@12345');
    console.log('   STAFF:    staff@subflow.app  / Staff@12345');
    console.log('   CUSTOMER: acme@example.com   / Customer@12345 (Acme Innovations)');
    console.log('   CUSTOMER: nexus@example.com  / Customer@12345 (Nexus Cloud)');
    console.log('   CUSTOMER: zenith@example.com / Customer@12345 (Zenith Labs)');
    console.log('==================================================');
    console.log('📊 SEEDED RECORDS SUMMARY:');
    console.log('   • 5 Users (1 Admin, 1 Staff, 3 Customers)');
    console.log('   • 3 Customers with addresses & Tax IDs');
    console.log('   • 4 Products with multi-tier variants');
    console.log('   • 4 Plans (Daily/Weekly/Monthly/Yearly)');
    console.log('   • 2 Taxes (GST 18%, GST 12%)');
    console.log('   • 2 Discounts (Percentage & Fixed Amount)');
    console.log('   • 2 Quotations (Draft & Confirmed)');
    console.log('   • 4 Subscriptions (3 Active, 1 Paused)');
    console.log('   • 3 Invoices (Paid, Pending, Overdue)');
    console.log('   • 2 Payments (UPI, Bank Transfer)');
    console.log('==================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
