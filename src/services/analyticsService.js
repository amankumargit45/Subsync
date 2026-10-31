const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

class AnalyticsService {
  /**
   * Dashboard summary with MongoDB aggregation pipelines.
   */
  async getSummary() {
    const now = new Date();

    const [
      activeSubscriptions,
      revenueStats,
      overdueInvoices,
      upcomingRenewals,
    ] = await Promise.all([
      // Active subscriptions count
      Subscription.countDocuments({ status: 'ACTIVE' }),

      // Revenue aggregation
      Invoice.aggregate([
        {
          $facet: {
            totalRevenue: [
              { $match: { status: { $ne: 'CANCELLED' } } },
              { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ],
            collectedRevenue: [
              { $match: { status: { $ne: 'CANCELLED' } } },
              { $group: { _id: null, total: { $sum: '$amountPaid' } } },
            ],
            outstandingRevenue: [
              { $match: { status: { $in: ['CONFIRMED', 'OVERDUE'] } } },
              { $group: { _id: null, total: { $sum: '$amountDue' } } },
            ],
            overdueAmount: [
              {
                $match: {
                  status: { $in: ['CONFIRMED', 'OVERDUE'] },
                  dueDate: { $lt: now },
                  amountDue: { $gt: 0 },
                },
              },
              { $group: { _id: null, total: { $sum: '$amountDue' } } },
            ],
          },
        },
      ]),

      // Overdue invoices count
      Invoice.countDocuments({
        status: { $in: ['CONFIRMED', 'OVERDUE'] },
        dueDate: { $lt: now },
        amountDue: { $gt: 0 },
      }),

      // Upcoming renewals (next 30 days)
      Subscription.countDocuments({
        status: 'ACTIVE',
        expiryDate: {
          $gte: now,
          $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const stats = revenueStats[0];

    return {
      activeSubscriptions,
      totalRevenue: stats.totalRevenue[0]?.total || 0,
      collectedRevenue: stats.collectedRevenue[0]?.total || 0,
      outstandingRevenue: stats.outstandingRevenue[0]?.total || 0,
      overdueAmount: stats.overdueAmount[0]?.total || 0,
      overdueInvoices,
      upcomingRenewals,
    };
  }

  /**
   * Revenue breakdown by date range with aggregation pipeline.
   */
  async getRevenue(startDate, endDate) {
    const match = { status: { $ne: 'CANCELLED' } };
    if (startDate) match.issueDate = { $gte: new Date(startDate) };
    if (endDate) {
      match.issueDate = match.issueDate || {};
      match.issueDate.$lte = new Date(endDate);
    }

    const revenue = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' },
          },
          totalRevenue: { $sum: '$grandTotal' },
          collected: { $sum: '$amountPaid' },
          outstanding: { $sum: '$amountDue' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return revenue.map((r) => ({
      period: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      totalRevenue: r.totalRevenue,
      collected: r.collected,
      outstanding: r.outstanding,
      invoiceCount: r.count,
    }));
  }

  /**
   * Subscription analytics.
   */
  async getSubscriptionStats() {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    stats.forEach((s) => {
      result[s._id] = s.count;
    });
    return result;
  }

  /**
   * Invoice analytics.
   */
  async getInvoiceStats() {
    const now = new Date();
    const stats = await Invoice.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$grandTotal' } } },
          ],
          overdue: [
            {
              $match: {
                status: { $in: ['CONFIRMED', 'OVERDUE'] },
                dueDate: { $lt: now },
                amountDue: { $gt: 0 },
              },
            },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amountDue' } } },
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $project: {
                invoiceNumber: 1,
                customerId: 1,
                grandTotal: 1,
                amountDue: 1,
                status: 1,
                dueDate: 1,
                issueDate: 1,
              },
            },
          ],
        },
      },
    ]);

    return stats[0];
  }

  /**
   * Payment analytics.
   */
  async getPaymentStats(startDate, endDate) {
    const match = { status: 'SUCCESS' };
    if (startDate) match.paymentDate = { $gte: new Date(startDate) };
    if (endDate) {
      match.paymentDate = match.paymentDate || {};
      match.paymentDate.$lte = new Date(endDate);
    }

    const stats = await Payment.aggregate([
      { $match: match },
      {
        $facet: {
          byMethod: [
            { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } },
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$paymentDate' },
                  month: { $month: '$paymentDate' },
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
          ],
          total: [
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    return stats[0];
  }
}

module.exports = new AnalyticsService();
