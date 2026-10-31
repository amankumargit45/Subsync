const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const subscriptionService = require('../services/subscriptionService');
const pricingService = require('../services/pricingService');
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

    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId && req.user.role !== ROLES.CUSTOMER) {
      filter.customerId = req.query.customerId;
    }
    if (req.query.planId) filter.planId = req.query.planId;

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('customerId', 'contactName companyName email')
        .populate('planId', 'name billingFrequency price')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscription.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(subscriptions, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customerId', 'contactName companyName email phone address taxId')
      .populate('planId', 'name billingFrequency price productId')
      .populate('quotationId', 'quotationNumber')
      .populate('lines.productId', 'name type')
      .populate('lines.taxIds', 'name rate type')
      .populate('lines.discountId', 'name type value')
      .lean();

    if (!subscription) {
      return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    }

    // CUSTOMER scoping
    if (req.user.role === ROLES.CUSTOMER) {
      const customer = await Customer.findOne({ userId: req.user.userId }).lean();
      if (!customer || subscription.customerId._id.toString() !== customer._id.toString()) {
        return error(res, 403, 'FORBIDDEN', 'Access denied.');
      }
    }

    return success(res, subscription);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.create(req.body);
    return created(res, subscription);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    }

    if (subscription.status === 'CLOSED' || subscription.status === 'EXPIRED') {
      return error(res, 400, 'INVALID_STATUS', 'Cannot update a closed or expired subscription.');
    }

    const allowedFields = ['planId', 'startDate', 'expiryDate', 'nextBillingDate', 'paymentTerms', 'lines', 'billingPeriod'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    }

    // Recalculate if lines changed
    if (req.body.lines) {
      const pricing = await pricingService.calculateLines(req.body.lines);
      subscription.lines = pricing.processedLines;
    }

    await subscription.save();
    return success(res, subscription);
  } catch (err) {
    next(err);
  }
};

const activate = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    const result = await subscriptionService.activate(subscription);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const pause = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    const result = await subscriptionService.pause(subscription);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const resume = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    const result = await subscriptionService.resume(subscription);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const renew = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    const result = await subscriptionService.renew(subscription);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const close = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return error(res, 404, 'NOT_FOUND', 'Subscription not found.');
    const result = await subscriptionService.close(subscription);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, activate, pause, resume, renew, close };
