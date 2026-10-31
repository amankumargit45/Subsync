const subscriptionService = require('../src/services/subscriptionService');
const { SUBSCRIPTION_STATUS, BILLING_FREQUENCY } = require('../src/config/constants');
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

describe('Subscription Lifecycle & Transition Rules', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Permits valid transition from DRAFT to CONFIRMED', () => {
    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.DRAFT,
        SUBSCRIPTION_STATUS.CONFIRMED
      );
    }).not.toThrow();
  });

  test('Permits valid transition from CONFIRMED to ACTIVE', () => {
    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.CONFIRMED,
        SUBSCRIPTION_STATUS.ACTIVE
      );
    }).not.toThrow();
  });

  test('Permits valid transition from ACTIVE to PAUSED and back to ACTIVE', () => {
    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.ACTIVE,
        SUBSCRIPTION_STATUS.PAUSED
      );
    }).not.toThrow();

    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.PAUSED,
        SUBSCRIPTION_STATUS.ACTIVE
      );
    }).not.toThrow();
  });

  test('Rejects invalid transition from CLOSED to PAUSED', () => {
    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.CLOSED,
        SUBSCRIPTION_STATUS.PAUSED
      );
    }).toThrow('Cannot transition from CLOSED to PAUSED.');
  });

  test('Rejects invalid transition from DRAFT directly to ACTIVE', () => {
    expect(() => {
      subscriptionService.validateTransition(
        SUBSCRIPTION_STATUS.DRAFT,
        SUBSCRIPTION_STATUS.ACTIVE
      );
    }).toThrow('Cannot transition from DRAFT to ACTIVE.');
  });

  test('Calculates next billing date correctly for MONTHLY frequency', () => {
    const fromDate = new Date('2026-01-15T00:00:00.000Z');
    const nextDate = subscriptionService._calculateNextBillingDate(
      fromDate,
      BILLING_FREQUENCY.MONTHLY
    );
    expect(nextDate.getMonth()).toBe(1); // February (0-indexed)
    expect(nextDate.getDate()).toBe(15);
  });

  test('Calculates next billing date correctly for YEARLY frequency', () => {
    const fromDate = new Date('2026-05-01T00:00:00.000Z');
    const nextDate = subscriptionService._calculateNextBillingDate(
      fromDate,
      BILLING_FREQUENCY.YEARLY
    );
    expect(nextDate.getFullYear()).toBe(2027);
  });
});
