const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { generateNumber } = require('../utils/generateNumber');
const { INVOICE_STATUS, PAYMENT_STATUS } = require('../config/constants');

class PaymentService {
  /**
   * Create a payment and update the associated invoice atomically.
   */
  async create(data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findById(data.invoiceId).session(session);
      if (!invoice) {
        throw this._error('Invoice not found.', 404, 'NOT_FOUND');
      }

      if (invoice.status === INVOICE_STATUS.CANCELLED) {
        throw this._error('Cannot make payment on a cancelled invoice.', 400, 'INVALID_STATUS');
      }

      if (invoice.status === INVOICE_STATUS.PAID) {
        throw this._error('Invoice is already fully paid.', 400, 'ALREADY_PAID');
      }

      // Prevent overpayment
      const maxPayable = Math.round(invoice.amountDue * 100) / 100;
      if (data.amount > maxPayable + 0.01) {
        throw this._error(
          `Payment amount ₹${data.amount} exceeds outstanding balance ₹${maxPayable}.`,
          400,
          'OVERPAYMENT'
        );
      }

      const paymentNumber = await generateNumber('PAY');

      // Determine customer from invoice (never trust frontend)
      const customerId = invoice.customerId;

      const [payment] = await Payment.create(
        [
          {
            paymentNumber,
            invoiceId: invoice._id,
            customerId,
            amount: data.amount,
            method: data.method,
            paymentDate: data.paymentDate || new Date(),
            note: data.note || '',
            status: PAYMENT_STATUS.SUCCESS,
          },
        ],
        { session }
      );

      // Update invoice
      invoice.amountPaid = Math.round((invoice.amountPaid + data.amount) * 100) / 100;
      invoice.amountDue = Math.round((invoice.grandTotal - invoice.amountPaid) * 100) / 100;

      if (invoice.amountDue <= 0.01) {
        invoice.amountDue = 0;
        invoice.status = INVOICE_STATUS.PAID;
      }

      await invoice.save({ session });

      await session.commitTransaction();

      // Send payment confirmation email (non-transactional, best-effort)
      try {
        const customer = await Customer.findById(customerId).lean();
        if (customer) {
          const emailService = require('./emailService');
          await emailService.sendPaymentConfirmation(
            customer.email,
            customer.contactName,
            paymentNumber,
            data.amount,
            invoice.invoiceNumber
          );
        }
      } catch (emailErr) {
        console.log(`📧 Payment confirmation email skipped for ${paymentNumber}`);
      }

      return payment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  _error(message, statusCode, code) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.code = code;
    return err;
  }
}

module.exports = new PaymentService();
