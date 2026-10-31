const taxService = require('../src/services/taxService');
const discountService = require('../src/services/discountService');
const pricingService = require('../src/services/pricingService');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');
const Tax = require('../src/models/Tax');
const Discount = require('../src/models/Discount');
const Product = require('../src/models/Product');

describe('Pricing, Tax & Discount Engine Tests', () => {
  let tax18;
  let tax12;
  let percentDiscount;
  let fixedDiscount;
  let testProduct;

  beforeAll(async () => {
    await connectDB();

    // Create test tax
    tax18 = await Tax.create({
      name: 'GST 18% Test',
      rate: 18,
      type: 'EXCLUSIVE',
      status: 'ACTIVE',
    });

    tax12 = await Tax.create({
      name: 'GST 12% Test',
      rate: 12,
      type: 'EXCLUSIVE',
      status: 'ACTIVE',
    });

    // Create test discounts
    percentDiscount = await Discount.create({
      name: '10% Off Test',
      type: 'PERCENTAGE',
      value: 10,
      minimumPurchase: 1000,
      status: 'ACTIVE',
    });

    fixedDiscount = await Discount.create({
      name: '500 Fixed Off Test',
      type: 'FIXED_AMOUNT',
      value: 500,
      minimumQuantity: 2,
      status: 'ACTIVE',
    });

    testProduct = await Product.create({
      name: 'Test Pricing Product',
      salesPrice: 2000,
      status: 'ACTIVE',
    });
  });

  afterAll(async () => {
    await Tax.deleteMany({ name: /Test/ });
    await Discount.deleteMany({ name: /Test/ });
    await Product.deleteMany({ name: /Test/ });
    await mongoose.connection.close();
  });

  test('Tax calculation computes correct tax amounts', async () => {
    const taxableAmount = 1000;
    const result = await taxService.calculateTax(taxableAmount, [tax18._id]);
    expect(result.taxTotal).toBe(180);
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0].rate).toBe(18);
  });

  test('Tax calculation handles multiple taxes', async () => {
    const taxableAmount = 1000;
    const result = await taxService.calculateTax(taxableAmount, [tax18._id, tax12._id]);
    expect(result.taxTotal).toBe(300); // 180 + 120
    expect(result.breakdown).toHaveLength(2);
  });

  test('Percentage discount calculates properly when minimum purchase met', async () => {
    const lineAmount = 2000;
    const result = await discountService.calculateLineDiscount(
      percentDiscount._id,
      lineAmount,
      1,
      testProduct._id
    );
    expect(result.discountAmount).toBe(200); // 10% of 2000
  });

  test('Discount is not applied if minimum purchase threshold is not reached', async () => {
    const lineAmount = 500; // less than minimumPurchase: 1000
    const result = await discountService.calculateLineDiscount(
      percentDiscount._id,
      lineAmount,
      1,
      testProduct._id
    );
    expect(result.discountAmount).toBe(0);
  });

  test('Fixed discount applies only when minimum quantity requirement is met', async () => {
    // Quantity 1 < 2 -> should fail
    const resultLowQty = await discountService.calculateLineDiscount(
      fixedDiscount._id,
      2000,
      1,
      testProduct._id
    );
    expect(resultLowQty.discountAmount).toBe(0);

    // Quantity 2 >= 2 -> should apply 500
    const resultSufficientQty = await discountService.calculateLineDiscount(
      fixedDiscount._id,
      4000,
      2,
      testProduct._id
    );
    expect(resultSufficientQty.discountAmount).toBe(500);
  });

  test('Expired discount is not applied', async () => {
    const expiredDiscount = await Discount.create({
      name: 'Expired Discount',
      type: 'PERCENTAGE',
      value: 20,
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      status: 'ACTIVE',
    });

    const result = await discountService.calculateLineDiscount(
      expiredDiscount._id,
      2000,
      1,
      testProduct._id
    );
    expect(result.discountAmount).toBe(0);

    await Discount.findByIdAndDelete(expiredDiscount._id);
  });

  test('Pricing Engine computes complete breakdown correctly', async () => {
    const lines = [
      {
        productId: testProduct._id,
        quantity: 2,
        unitPrice: 2000,
        taxIds: [tax18._id],
        discountId: fixedDiscount._id,
      },
    ];

    const pricing = await pricingService.calculateLines(lines);

    // subtotal = 2 * 2000 = 4000
    expect(pricing.subtotal).toBe(4000);
    // discount = 500
    expect(pricing.discountTotal).toBe(500);
    // taxable = 4000 - 500 = 3500
    expect(pricing.taxableAmount).toBe(3500);
    // tax = 18% of 3500 = 630
    expect(pricing.taxTotal).toBe(630);
    // grandTotal = 3500 + 630 = 4130
    expect(pricing.grandTotal).toBe(4130);
  });
});
