const mongoose = require('mongoose');
const { BILLING_FREQUENCY, PLAN_STATUS } = require('../config/constants');

const lifecycleRulesSchema = new mongoose.Schema(
  {
    autoClose: { type: Boolean, default: false },
    allowPause: { type: Boolean, default: true },
    allowEarlyClose: { type: Boolean, default: true },
    allowRenewal: { type: Boolean, default: true },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: 200,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    billingFrequency: {
      type: String,
      enum: Object.values(BILLING_FREQUENCY),
      required: [true, 'Billing frequency is required'],
    },
    minimumQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    availableFrom: {
      type: Date,
      default: null,
    },
    availableUntil: {
      type: Date,
      default: null,
    },
    lifecycleRules: {
      type: lifecycleRulesSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: Object.values(PLAN_STATUS),
      default: PLAN_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
planSchema.index({ productId: 1 });
planSchema.index({ status: 1 });
planSchema.index({ billingFrequency: 1 });

module.exports = mongoose.model('Plan', planSchema);
