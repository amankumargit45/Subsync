const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints.
 * 20 requests per 15-minute window.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
  },
});

/**
 * General API rate limiter.
 * 200 requests per minute.
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
  },
});

module.exports = { authRateLimiter, apiRateLimiter };
