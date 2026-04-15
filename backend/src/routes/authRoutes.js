const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login-pin', authController.loginWithPin);
router.post('/change-pin', authMiddleware, authController.changePin);
router.post('/refresh', authController.refreshAccessToken);
router.post('/biometric', authController.biometricLogin);
router.post('/recovery/request', authController.requestPinRecovery);
router.post('/recovery/verify', authController.verifyPinRecoveryCode);
router.post('/recovery/reset-pin', authController.resetPinWithRecoveryToken);

module.exports = router;
