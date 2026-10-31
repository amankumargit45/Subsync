const Quotation = require('../models/Quotation');
const quotationService = require('../services/quotationService');
const subscriptionService = require('../services/subscriptionService');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');
const { ROLES } = require('../config/constants');
const Customer = require('../models/Customer');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    // CUSTOMER can only see their own quotations
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer) return error(res, 404, 'NOT_FOUND', 'Customer profile not found.');
      filter.customerId = customer._id;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId && req.user.role !== ROLES.CUSTOMER) {
      filter.customerId = req.query.customerId;
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .populate('customerId', 'contactName companyName email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(quotations, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customerId', 'contactName companyName email phone address taxId')
      .populate('lines.productId', 'name type')
      .populate('lines.taxIds', 'name rate type')
      .populate('lines.discountId', 'name type value')
      .lean();

    if (!quotation) {
      return error(res, 404, 'NOT_FOUND', 'Quotation not found.');
    }

    // CUSTOMER can only view their own
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer || quotation.customerId._id.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Access denied.');
      }
    }

    return success(res, quotation);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const quotation = await quotationService.create(req.body, req.user.userId);
    return created(res, quotation);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return error(res, 404, 'NOT_FOUND', 'Quotation not found.');
    }

    if (quotation.status !== 'DRAFT' && quotation.status !== 'QUOTATION') {
      return error(res, 400, 'INVALID_STATUS', 'Only DRAFT or QUOTATION status quotations can be updated.');
    }

    // Update fields
    if (req.body.customerId) quotation.customerId = req.body.customerId;
    if (req.body.templateId !== undefined) quotation.templateId = req.body.templateId;
    if (req.body.validUntil !== undefined) quotation.validUntil = req.body.validUntil;
    if (req.body.lines) {
      quotation.lines = req.body.lines;
      // Recalculate pricing
      const recalculated = await quotationService.recalculate(quotation);
      Object.assign(quotation, {
        lines: recalculated.lines,
        subtotal: recalculated.subtotal,
        discountTotal: recalculated.discountTotal,
        taxTotal: recalculated.taxTotal,
        grandTotal: recalculated.grandTotal,
      });
    }
    if (req.body.status) quotation.status = req.body.status;

    await quotation.save();
    return success(res, quotation);
  } catch (err) {
    next(err);
  }
};

const confirm = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return error(res, 404, 'NOT_FOUND', 'Quotation not found.');
    }

    const confirmed = await quotationService.confirm(quotation);
    return success(res, confirmed);
  } catch (err) {
    next(err);
  }
};

const convertToSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.createFromQuotation(req.params.id);
    return created(res, subscription);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, confirm, convertToSubscription };
