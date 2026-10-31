const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createProductSchema, updateProductSchema } = require('../validators/productValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authorize(ROLES.ADMIN), validate(createProductSchema), productController.create);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateProductSchema), productController.update);
router.delete('/:id', authorize(ROLES.ADMIN), productController.remove);

module.exports = router;
