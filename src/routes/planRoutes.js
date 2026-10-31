const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createPlanSchema, updatePlanSchema } = require('../validators/planValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', planController.getAll);
router.get('/:id', planController.getById);
router.post('/', authorize(ROLES.ADMIN), validate(createPlanSchema), planController.create);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updatePlanSchema), planController.update);
router.delete('/:id', authorize(ROLES.ADMIN), planController.remove);

module.exports = router;
