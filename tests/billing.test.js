const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const invoiceService = require('../src/services/invoiceService');
const Customer = require('../src/models/Customer');
const Product = require('../src/models/Product');
const Subscription = require('../src/models/Subscription');
const Invoice = require('../src/models/Invoice');

describe('Billing Engine & Idempotency Tests', () => {
  let testCustomer;
  let testProduct;
  let testSubscription;

  beforeAll(async () => {
    await connectDB();

    testCustomer = await Customer.create({
      contactName: 'Billing Test Customer',
      email: 'billing.test@example.com',
      status: 'ACTIVE',
    });

    testProduct = await Product.create({
      name: 'Billing Test Product',
      salesPrice: 1500,
      status: 'ACTIVE',
    });

    testSubscription = await Subscription.create({
      subscriptionNumber: 'SUB-TEST-IDEMP',
      customerId: testCustomer._id,
      status: 'ACTIVE',
      startDate: new Date(),
      billingPeriod: 'MONTHLY',
      lines: [
        {
          productId: testProduct._id,
          productName: testProduct.name,
          quantity: 1,
          unitPrice: 1500,
          amount: 1500,
        },
      ],
    });
  });

  afterAll(async () => {
    await Invoice.deleteMany({ customerId: testCustomer._id });
    await Subscription.deleteMany({ customerId: testCustomer._id });
    await Product.deleteMany({ _id: testProduct._id });
    await Customer.deleteMany({ _id: testCustomer._id });
    await mongoose.connection.close();
  });

  test('Generates invoice successfully on first billing attempt', async () => {
    const billingPeriod = '2026-11';
    const invoice1 = await invoiceService.generateFromSubscription(
      testSubscription,
      billingPeriod
    );

    expect(invoice1).toBeDefined();
    expect(invoice1.subscriptionId.toString()).toBe(testSubscription._id.toString());
    expect(invoice1.billingPeriod).toBe(billingPeriod);
    expect(invoice1.grandTotal).toBe(1500);
  });

  test('CRITICAL IDEMPOTENCY: Second billing attempt for same subscription + period is skipped and creates NO duplicate', async () => {
    const billingPeriod = '2026-11';

    // Attempt second generation
    const invoice2 = await invoiceService.generateFromSubscription(
      testSubscription,
      billingPeriod
    );

    // Should return null and not throw
    expect(invoice2).toBeNull();

    // Query database directly to confirm exactly ONE invoice exists
    const matchingInvoices = await Invoice.find({
      subscriptionId: testSubscription._id,
      billingPeriod,
    });

    expect(matchingInvoices).toHaveLength(1);
    expect(matchingInvoices[0].billingPeriod).toBe(billingPeriod);
  });
});
