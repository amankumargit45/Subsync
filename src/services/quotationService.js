const Quotation = require('../models/Quotation');
const pricingService = require('./pricingService');
const { generateNumber } = require('../utils/generateNumber');
const { QUOTATION_STATUS } = require('../config/constants');

class QuotationService {
  /**
   * Create a quotation with pricing calculated by the pricing engine.
   */
  async create(data, createdBy) {
    const pricing = await pricingService.calculateLines(data.lines);

    const quotationNumber = await generateNumber('QUO');

    const quotation = await Quotation.create({
      quotationNumber,
      customerId: data.customerId,
      templateId: data.templateId,
      validUntil: data.validUntil,
      lines: pricing.processedLines,
      subtotal: pricing.subtotal,
      discountTotal: pricing.discountTotal,
      taxTotal: pricing.taxTotal,
      grandTotal: pricing.grandTotal,
      status: data.status || QUOTATION_STATUS.DRAFT,
      createdBy,
    });

    return quotation;
  }

  /**
   * Recalculate quotation pricing (e.g., when lines are updated).
   */
  async recalculate(quotation) {
    const pricing = await pricingService.calculateLines(quotation.lines);
    quotation.lines = pricing.processedLines;
    quotation.subtotal = pricing.subtotal;
    quotation.discountTotal = pricing.discountTotal;
    quotation.taxTotal = pricing.taxTotal;
    quotation.grandTotal = pricing.grandTotal;
    return quotation;
  }

  /**
   * Confirm a quotation (DRAFT → CONFIRMED).
   */
  async confirm(quotation) {
    if (quotation.status !== QUOTATION_STATUS.DRAFT && quotation.status !== QUOTATION_STATUS.QUOTATION) {
      const err = new Error(`Cannot confirm quotation in ${quotation.status} status.`);
      err.statusCode = 400;
      err.code = 'INVALID_TRANSITION';
      throw err;
    }

    quotation.status = QUOTATION_STATUS.CONFIRMED;
    await quotation.save();
    return quotation;
  }
}

module.exports = new QuotationService();
