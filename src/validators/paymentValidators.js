const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createPaymentSchema = Joi.object({
  invoiceId: objectId.required(),
  amount: Joi.number().min(0.01).required(),
  method: Joi.string().valid('UPI', 'CARD', 'BANK_TRANSFER', 'CASH', 'OTHER').required(),
  paymentDate: Joi.date().default(() => new Date()),
  note: Joi.string().max(500).allow('').default(''),
});

module.exports = { createPaymentSchema };
