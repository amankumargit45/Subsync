const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const lineSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  taxIds: Joi.array().items(objectId).default([]),
  discountId: objectId.allow(null).default(null),
});

const createQuotationSchema = Joi.object({
  customerId: objectId.required(),
  templateId: objectId.allow(null).default(null),
  validUntil: Joi.date().allow(null).default(null),
  lines: Joi.array().items(lineSchema).min(1).required(),
  status: Joi.string().valid('DRAFT', 'QUOTATION').default('DRAFT'),
});

const updateQuotationSchema = Joi.object({
  customerId: objectId,
  templateId: objectId.allow(null),
  validUntil: Joi.date().allow(null),
  lines: Joi.array().items(lineSchema).min(1),
  status: Joi.string().valid('DRAFT', 'QUOTATION'),
}).min(1);

module.exports = { createQuotationSchema, updateQuotationSchema };
