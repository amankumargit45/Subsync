const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createSubscriptionSchema, updateSubscriptionSchema } = require('../validators/subscriptionValidators');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), subscriptionController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER), subscriptionController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.STAFF), validate(createSubscriptionSchema), subscriptionController.create);
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.STAFF), validate(updateSubscriptionSchema), subscriptionController.update);

router.post('/:id/activate', authorize(ROLES.ADMIN, ROLES.STAFF), subscriptionController.activate);
router.post('/:id/pause', authorize(ROLES.ADMIN, ROLES.STAFF), subscriptionController.pause);
router.post('/:id/resume', authorize(ROLES.ADMIN, ROLES.STAFF), subscriptionController.resume);
router.post('/:id/renew', authorize(ROLES.ADMIN, ROLES.STAFF), subscriptionController.renew);
router.post('/:id/close', authorize(ROLES.ADMIN, ROLES.STAFF), subscriptionController.close);

module.exports = router;
