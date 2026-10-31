const Tax = require('../models/Tax');

class TaxService {
  /**
   * Calculate tax for a given taxable amount and tax IDs.
   * Returns { taxTotal, breakdown }
   */
  async calculateTax(taxableAmount, taxIds = []) {
    if (!taxIds || taxIds.length === 0) {
      return { taxTotal: 0, breakdown: [] };
    }

    const taxes = await Tax.find({
      _id: { $in: taxIds },
      status: 'ACTIVE',
    }).lean();

    let taxTotal = 0;
    const breakdown = [];

    for (const tax of taxes) {
      const taxAmount = Math.round((taxableAmount * tax.rate) / 100 * 100) / 100;
      taxTotal += taxAmount;
      breakdown.push({
        taxId: tax._id,
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        amount: taxAmount,
      });
    }

    taxTotal = Math.round(taxTotal * 100) / 100;

    return { taxTotal, breakdown };
  }

  /**
   * Get a tax by ID.
   */
  async getTaxById(taxId) {
    return Tax.findById(taxId).lean();
  }

  /**
   * Get all active taxes.
   */
  async getActiveTaxes() {
    return Tax.find({ status: 'ACTIVE' }).lean();
  }
}

module.exports = new TaxService();
