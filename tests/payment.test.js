const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const paymentService = require('../src/services/paymentService');
const Customer = require('../src/models/Customer');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');

describe('Payment Engine & Consistency Tests', () => {
  let testCustomer;
  let testInvoice;

  beforeAll(async () => {
    await connectDB();

    testCustomer = await Customer.create({
      contactName: 'Payment Test Customer',
      email: 'payment.test@example.com',
      status: 'ACTIVE',
    });

    testInvoice = await Invoice.create({
      invoiceNumber: 'INV-TEST-PAY',
      customerId: testCustomer._id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      grandTotal: 5000,
      amountPaid: 0,
      amountDue: 5000,
      status: 'CONFIRMED',
    });
  });

  afterAll(async () => {
    await Payment.deleteMany({ customerId: testCustomer._id });
    await Invoice.deleteMany({ customerId: testCustomer._id });
    await Customer.deleteMany({ _id: testCustomer._id });
    await mongoose.connection.close();
  });

  test('Rejects overpayment when amount exceeds amountDue', async () => {
    await expect(
      paymentService.create({
        invoiceId: testInvoice._id,
        amount: 6000, // Exceeds 5000
        method: 'UPI',
      })
    ).rejects.toThrow(/exceeds outstanding balance/);
  });

  test('Processes partial payment and updates amountPaid and amountDue', async () => {
    const payment = await paymentService.create({
      invoiceId: testInvoice._id,
      amount: 2000,
      method: 'CARD',
    });

    expect(payment).toBeDefined();
    expect(payment.amount).toBe(2000);

    const updatedInvoice = await Invoice.findById(testInvoice._id);
    expect(updatedInvoice.amountPaid).toBe(2000);
    expect(updatedInvoice.amountDue).toBe(3000);
    expect(updatedInvoice.status).toBe('CONFIRMED');
  });

  test('Processes remaining balance and transitions invoice to PAID', async () => {
    const payment = await paymentService.create({
      invoiceId: testInvoice._id,
      amount: 3000, // Remaining balance
      method: 'UPI',
    });

    expect(payment).toBeDefined();

    const updatedInvoice = await Invoice.findById(testInvoice._id);
    expect(updatedInvoice.amountPaid).toBe(5000);
    expect(updatedInvoice.amountDue).toBe(0);
    expect(updatedInvoice.status).toBe('PAID');
  });

  test('Rejects payment on already PAID invoice', async () => {
    await expect(
      paymentService.create({
        invoiceId: testInvoice._id,
        amount: 100,
        method: 'CASH',
      })
    ).rejects.toThrow('Invoice is already fully paid.');
  });
});
