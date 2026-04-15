const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/financial', authMiddleware, adminMiddleware, reportController.getFinancialReport);
router.get('/appointments', authMiddleware, adminMiddleware, reportController.getAppointmentReport);
router.get('/clients', authMiddleware, adminMiddleware, reportController.getClientReport);
router.get('/retention', authMiddleware, adminMiddleware, reportController.getRetentionReport);

module.exports = router;
