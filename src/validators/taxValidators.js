const Joi = require('joi');

const createTaxSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  rate: Joi.number().min(0).max(100).required(),
  type: Joi.string().valid('INCLUSIVE', 'EXCLUSIVE').default('EXCLUSIVE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateTaxSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  rate: Joi.number().min(0).max(100),
  type: Joi.string().valid('INCLUSIVE', 'EXCLUSIVE'),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
}).min(1);

module.exports = { createTaxSchema, updateTaxSchema };
