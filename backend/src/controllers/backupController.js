const BackupService = require('../services/BackupService');

// Criar backup manual
const createBackup = async (req, res) => {
  try {
    const backupData = await BackupService.createFullBackup();
    const backupInfo = await BackupService.saveBackupToFile(backupData);

    res.status(201).json({
      success: true,
      message: 'Backup criado com sucesso',
      data: backupInfo
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ error: 'Erro ao criar backup' });
  }
};

// Listar backups disponíveis
const listBackups = async (req, res) => {
  try {
    const backups = await BackupService.listBackups();

    res.status(200).json({
      success: true,
      data: backups,
      total: backups.length
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ error: 'Erro ao listar backups' });
  }
};

// Deletar backup
const deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;

    await BackupService.deleteBackup(filename);

    res.status(200).json({
      success: true,
      message: 'Backup deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar backup:', error);
    res.status(500).json({ error: 'Erro ao deletar backup' });
  }
};

// Exportar dados em CSV
const exportCSV = async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'appointments', 'transactions', 'all'

    const csv = await BackupService.exportToCSV(type);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="export_${type}_${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM para UTF-8 no Excel
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
};

// Restaurar backup (cuidado - operação destrutiva!)
const restoreBackup = async (req, res) => {
  try {
    const { adminPassword } = req.body;

    // Validação adicional de segurança
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Senha de admin inválida' });
    }

    const { filename } = req.params;
    const fs = require('fs');
    const path = require('path');

    const backupPath = path.join(__dirname, `../../backups/${filename}`);
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    await BackupService.restoreBackup(backupData);

    res.status(200).json({
      success: true,
      message: 'Backup restaurado com sucesso. Sistema sincronizado.'
    });
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    res.status(500).json({ error: 'Erro ao restaurar backup' });
  }
};

// Obter estatísticas de backup
const getBackupStats = async (req, res) => {
  try {
    const backups = await BackupService.listBackups();
    
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const lastBackup = backups[0];

    res.status(200).json({
      success: true,
      data: {
        totalBackups: backups.length,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        lastBackupDate: lastBackup?.createdAt || null,
        backups: backups.slice(0, 5) // Últimos 5
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas de backup' });
  }
};

module.exports = {
  createBackup,
  listBackups,
  deleteBackup,
  exportCSV,
  restoreBackup,
  getBackupStats
};
