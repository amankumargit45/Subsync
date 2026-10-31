const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const pricingService = require('./pricingService');
const { generateNumber } = require('../utils/generateNumber');
const { INVOICE_STATUS } = require('../config/constants');

class InvoiceService {
  /**
   * Create an invoice manually.
   */
  async create(data) {
    const pricing = await pricingService.calculateLines(data.items);
    const invoiceNumber = await generateNumber('INV');

    const amountDue = pricing.grandTotal;

    const invoice = await Invoice.create({
      invoiceNumber,
      subscriptionId: data.subscriptionId || null,
      customerId: data.customerId,
      issueDate: data.issueDate || new Date(),
      dueDate: data.dueDate,
      billingPeriod: data.billingPeriod || '',
      items: pricing.processedLines,
      subtotal: pricing.subtotal,
      discountTotal: pricing.discountTotal,
      taxTotal: pricing.taxTotal,
      grandTotal: pricing.grandTotal,
      amountPaid: 0,
      amountDue,
      status: INVOICE_STATUS.DRAFT,
    });

    return invoice;
  }

  /**
   * Generate an invoice from a subscription (called by billing engine).
   * Uses the subscription's snapshotted line items.
   */
  async generateFromSubscription(subscription, billingPeriod) {
    // Check for existing invoice (database-level idempotency)
    const existing = await Invoice.findOne({
      subscriptionId: subscription._id,
      billingPeriod,
    }).lean();

    if (existing) {
      console.log(`⚠️  Invoice already exists for ${subscription.subscriptionNumber} period ${billingPeriod}. Skipping.`);
      return null;
    }

    // Use pricing engine for calculation
    const pricing = await pricingService.calculateLines(subscription.lines, {
      subscriptionId: subscription._id,
    });

    const invoiceNumber = await generateNumber('INV');

    const customer = await Customer.findById(subscription.customerId).lean();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (subscription.paymentTerms || 15));

    try {
      const invoice = await Invoice.create({
        invoiceNumber,
        subscriptionId: subscription._id,
        customerId: subscription.customerId,
        issueDate: new Date(),
        dueDate,
        billingPeriod,
        items: pricing.processedLines,
        subtotal: pricing.subtotal,
        discountTotal: pricing.discountTotal,
        taxTotal: pricing.taxTotal,
        grandTotal: pricing.grandTotal,
        amountPaid: 0,
        amountDue: pricing.grandTotal,
        status: INVOICE_STATUS.CONFIRMED,
      });

      // Try to send email notification
      try {
        if (customer) {
          const emailService = require('./emailService');
          await emailService.sendInvoiceNotification(
            customer.email,
            customer.contactName,
            invoiceNumber,
            pricing.grandTotal,
            dueDate
          );
        }
      } catch (emailErr) {
        console.log(`📧 Email notification skipped for ${invoiceNumber}`);
      }

      return invoice;
    } catch (err) {
      // Handle duplicate key error (idempotency at DB level)
      if (err.code === 11000) {
        console.log(`⚠️  Duplicate invoice prevented for ${subscription.subscriptionNumber} period ${billingPeriod}`);
        return null;
      }
      throw err;
    }
  }
}

module.exports = new InvoiceService();
