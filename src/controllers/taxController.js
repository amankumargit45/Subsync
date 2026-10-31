const Tax = require('../models/Tax');
const { success, created, error } = require('../utils/response');
const { getPaginationOptions, buildPaginationResponse } = require('../utils/pagination');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const [taxes, total] = await Promise.all([
      Tax.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tax.countDocuments(filter),
    ]);

    return res.json(buildPaginationResponse(taxes, total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const tax = await Tax.findById(req.params.id).lean();
    if (!tax) return error(res, 404, 'NOT_FOUND', 'Tax not found.');
    return success(res, tax);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const tax = await Tax.create(req.body);
    return created(res, tax);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const tax = await Tax.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tax) return error(res, 404, 'NOT_FOUND', 'Tax not found.');
    return success(res, tax);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const tax = await Tax.findByIdAndDelete(req.params.id);
    if (!tax) return error(res, 404, 'NOT_FOUND', 'Tax not found.');
    return success(res, { message: 'Tax deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
