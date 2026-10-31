const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createTaxSchema, updateTaxSchema } = require('../validators/taxValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF), taxController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF), taxController.getById);
router.post('/', authorize(ROLES.ADMIN), validate(createTaxSchema), taxController.create);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateTaxSchema), taxController.update);
router.delete('/:id', authorize(ROLES.ADMIN), taxController.remove);

module.exports = router;
