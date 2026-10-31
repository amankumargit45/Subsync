const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createPlanSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  productId: objectId.required(),
  price: Joi.number().min(0).required(),
  billingFrequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY').required(),
  minimumQuantity: Joi.number().integer().min(1).default(1),
  availableFrom: Joi.date().allow(null).default(null),
  availableUntil: Joi.date().allow(null).default(null),
  lifecycleRules: Joi.object({
    autoClose: Joi.boolean().default(false),
    allowPause: Joi.boolean().default(true),
    allowEarlyClose: Joi.boolean().default(true),
    allowRenewal: Joi.boolean().default(true),
  }).default(),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED').default('ACTIVE'),
});

const updatePlanSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  productId: objectId,
  price: Joi.number().min(0),
  billingFrequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
  minimumQuantity: Joi.number().integer().min(1),
  availableFrom: Joi.date().allow(null),
  availableUntil: Joi.date().allow(null),
  lifecycleRules: Joi.object({
    autoClose: Joi.boolean(),
    allowPause: Joi.boolean(),
    allowEarlyClose: Joi.boolean(),
    allowRenewal: Joi.boolean(),
  }),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED'),
}).min(1);

module.exports = { createPlanSchema, updatePlanSchema };
