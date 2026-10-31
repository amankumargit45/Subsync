const mongoose = require('mongoose');
const { TAX_STATUS, TAX_TYPE } = require('../config/constants');

const taxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tax name is required'],
      trim: true,
      maxlength: 100,
    },
    rate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: 0,
      max: 100,
    },
    type: {
      type: String,
      enum: Object.values(TAX_TYPE),
      default: TAX_TYPE.EXCLUSIVE,
    },
    status: {
      type: String,
      enum: Object.values(TAX_STATUS),
      default: TAX_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

taxSchema.index({ status: 1 });

module.exports = mongoose.model('Tax', taxSchema);
