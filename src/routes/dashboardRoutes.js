const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.STAFF));

router.get('/summary', dashboardController.getSummary);
router.get('/revenue', dashboardController.getRevenue);
router.get('/subscriptions', dashboardController.getSubscriptions);
router.get('/invoices', dashboardController.getInvoices);
router.get('/payments', dashboardController.getPayments);

module.exports = router;
