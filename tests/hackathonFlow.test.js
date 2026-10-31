const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const billingService = require('../src/services/billingService');
const Subscription = require('../src/models/Subscription');
const Tax = require('../src/models/Tax');

describe('Final Hackathon Demo Flow (End-to-End)', () => {
  let adminToken;
  let staffToken;
  let productId;
  let planId;
  let discountId;
  let taxId;
  let customerId;
  let quotationId;
  let subscriptionId;
  let generatedInvoice;

  beforeAll(async () => {
    await connectDB();
    const existingTax = await Tax.findOne({ name: 'GST 18%' });
    taxId = existingTax ? existingTax._id.toString() : null;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Step 1: ADMIN LOGIN', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@subflow.app',
        password: 'Admin@12345',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    adminToken = res.body.data.token;
    expect(adminToken).toBeDefined();

    // Also get staff token for later steps
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'staff@subflow.app',
        password: 'Staff@12345',
      });
    staffToken = staffRes.body.data.token;
  });

  test('Step 2: CREATE PRODUCT (Admin)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'AI Analytics Suite',
        type: 'SERVICE',
        salesPrice: 10000,
        costPrice: 2500,
        notes: 'Predictive churn and automated cohort analytics',
        variants: [
          { name: 'API Quota', value: '1M calls', priceAdjustment: 0 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    productId = res.body.data._id;
  });

  test('Step 3: CREATE PLAN (Admin)', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'AI Suite Pro',
        productId,
        price: 10000,
        billingFrequency: 'MONTHLY',
        minimumQuantity: 1,
        lifecycleRules: {
          autoClose: false,
          allowPause: true,
          allowEarlyClose: true,
          allowRenewal: true,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    planId = res.body.data._id;
  });

  test('Step 4: CREATE DISCOUNT (Admin)', async () => {
    const res = await request(app)
      .post('/api/discounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Hackathon VIP Discount',
        type: 'PERCENTAGE',
        value: 15,
        minimumPurchase: 5000,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    discountId = res.body.data._id;
  });

  test('Step 5: STAFF CREATES CUSTOMER', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        contactName: 'Rohan Sharma',
        companyName: 'Fintech Spark Pvt Ltd',
        email: 'rohan@fintechspark.com',
        phone: '+91 99887 76655',
        taxId: '27AABCF1234F1Z6',
        address: {
          street: 'BKC Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400051',
          country: 'India',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    customerId = res.body.data._id;
  });

  test('Step 6: CREATE QUOTATION', async () => {
    const res = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        customerId,
        templateId: planId,
        lines: [
          {
            productId,
            quantity: 1,
            unitPrice: 10000,
            taxIds: taxId ? [taxId] : [],
            discountId,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    quotationId = res.body.data._id;

    // Verify pricing engine calculation:
    // Subtotal: 10,000
    // Discount: 15% of 10,000 = 1,500
    // Taxable: 8,500
    // Tax 18%: 1,530
    // Grand Total: 10,030
    expect(res.body.data.subtotal).toBe(10000);
    expect(res.body.data.discountTotal).toBe(1500);
    expect(res.body.data.taxTotal).toBe(1530);
    expect(res.body.data.grandTotal).toBe(10030);
  });

  test('Step 7: CONFIRM QUOTATION', async () => {
    const res = await request(app)
      .post(`/api/quotations/${quotationId}/confirm`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  test('Step 8: CONVERT TO SUBSCRIPTION', async () => {
    const res = await request(app)
      .post(`/api/quotations/${quotationId}/convert-to-subscription`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    subscriptionId = res.body.data._id;
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.lines).toHaveLength(1);
    expect(res.body.data.quotationId.toString()).toBe(quotationId);
  });

  test('Step 9: ACTIVATE SUBSCRIPTION', async () => {
    const res = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/activate`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.nextBillingDate).toBeDefined();
  });

  test('Step 10, 11, 12: BILLING JOB DETECTS DUE SUBSCRIPTION & GENERATES INVOICE (Tax + Discount applied)', async () => {
    // Set subscription nextBillingDate to past so billing job detects it as due
    await Subscription.findByIdAndUpdate(subscriptionId, {
      nextBillingDate: new Date(Date.now() - 1000), // Due now
    });

    const billingResult = await billingService.processDueSubscriptions();
    expect(billingResult.invoicesCreated).toBeGreaterThanOrEqual(1);

    // Fetch the newly generated invoice
    const invRes = await request(app)
      .get(`/api/invoices?subscriptionId=${subscriptionId}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(invRes.status).toBe(200);
    expect(invRes.body.data).toHaveLength(1);

    generatedInvoice = invRes.body.data[0];
    expect(generatedInvoice.grandTotal).toBe(10030);
    expect(generatedInvoice.discountTotal).toBe(1500);
    expect(generatedInvoice.taxTotal).toBe(1530);
    expect(generatedInvoice.amountDue).toBe(10030);
    expect(generatedInvoice.status).toBe('CONFIRMED');
  });

  test('Step 13 & 14: STAFF RECORDS PAYMENT & INVOICE BECOMES PAID', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        invoiceId: generatedInvoice._id,
        amount: 10030,
        method: 'UPI',
        note: 'UPI Payment via PhonePe (Ref: UTR9988112)',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify invoice status updated to PAID and amountDue is 0
    const invCheck = await request(app)
      .get(`/api/invoices/${generatedInvoice._id}`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(invCheck.status).toBe(200);
    expect(invCheck.body.data.amountPaid).toBe(10030);
    expect(invCheck.body.data.amountDue).toBe(0);
    expect(invCheck.body.data.status).toBe('PAID');
  });

  test('Step 15: DASHBOARD REVENUE UPDATES', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.collectedRevenue).toBeGreaterThanOrEqual(10030);
    expect(res.body.data.activeSubscriptions).toBeGreaterThanOrEqual(1);
  });
});
