const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, appointmentController.listAppointments);
router.get('/confirmations/summary', authMiddleware, appointmentController.getConfirmationSummary);
router.post('/confirmations/request-batch', authMiddleware, appointmentController.requestBatchAppointmentConfirmations);
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);
router.post('/', authMiddleware, appointmentController.createAppointment);
router.put('/:id', authMiddleware, appointmentController.updateAppointment);
router.post('/:id/confirmation/request', authMiddleware, appointmentController.requestAppointmentConfirmation);
router.post('/:id/confirmation/respond', authMiddleware, appointmentController.respondAppointmentConfirmation);
router.delete('/:id', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
