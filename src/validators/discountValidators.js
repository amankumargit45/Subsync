const Joi = require('joi');

const createDiscountSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT').required(),
  value: Joi.number().min(0).required(),
  minimumQuantity: Joi.number().integer().min(0).default(0),
  minimumPurchase: Joi.number().min(0).default(0),
  startDate: Joi.date().allow(null).default(null),
  endDate: Joi.date().allow(null).default(null),
  usageLimit: Joi.number().integer().min(0).default(0),
  productIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  subscriptionIds: Joi.array().items(Joi.string().hex().length(24)).default([]),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'ARCHIVED').default('ACTIVE'),
});

const updateDiscountSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  type: Joi.string().valid('PERCENTAGE', 'FIXED_AMOUNT'),
  value: Joi.number().min(0),
  minimumQuantity: Joi.number().integer().min(0),
  minimumPurchase: Joi.number().min(0),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  usageLimit: Joi.number().integer().min(0),
  productIds: Joi.array().items(Joi.string().hex().length(24)),
  subscriptionIds: Joi.array().items(Joi.string().hex().length(24)),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'ARCHIVED'),
}).min(1);

module.exports = { createDiscountSchema, updateDiscountSchema };
