const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const lineSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  taxIds: Joi.array().items(objectId).default([]),
  discountId: objectId.allow(null).default(null),
});

const createSubscriptionSchema = Joi.object({
  customerId: objectId.required(),
  planId: objectId.allow(null).default(null),
  quotationId: objectId.allow(null).default(null),
  startDate: Joi.date().default(() => new Date()),
  expiryDate: Joi.date().allow(null).default(null),
  nextBillingDate: Joi.date().allow(null).default(null),
  paymentTerms: Joi.number().integer().min(1).default(15),
  lines: Joi.array().items(lineSchema).min(1).required(),
  billingPeriod: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY').default('MONTHLY'),
  status: Joi.string().valid('DRAFT', 'CONFIRMED').default('DRAFT'),
});

const updateSubscriptionSchema = Joi.object({
  planId: objectId.allow(null),
  startDate: Joi.date(),
  expiryDate: Joi.date().allow(null),
  nextBillingDate: Joi.date().allow(null),
  paymentTerms: Joi.number().integer().min(1),
  lines: Joi.array().items(lineSchema).min(1),
  billingPeriod: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
}).min(1);

module.exports = { createSubscriptionSchema, updateSubscriptionSchema };
