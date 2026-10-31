const analyticsService = require('../services/analyticsService');
const { success } = require('../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getSummary();
    return success(res, summary);
  } catch (err) {
    next(err);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const revenue = await analyticsService.getRevenue(startDate, endDate);
    return success(res, revenue);
  } catch (err) {
    next(err);
  }
};

const getSubscriptions = async (req, res, next) => {
  try {
    const stats = await analyticsService.getSubscriptionStats();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const stats = await analyticsService.getInvoiceStats();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getPaymentStats(startDate, endDate);
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getRevenue, getSubscriptions, getInvoices, getPayments };
