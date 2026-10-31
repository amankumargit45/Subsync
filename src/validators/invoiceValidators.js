const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const invoiceItemSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  taxIds: Joi.array().items(objectId).default([]),
  discountId: objectId.allow(null).default(null),
});

const createInvoiceSchema = Joi.object({
  subscriptionId: objectId.allow(null).default(null),
  customerId: objectId.required(),
  issueDate: Joi.date().default(() => new Date()),
  dueDate: Joi.date().required(),
  billingPeriod: Joi.string().allow('').default(''),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
});

module.exports = { createInvoiceSchema };
