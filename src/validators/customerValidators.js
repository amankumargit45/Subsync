const Joi = require('joi');

const createCustomerSchema = Joi.object({
  userId: Joi.string().hex().length(24).allow(null).default(null),
  companyName: Joi.string().max(200).allow('').default(''),
  contactName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().max(20).allow('').default(''),
  address: Joi.object({
    street: Joi.string().allow('').default(''),
    city: Joi.string().allow('').default(''),
    state: Joi.string().allow('').default(''),
    postalCode: Joi.string().allow('').default(''),
    country: Joi.string().allow('').default(''),
  }).default({}),
  taxId: Joi.string().max(50).allow('').default(''),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateCustomerSchema = Joi.object({
  companyName: Joi.string().max(200).allow(''),
  contactName: Joi.string().trim().min(1).max(100),
  email: Joi.string().email().trim().lowercase(),
  phone: Joi.string().max(20).allow(''),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    postalCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }),
  taxId: Joi.string().max(50).allow(''),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
}).min(1);

module.exports = { createCustomerSchema, updateCustomerSchema };
