const mongoose = require('mongoose');
const { DISCOUNT_TYPE, DISCOUNT_STATUS } = require('../config/constants');

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Discount name is required'],
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: [true, 'Discount type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0,
    },
    minimumQuantity: {
      type: Number,
      default: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    subscriptionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
      },
    ],
    status: {
      type: String,
      enum: Object.values(DISCOUNT_STATUS),
      default: DISCOUNT_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.index({ status: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Discount', discountSchema);
