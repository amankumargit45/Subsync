const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createInvoiceSchema } = require('../validators/invoiceValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), invoiceController.getAll);
router.get('/:id/pdf', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), invoiceController.generatePdf);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), invoiceController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.STAFF), validate(createInvoiceSchema), invoiceController.create);
router.post('/:id/confirm', authorize(ROLES.ADMIN, ROLES.STAFF), invoiceController.confirmInvoice);
router.post('/:id/cancel', authorize(ROLES.ADMIN, ROLES.STAFF), invoiceController.cancelInvoice);
router.post('/:id/send', authorize(ROLES.ADMIN, ROLES.STAFF), invoiceController.sendInvoice);

module.exports = router;
