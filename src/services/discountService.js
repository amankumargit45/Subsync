const Discount = require('../models/Discount');

class DiscountService {
  /**
   * Validates and calculates discount for a line item.
   * @param {string|null} discountId
   * @param {number} lineAmount - subtotal of the line (qty * unitPrice)
   * @param {number} quantity
   * @param {string|null} productId
   * @param {string|null} subscriptionId
   * @returns {{ discountAmount: number, discount: object|null }}
   */
  async calculateLineDiscount(discountId, lineAmount, quantity, productId = null, subscriptionId = null) {
    if (!discountId) {
      return { discountAmount: 0, discount: null };
    }

    const discount = await Discount.findById(discountId).lean();
    if (!discount) {
      return { discountAmount: 0, discount: null };
    }

    if (!this._isEligible(discount, lineAmount, quantity, productId, subscriptionId)) {
      return { discountAmount: 0, discount: null };
    }

    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = Math.round((lineAmount * discount.value) / 100 * 100) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(discount.value, lineAmount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return { discountAmount, discount };
  }

  /**
   * Increment used count for a discount (when applied to an invoice).
   */
  async incrementUsage(discountId) {
    if (!discountId) return;
    await Discount.findByIdAndUpdate(discountId, { $inc: { usedCount: 1 } });
  }

  /**
   * Check if a discount is eligible to be applied.
   */
  _isEligible(discount, amount, quantity, productId, subscriptionId) {
    // Status check
    if (discount.status !== 'ACTIVE') return false;

    // Date validity
    const now = new Date();
    if (discount.startDate && now < new Date(discount.startDate)) return false;
    if (discount.endDate && now > new Date(discount.endDate)) return false;

    // Usage limit
    if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) return false;

    // Minimum purchase
    if (discount.minimumPurchase > 0 && amount < discount.minimumPurchase) return false;

    // Minimum quantity
    if (discount.minimumQuantity > 0 && quantity < discount.minimumQuantity) return false;

    // Product applicability
    if (discount.productIds && discount.productIds.length > 0 && productId) {
      const productIdStr = productId.toString();
      if (!discount.productIds.some((pid) => pid.toString() === productIdStr)) {
        return false;
      }
    }

    // Subscription applicability
    if (discount.subscriptionIds && discount.subscriptionIds.length > 0 && subscriptionId) {
      const subIdStr = subscriptionId.toString();
      if (!discount.subscriptionIds.some((sid) => sid.toString() === subIdStr)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = new DiscountService();
