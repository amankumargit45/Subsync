const Subscription = require('../models/Subscription');
const invoiceService = require('./invoiceService');
const subscriptionService = require('./subscriptionService');
const { SUBSCRIPTION_STATUS } = require('../config/constants');

class BillingService {
  /**
   * Process all due subscriptions.
   * Called by the cron job — this is the billing engine's entry point.
   */
  async processDueSubscriptions() {
    const now = new Date();

    // Find active subscriptions with billing due
    const dueSubscriptions = await Subscription.find({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      nextBillingDate: { $lte: now },
    });

    if (dueSubscriptions.length === 0) {
      return { processed: 0, invoicesCreated: 0, errors: 0 };
    }

    console.log(`🔄 Billing engine: Found ${dueSubscriptions.length} due subscription(s).`);

    let invoicesCreated = 0;
    let errors = 0;

    for (const subscription of dueSubscriptions) {
      try {
        await this._billSubscription(subscription);
        invoicesCreated++;
      } catch (err) {
        errors++;
        console.error(
          `❌ Billing failed for ${subscription.subscriptionNumber}: ${err.message}`
        );
      }
    }

    console.log(
      `✅ Billing engine: Processed ${dueSubscriptions.length}, Created ${invoicesCreated} invoice(s), ${errors} error(s).`
    );

    return {
      processed: dueSubscriptions.length,
      invoicesCreated,
      errors,
    };
  }

  /**
   * Bill a single subscription.
   */
  async _billSubscription(subscription) {
    // Determine billing period string for idempotency key
    const billingPeriod = subscriptionService.getBillingPeriodString(
      subscription.nextBillingDate,
      subscription.billingPeriod
    );

    // Generate invoice (idempotent — will skip if already exists)
    const invoice = await invoiceService.generateFromSubscription(
      subscription,
      billingPeriod
    );

    if (invoice) {
      console.log(
        `📄 Invoice ${invoice.invoiceNumber} created for ${subscription.subscriptionNumber} (period: ${billingPeriod})`
      );
    }

    // Advance the next billing date regardless (so we don't retry endlessly)
    subscriptionService.advanceBillingDate(subscription);
    await subscription.save();

    // Check if subscription has expired
    if (
      subscription.expiryDate &&
      subscription.nextBillingDate > subscription.expiryDate
    ) {
      subscription.status = SUBSCRIPTION_STATUS.EXPIRED;
      await subscription.save();
      console.log(`⏰ Subscription ${subscription.subscriptionNumber} has expired.`);
    }
  }
}

module.exports = new BillingService();
