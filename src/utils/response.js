/**
 * Standardized API response helpers.
 */

const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const created = (res, data) => {
  return success(res, data, 201);
};

const error = (res, statusCode, code, message, details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

module.exports = { success, created, error };
