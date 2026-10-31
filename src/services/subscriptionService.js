const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Quotation = require('../models/Quotation');
const Plan = require('../models/Plan');
const { generateNumber } = require('../utils/generateNumber');
const pricingService = require('./pricingService');
const {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_TRANSITIONS,
  QUOTATION_STATUS,
  BILLING_FREQUENCY,
} = require('../config/constants');

class SubscriptionService {
  /**
   * Create a subscription manually.
   */
  async create(data) {
    const pricing = await pricingService.calculateLines(data.lines, {
      subscriptionId: null,
    });

    const subscriptionNumber = await generateNumber('SUB');

    // If plan is provided, inherit billing frequency
    let billingPeriod = data.billingPeriod || BILLING_FREQUENCY.MONTHLY;
    if (data.planId) {
      const plan = await Plan.findById(data.planId).lean();
      if (plan) {
        billingPeriod = plan.billingFrequency;
      }
    }

    const startDate = data.startDate || new Date();
    const nextBillingDate = data.nextBillingDate || this._calculateNextBillingDate(startDate, billingPeriod);

    const subscription = await Subscription.create({
      subscriptionNumber,
      customerId: data.customerId,
      planId: data.planId,
      quotationId: data.quotationId || null,
      startDate,
      expiryDate: data.expiryDate || null,
      nextBillingDate,
      paymentTerms: data.paymentTerms || 15,
      status: data.status || SUBSCRIPTION_STATUS.DRAFT,
      lines: pricing.processedLines,
      billingPeriod,
    });

    return subscription;
  }

  /**
   * Convert a confirmed quotation to a subscription (atomic).
   */
  async createFromQuotation(quotationId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const quotation = await Quotation.findById(quotationId).session(session);
      if (!quotation) {
        throw this._error('Quotation not found.', 404, 'NOT_FOUND');
      }

      if (quotation.status !== QUOTATION_STATUS.CONFIRMED) {
        throw this._error(
          'Only confirmed quotations can be converted to subscriptions.',
          400,
          'INVALID_STATUS'
        );
      }

      // Determine billing period from template plan
      let billingPeriod = BILLING_FREQUENCY.MONTHLY;
      if (quotation.templateId) {
        const plan = await Plan.findById(quotation.templateId).lean();
        if (plan) billingPeriod = plan.billingFrequency;
      }

      const subscriptionNumber = await generateNumber('SUB');
      const startDate = new Date();
      const nextBillingDate = this._calculateNextBillingDate(startDate, billingPeriod);

      // Snapshot pricing from quotation — do NOT recalculate
      const subscription = await Subscription.create(
        [
          {
            subscriptionNumber,
            customerId: quotation.customerId,
            planId: quotation.templateId,
            quotationId: quotation._id,
            startDate,
            nextBillingDate,
            paymentTerms: 15,
            status: SUBSCRIPTION_STATUS.CONFIRMED,
            lines: quotation.lines, // preserve pricing snapshot
            billingPeriod,
          },
        ],
        { session }
      );

      // Mark quotation as used (keep CONFIRMED status)
      quotation.status = QUOTATION_STATUS.CONFIRMED;
      await quotation.save({ session });

      await session.commitTransaction();
      return subscription[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Validate and execute a lifecycle transition.
   */
  validateTransition(currentStatus, targetStatus) {
    const allowed = SUBSCRIPTION_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw this._error(
        `Cannot transition from ${currentStatus} to ${targetStatus}.`,
        400,
        'INVALID_TRANSITION'
      );
    }
  }

  /**
   * Activate a subscription.
   */
  async activate(subscription) {
    this.validateTransition(subscription.status, SUBSCRIPTION_STATUS.ACTIVE);

    subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
    if (!subscription.nextBillingDate) {
      subscription.nextBillingDate = this._calculateNextBillingDate(
        subscription.startDate || new Date(),
        subscription.billingPeriod
      );
    }
    await subscription.save();
    return subscription;
  }

  /**
   * Pause a subscription.
   */
  async pause(subscription) {
    this.validateTransition(subscription.status, SUBSCRIPTION_STATUS.PAUSED);
    subscription.status = SUBSCRIPTION_STATUS.PAUSED;
    await subscription.save();
    return subscription;
  }

  /**
   * Resume a paused subscription.
   */
  async resume(subscription) {
    this.validateTransition(subscription.status, SUBSCRIPTION_STATUS.ACTIVE);
    subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
    await subscription.save();
    return subscription;
  }

  /**
   * Renew an expired subscription.
   */
  async renew(subscription) {
    this.validateTransition(subscription.status, SUBSCRIPTION_STATUS.ACTIVE);
    subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
    subscription.startDate = new Date();
    subscription.nextBillingDate = this._calculateNextBillingDate(
      new Date(),
      subscription.billingPeriod
    );
    subscription.expiryDate = null;
    await subscription.save();
    return subscription;
  }

  /**
   * Close a subscription.
   */
  async close(subscription) {
    this.validateTransition(subscription.status, SUBSCRIPTION_STATUS.CLOSED);
    subscription.status = SUBSCRIPTION_STATUS.CLOSED;
    await subscription.save();
    return subscription;
  }

  /**
   * Advance the next billing date based on billing period.
   */
  advanceBillingDate(subscription) {
    subscription.nextBillingDate = this._calculateNextBillingDate(
      subscription.nextBillingDate,
      subscription.billingPeriod
    );
  }

  /**
   * Calculate the next billing date based on frequency.
   */
  _calculateNextBillingDate(fromDate, frequency) {
    const date = new Date(fromDate);
    switch (frequency) {
      case BILLING_FREQUENCY.DAILY:
        date.setDate(date.getDate() + 1);
        break;
      case BILLING_FREQUENCY.WEEKLY:
        date.setDate(date.getDate() + 7);
        break;
      case BILLING_FREQUENCY.MONTHLY:
        date.setMonth(date.getMonth() + 1);
        break;
      case BILLING_FREQUENCY.YEARLY:
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date;
  }

  /**
   * Generate a billing period string.
   * Example: "2026-11" for monthly, "2026-W44" for weekly.
   */
  getBillingPeriodString(date, frequency) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (frequency) {
      case BILLING_FREQUENCY.DAILY:
        return `${year}-${month}-${day}`;
      case BILLING_FREQUENCY.WEEKLY: {
        // ISO week number
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((d - startOfYear) / 86400000);
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
      }
      case BILLING_FREQUENCY.MONTHLY:
        return `${year}-${month}`;
      case BILLING_FREQUENCY.YEARLY:
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }

  _error(message, statusCode, code) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.code = code;
    return err;
  }
}

module.exports = new SubscriptionService();
