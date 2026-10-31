const taxService = require('./taxService');
const discountService = require('./discountService');
const Product = require('../models/Product');

class PricingService {
  /**
   * Central pricing engine. Calculates totals for an array of line items.
   *
   * @param {Array} lines - Array of { productId, quantity, unitPrice, taxIds, discountId }
   * @param {Object} options - Optional: { subscriptionId }
   * @returns {Object} { subtotal, discountTotal, taxableAmount, taxTotal, grandTotal, processedLines }
   */
  async calculateLines(lines, options = {}) {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    const processedLines = [];

    for (const line of lines) {
      const lineAmount = Math.round(line.quantity * line.unitPrice * 100) / 100;
      subtotal += lineAmount;

      // Discount
      const { discountAmount } = await discountService.calculateLineDiscount(
        line.discountId,
        lineAmount,
        line.quantity,
        line.productId,
        options.subscriptionId || null
      );
      discountTotal += discountAmount;

      const taxableAmount = Math.round((lineAmount - discountAmount) * 100) / 100;

      // Tax
      const { taxTotal: lineTax, breakdown: taxBreakdown } = await taxService.calculateTax(
        taxableAmount,
        line.taxIds
      );
      taxTotal += lineTax;

      // Resolve product name
      let productName = line.productName || '';
      if (!productName && line.productId) {
        const product = await Product.findById(line.productId).select('name').lean();
        productName = product ? product.name : '';
      }

      processedLines.push({
        productId: line.productId,
        productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxIds: line.taxIds || [],
        discountId: line.discountId || null,
        amount: lineAmount,
        discountAmount,
        taxAmount: lineTax,
        taxBreakdown,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    discountTotal = Math.round(discountTotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const taxableAmount = Math.round((subtotal - discountTotal) * 100) / 100;
    const grandTotal = Math.round((taxableAmount + taxTotal) * 100) / 100;

    return {
      subtotal,
      discountTotal,
      taxableAmount,
      taxTotal,
      grandTotal,
      processedLines,
    };
  }
}

module.exports = new PricingService();
