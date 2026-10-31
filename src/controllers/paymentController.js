const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const paymentService = require('../services/paymentService');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');
const { ROLES } = require('../config/constants');

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

    if (req.query.invoiceId) filter.invoiceId = req.query.invoiceId;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.customerId && req.user.role !== ROLES.CUSTOMER) {
      filter.customerId = req.query.customerId;
    }
    if (req.query.status) filter.status = req.query.status;

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('invoiceId', 'invoiceNumber grandTotal amountDue status')
        .populate('customerId', 'contactName companyName email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(payments, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber grandTotal amountDue status')
      .populate('customerId', 'contactName companyName email')
      .lean();

    if (!payment) {
      return error(res, 404, 'NOT_FOUND', 'Payment not found.');
    }

    // CUSTOMER scoping
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer || payment.customerId._id.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Access denied.');
      }
    }

    return success(res, payment);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // If CUSTOMER, verify invoice belongs to customer
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer) return error(res, 404, 'NOT_FOUND', 'Customer profile not found.');
      const Invoice = require('../models/Invoice');
      const invoice = await Invoice.findById(req.body.invoiceId).lean();
      if (!invoice) return error(res, 404, 'NOT_FOUND', 'Invoice not found.');
      if (invoice.customerId.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Cannot pay an invoice that does not belong to you.');
      }
    }

    const payment = await paymentService.create(req.body, req.user.userId);
    return created(res, payment);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create };
