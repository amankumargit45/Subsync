const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { error } = require('../utils/response');

/**
 * Verifies JWT and attaches user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 401, 'UNAUTHORIZED', 'Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return error(res, 401, 'UNAUTHORIZED', 'User not found or deactivated.');
    }
    if (!user.isActive) {
      return error(res, 401, 'UNAUTHORIZED', 'Account is deactivated.');
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 401, 'INVALID_TOKEN', 'Invalid authentication token.');
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 401, 'TOKEN_EXPIRED', 'Authentication token has expired.');
    }
    next(err);
  }
};

module.exports = { authenticate };
