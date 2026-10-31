const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createQuotationSchema, updateQuotationSchema } = require('../validators/quotationValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), quotationController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), quotationController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.STAFF), validate(createQuotationSchema), quotationController.create);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateQuotationSchema), quotationController.update);
router.post('/:id/confirm', authorize(ROLES.ADMIN, ROLES.STAFF), quotationController.confirm);
router.post('/:id/convert-to-subscription', authorize(ROLES.ADMIN, ROLES.STAFF), quotationController.convertToSubscription);

module.exports = router;
