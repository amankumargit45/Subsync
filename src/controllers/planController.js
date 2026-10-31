const Plan = require('../models/Plan');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.billingFrequency) filter.billingFrequency = req.query.billingFrequency;
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [plans, total] = await Promise.all([
      Plan.find(filter)
        .populate('productId', 'name type salesPrice')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Plan.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(plans, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('productId', 'name type salesPrice')
      .lean();
    if (!plan) {
      return error(res, 404, 'NOT_FOUND', 'Plan not found.');
    }
    return success(res, plan);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    return created(res, plan);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return error(res, 404, 'NOT_FOUND', 'Plan not found.');
    }
    return success(res, plan);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return error(res, 404, 'NOT_FOUND', 'Plan not found.');
    }
    return success(res, { message: 'Plan deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
