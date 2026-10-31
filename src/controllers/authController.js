const authService = require('../services/authService');
const Customer = require('../models/Customer');
const { success, created, error } = require('../utils/response');
const { ROLES } = require('../config/constants');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // If registering as CUSTOMER, auto-create a Customer record
    if (result.user.role === ROLES.CUSTOMER) {
      await Customer.create({
        userId: result.user._id,
        contactName: result.user.name,
        email: result.user.email,
        status: 'ACTIVE',
      });
    }

    return created(res, {
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, {
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);

    // If customer, also return customer profile
    let customer = null;
    if (user.role === ROLES.CUSTOMER) {
      customer = await Customer.findOne({ userId: user._id }).lean();
    }

    return success(res, { user, customer });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
