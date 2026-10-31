const { error } = require('../utils/response');

/**
 * Role-based access control middleware.
 * Usage: authorize('ADMIN', 'STAFF')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 401, 'UNAUTHORIZED', 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { authorize };
