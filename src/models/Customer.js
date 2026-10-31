const mongoose = require('mongoose');
const { CUSTOMER_STATUS } = require('../config/constants');

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    taxId: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(CUSTOMER_STATUS),
      default: CUSTOMER_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
customerSchema.index({ email: 1 });
customerSchema.index({ companyName: 1 });
customerSchema.index({ userId: 1 });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
