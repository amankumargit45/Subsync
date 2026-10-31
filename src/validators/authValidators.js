const Joi = require('joi');
const { PASSWORD_REGEX } = require('../config/constants');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string()
    .min(8)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters with uppercase, lowercase, and a special character.',
    }),
  role: Joi.string().valid('ADMIN', 'STAFF', 'CUSTOMER').default('CUSTOMER'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .pattern(PASSWORD_REGEX)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters with uppercase, lowercase, and a special character.',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
