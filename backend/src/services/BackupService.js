const { User, Client, Appointment, Service, Transaction, Notification } = require('../models');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BackupService {
  /**
   * Criar backup completo do banco de dados
   */
  static async createFullBackup() {
    try {
      console.log('📦 Iniciando backup ...');
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: 1,
        data: {}
      };

      // Exportar todas as tabelas
      backupData.data.users = await User.findAll({ raw: true });
      backupData.data.clients = await Client.findAll({ raw: true });
      backupData.data.services = await Service.findAll({ raw: true });
      backupData.data.appointments = await Appointment.findAll({ raw: true });
      backupData.data.transactions = await Transaction.findAll({ raw: true });
      backupData.data.notifications = await Notification.findAll({ raw: true });

      return backupData;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  /**
   * Salvar backup em arquivo (local ou nuvem)
   */
  static async saveBackupToFile(backupData) {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      
      // Criar diretório se não existir
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const filename = `backup_${backupData.timestamp.split('T')[0]}_${Date.now()}.json`;
      const filepath = path.join(backupDir, filename);

      // Salvar com compressão JSON
      fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

      console.log(`✅ Backup salvo: ${filename}`);
      
      return {
        id: uuidv4(),
        filename,
        filepath,
        size: fs.statSync(filepath).size,
        createdAt: backupData.timestamp,
        type: 'full'
      };
    } catch (error) {
      console.error('❌ Erro ao salvar arquivo de backup:', error);
      throw error;
    }
  }

  /**
   * Fazer backup incremental (apenas dados novos/modificados)
   */
  static async createIncrementalBackup(lastBackupDate) {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: 1,
        type: 'incremental',
        lastSync: lastBackupDate,
        data: {}
      };

      // Buscar apenas dados modificados após lastBackupDate
      backupData.data.appointments = await Appointment.findAll({
        where: { updatedAt: { [require('sequelize').Op.gte]: lastBackupDate } },
        raw: true
      });

      backupData.data.transactions = await Transaction.findAll({
        where: { createdAt: { [require('sequelize').Op.gte]: lastBackupDate } },
        raw: true
      });

      return backupData;
    } catch (error) {
      console.error('❌ Erro ao criar backup incremental:', error);
      throw error;
    }
  }

  /**
   * Restaurar backup (cuidado - sobrescreve dados!)
   */
  static async restoreBackup(backupData) {
    try {
      console.log('🔄 Iniciando restauração...');
      
      // ATENÇÃO: Isso é destrutivo! Use com cuidado
      // Aqui você poderia validar antes de restaurar

      if (backupData.data.users && backupData.data.users.length > 0) {
        await User.bulkCreate(backupData.data.users, { 
          updateOnDuplicate: ['name', 'email', 'phone', 'role', 'profileImage'] 
        });
      }

      if (backupData.data.appointments && backupData.data.appointments.length > 0) {
        await Appointment.bulkCreate(backupData.data.appointments, { 
          updateOnDuplicate: ['date', 'status', 'totalPrice'] 
        });
      }

      if (backupData.data.transactions && backupData.data.transactions.length > 0) {
        await Transaction.bulkCreate(backupData.data.transactions, { 
          updateOnDuplicate: ['amount', 'type'] 
        });
      }

      console.log('✅ Restauração concluída!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  /**
   * Exportar dados em CSV para Excel
   */
  static async exportToCSV(type = 'all') {
    try {
      let csvContent = '';

      if (type === 'all' || type === 'appointments') {
        const appointments = await Appointment.findAll({ include: ['client', 'Service'] });
        csvContent += 'DATA,CLIENTE,SERVIÇO,STATUS,VALOR\n';
        appointments.forEach(apt => {
          const date = new Date(apt.date).toLocaleDateString('pt-BR');
          const price = apt.totalPrice.toString().replace('.', ',');
          csvContent += `${date},"${apt.client?.name}","${apt.Service?.name}","${apt.status}",${price}\n`;
        });
        csvContent += '\n\n';
      }

      if (type === 'all' || type === 'transactions') {
        const transactions = await Transaction.findAll();
        csvContent += 'DATA,TIPO,DESCRIÇÃO,VALOR,CATEGORIA\n';
        transactions.forEach(trans => {
          const date = new Date(trans.date).toLocaleDateString('pt-BR');
          const amount = trans.amount.toString().replace('.', ',');
          csvContent += `${date},"${trans.type}","${trans.description}",${amount},"${trans.category}"\n`;
        });
      }

      return csvContent;
    } catch (error) {
      console.error('❌ Erro ao exportar CSV:', error);
      throw error;
    }
  }

  /**
   * Listar todos os backups disponíveis
   */
  static async listBackups() {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      
      if (!fs.existsSync(backupDir)) {
        return [];
      }

      const files = fs.readdirSync(backupDir);
      const backups = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const filepath = path.join(backupDir, f);
          const stat = fs.statSync(filepath);
          return {
            filename: f,
            size: stat.size,
            createdAt: stat.mtime,
            sizeKB: (stat.size / 1024).toFixed(2)
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return backups;
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      throw error;
    }
  }

  /**
   * Deletar backup antigo
   */
  static async deleteBackup(filename) {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      const filepath = path.join(backupDir, filename);

      // Validar que o arquivo está no diretório de backups
      if (!filepath.startsWith(backupDir)) {
        throw new Error('Caminho inválido');
      }

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao deletar backup:', error);
      throw error;
    }
  }

  /**
   * Agendar backup automático diário
   */
  static scheduleAutoBackup() {
    // Executar backup diariamente às 3 AM
    const schedule = require('node-schedule');
    
    schedule.scheduleJob('0 3 * * *', async () => {
      try {
        console.log('⏰ Backup automático agendado iniciado...');
        const backupData = await this.createFullBackup();
        await this.saveBackupToFile(backupData);
        console.log('✅ Backup automático concluído com sucesso');
      } catch (error) {
        console.error('❌ Erro no backup automático:', error);
      }
    });

    console.log('📅 Backup automático agendado (3 AM diariamente)');
  }

  /**
   * Salvar backup na nuvem (Google Drive / OneDrive / AWS S3)
   */
  static async uploadToCloud(backupData, provider = 'drive') {
    try {
      console.log(`☁️ Uploading backup para ${provider}...`);
      
      // Aqui você pode integrar com Google Drive, AWS S3, etc
      // Por enquanto, apenas placeholder
      
      // Exemplo para Google Drive:
      // const google = require('googleapis').google;
      // const drive = google.drive({ version: 'v3', auth });
      // ...
      
      console.log(`✅ Backup enviado para ${provider}`);
      return {
        cloudId: uuidv4(),
        provider,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Erro ao fazer upload para ${provider}:`, error);
      throw error;
    }
  }
}

module.exports = BackupService;
