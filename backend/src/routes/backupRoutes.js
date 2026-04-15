const express = require('express');
const backupController = require('../controllers/backupController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas com autenticação e admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Criar backup manual
router.post('/create', backupController.createBackup);

// Listar backups disponíveis
router.get('/list', backupController.listBackups);

// Obter estatísticas de backup
router.get('/stats', backupController.getBackupStats);

// Exportar em CSV
router.get('/export', backupController.exportCSV);

// Deletar backup
router.delete('/:filename', backupController.deleteBackup);

// Restaurar backup (requer senha de admin)
router.post('/restore/:filename', backupController.restoreBackup);

module.exports = router;
