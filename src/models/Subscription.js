const mongoose = require('mongoose');
const { SUBSCRIPTION_STATUS, BILLING_FREQUENCY } = require('../config/constants');

const subscriptionLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, default: '' },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tax',
      },
    ],
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },
    paymentTerms: {
      type: Number,
      default: 15, // days
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.DRAFT,
    },
    lines: [subscriptionLineSchema],
    billingPeriod: {
      type: String,
      enum: Object.values(BILLING_FREQUENCY),
      default: BILLING_FREQUENCY.MONTHLY,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ customerId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ planId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
