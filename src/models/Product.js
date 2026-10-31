const mongoose = require('mongoose');
const { PRODUCT_TYPE, PRODUCT_STATUS } = require('../config/constants');

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    priceAdjustment: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: Object.values(PRODUCT_TYPE),
      default: PRODUCT_TYPE.SERVICE,
    },
    salesPrice: {
      type: Number,
      required: [true, 'Sales price is required'],
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    variants: [variantSchema],
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema);
