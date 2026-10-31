const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createPaymentSchema } = require('../validators/paymentValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), paymentController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), paymentController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), validate(createPaymentSchema), paymentController.create);

module.exports = router;
