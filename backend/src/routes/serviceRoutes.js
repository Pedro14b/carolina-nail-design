const express = require('express');
const serviceController = require('../controllers/serviceController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', serviceController.listServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authMiddleware, adminMiddleware, serviceController.createService);
router.put('/:id', authMiddleware, adminMiddleware, serviceController.updateService);
router.delete('/:id', authMiddleware, adminMiddleware, serviceController.deleteService);

module.exports = router;
