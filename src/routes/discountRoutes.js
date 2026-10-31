const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createDiscountSchema, updateDiscountSchema } = require('../validators/discountValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF), discountController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF), discountController.getById);
router.post('/', authorize(ROLES.ADMIN), validate(createDiscountSchema), discountController.create);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateDiscountSchema), discountController.update);
router.delete('/:id', authorize(ROLES.ADMIN), discountController.remove);

module.exports = router;
