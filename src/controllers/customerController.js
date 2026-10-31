const Customer = require('../models/Customer');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');
const { ROLES } = require('../config/constants');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    // CUSTOMER can only see their own record
    if (req.user.role === ROLES.CUSTOMER) {
      filter.userId = req.user.userId;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { contactName: searchRegex },
        { companyName: searchRegex },
        { email: searchRegex },
      ];
    }

    // Sort
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(customers, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === ROLES.CUSTOMER) {
      filter.userId = req.user.userId;
    }

    const customer = await Customer.findOne(filter).lean();
    if (!customer) {
      return error(res, 404, 'NOT_FOUND', 'Customer not found.');
    }
    return success(res, customer);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    return created(res, customer);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === ROLES.CUSTOMER) {
      filter.userId = req.user.userId;
    }

    const customer = await Customer.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return error(res, 404, 'NOT_FOUND', 'Customer not found.');
    }
    return success(res, customer);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return error(res, 404, 'NOT_FOUND', 'Customer not found.');
    }
    return success(res, { message: 'Customer deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
