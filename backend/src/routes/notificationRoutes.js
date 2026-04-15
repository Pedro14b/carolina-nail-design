const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, notificationController.listNotifications);
router.post('/mark-all-read', authMiddleware, notificationController.markAllAsRead);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.get('/settings', authMiddleware, notificationController.getSettings);
router.post('/settings', authMiddleware, notificationController.updateSettings);
router.get('/:id', authMiddleware, notificationController.getNotificationById);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
