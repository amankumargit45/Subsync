const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  type: Joi.string().valid('SERVICE', 'CONSUMABLE').default('SERVICE'),
  salesPrice: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0).default(0),
  notes: Joi.string().max(2000).allow('').default(''),
  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        value: Joi.string().trim().required(),
        priceAdjustment: Joi.number().default(0),
      })
    )
    .default([]),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED').default('ACTIVE'),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  type: Joi.string().valid('SERVICE', 'CONSUMABLE'),
  salesPrice: Joi.number().min(0),
  costPrice: Joi.number().min(0),
  notes: Joi.string().max(2000).allow(''),
  variants: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required(),
      value: Joi.string().trim().required(),
      priceAdjustment: Joi.number().default(0),
    })
  ),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED'),
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
