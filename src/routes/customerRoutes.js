const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customerValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), customerController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), customerController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.STAFF), validate(createCustomerSchema), customerController.create);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), validate(updateCustomerSchema), customerController.update);
router.delete('/:id', authorize(ROLES.ADMIN), customerController.remove);

module.exports = router;
