const Discount = require('../models/Discount');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [discounts, total] = await Promise.all([
      Discount.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Discount.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(discounts, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const discount = await Discount.findById(req.params.id).lean();
    if (!discount) return error(res, 404, 'NOT_FOUND', 'Discount not found.');
    return success(res, discount);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const discount = await Discount.create(req.body);
    return created(res, discount);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!discount) return error(res, 404, 'NOT_FOUND', 'Discount not found.');
    return success(res, discount);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return error(res, 404, 'NOT_FOUND', 'Discount not found.');
    return success(res, { message: 'Discount deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
