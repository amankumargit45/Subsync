const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const invoiceService = require('../services/invoiceService');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');
const { ROLES, INVOICE_STATUS } = require('../config/constants');
const PDFDocument = require('pdfkit');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    // CUSTOMER scoping
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer) return error(res, 404, 'NOT_FOUND', 'Customer profile not found.');
      filter.customerId = customer._id;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId && req.user.role !== ROLES.CUSTOMER) {
      filter.customerId = req.query.customerId;
    }
    if (req.query.subscriptionId) filter.subscriptionId = req.query.subscriptionId;

    // Overdue filter (derived, not stored)
    if (req.query.status === 'OVERDUE') {
      filter.status = { $in: ['CONFIRMED', 'OVERDUE'] };
      filter.dueDate = { $lt: new Date() };
      filter.amountDue = { $gt: 0 };
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('customerId', 'contactName companyName email')
        .populate('subscriptionId', 'subscriptionNumber')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(invoices, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'contactName companyName email phone address taxId')
      .populate('subscriptionId', 'subscriptionNumber planId')
      .populate('items.productId', 'name type')
      .populate('items.taxIds', 'name rate type')
      .populate('items.discountId', 'name type value')
      .lean();

    if (!invoice) {
      return error(res, 404, 'NOT_FOUND', 'Invoice not found.');
    }

    // CUSTOMER scoping
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer || invoice.customerId._id.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Access denied.');
      }
    }

    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const invoice = await invoiceService.create(req.body);
    return created(res, invoice);
  } catch (err) {
    next(err);
  }
};

const confirmInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return error(res, 404, 'NOT_FOUND', 'Invoice not found.');

    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      return error(res, 400, 'INVALID_STATUS', 'Only DRAFT invoices can be confirmed.');
    }

    invoice.status = INVOICE_STATUS.CONFIRMED;
    await invoice.save();
    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

const cancelInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return error(res, 404, 'NOT_FOUND', 'Invoice not found.');

    if (invoice.status === INVOICE_STATUS.PAID) {
      return error(res, 400, 'INVALID_STATUS', 'Cannot cancel a paid invoice.');
    }

    invoice.status = INVOICE_STATUS.CANCELLED;
    await invoice.save();
    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

const sendInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'contactName email')
      .lean();

    if (!invoice) return error(res, 404, 'NOT_FOUND', 'Invoice not found.');

    try {
      const emailService = require('../services/emailService');
      await emailService.sendInvoiceNotification(
        invoice.customerId.email,
        invoice.customerId.contactName,
        invoice.invoiceNumber,
        invoice.grandTotal,
        invoice.dueDate
      );
    } catch (emailErr) {
      console.log(`📧 Invoice email send skipped for ${invoice.invoiceNumber}`);
    }

    return success(res, { message: 'Invoice notification sent.' });
  } catch (err) {
    next(err);
  }
};

const generatePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'contactName companyName email phone address taxId')
      .populate('items.productId', 'name type')
      .populate('items.taxIds', 'name rate')
      .populate('items.discountId', 'name type value')
      .lean();

    if (!invoice) return error(res, 404, 'NOT_FOUND', 'Invoice not found.');

    // CUSTOMER scoping
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer || invoice.customerId._id.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Access denied.');
      }
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('SubFlow', 50, 50);
    doc.fontSize(10).font('Helvetica').text('Unified Subscription & Billing Platform', 50, 78);
    doc.moveDown(2);

    // Invoice details
    doc.fontSize(18).font('Helvetica-Bold').text(`INVOICE`, 50, 120);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 50, 148);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 163);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 178);
    doc.text(`Billing Period: ${invoice.billingPeriod || 'N/A'}`, 50, 193);
    doc.text(`Status: ${invoice.status}`, 50, 208);

    // Customer details
    const customer = invoice.customerId;
    doc.font('Helvetica-Bold').text('Bill To:', 350, 120);
    doc.font('Helvetica');
    doc.text(customer.companyName || customer.contactName, 350, 138);
    doc.text(customer.contactName, 350, 153);
    doc.text(customer.email, 350, 168);
    if (customer.phone) doc.text(customer.phone, 350, 183);
    if (customer.taxId) doc.text(`Tax ID: ${customer.taxId}`, 350, 198);

    // Items table
    const tableTop = 250;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 250, tableTop);
    doc.text('Unit Price', 300, tableTop);
    doc.text('Discount', 380, tableTop);
    doc.text('Tax', 440, tableTop);
    doc.text('Amount', 490, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    for (const item of invoice.items) {
      const name = item.productName || (item.productId && item.productId.name) || 'Item';
      const lineTotal = Math.round(((item.amount || 0) - (item.discountAmount || 0) + (item.taxAmount || 0)) * 100) / 100;

      doc.text(name, 50, y, { width: 190 });
      doc.text(String(item.quantity), 250, y);
      doc.text(`₹${item.unitPrice.toFixed(2)}`, 300, y);
      doc.text(`₹${(item.discountAmount || 0).toFixed(2)}`, 380, y);
      doc.text(`₹${(item.taxAmount || 0).toFixed(2)}`, 440, y);
      doc.text(`₹${lineTotal.toFixed(2)}`, 490, y);
      y += 20;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    // Totals
    y += 10;
    doc.moveTo(350, y).lineTo(560, y).stroke();
    y += 10;

    doc.font('Helvetica').fontSize(10);
    doc.text('Subtotal:', 380, y);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, 490, y);
    y += 18;

    doc.text('Discount:', 380, y);
    doc.text(`-₹${invoice.discountTotal.toFixed(2)}`, 490, y);
    y += 18;

    doc.text('Tax:', 380, y);
    doc.text(`₹${invoice.taxTotal.toFixed(2)}`, 490, y);
    y += 18;

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Grand Total:', 380, y);
    doc.text(`₹${invoice.grandTotal.toFixed(2)}`, 490, y);
    y += 25;

    doc.font('Helvetica').fontSize(10);
    doc.text(`Amount Paid: ₹${invoice.amountPaid.toFixed(2)}`, 380, y);
    y += 15;
    doc.text(`Amount Due: ₹${invoice.amountDue.toFixed(2)}`, 380, y);

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#999');
    doc.text(
      'Generated by SubFlow - Unified Subscription & Billing Platform',
      50,
      750,
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, confirmInvoice, cancelInvoice, sendInvoice, generatePdf };
