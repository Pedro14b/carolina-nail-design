const { Notification, NotificationSettings } = require('../models');
const { Op } = require('sequelize');

// Buscar notificacao por ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificacao nao encontrada' });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Erro ao buscar notificacao:', error);
    res.status(500).json({ error: 'Erro ao buscar notificacao' });
  }
};

// Listar notificações do usuário
const listNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, isRead } = req.query;
    const offset = (page - 1) * limit;

    let where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
};

// Marcar notificação como lida
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    await notification.update({ isRead: true });

    res.status(200).json({
      success: true,
      message: 'Notificação marcada como lida',
      data: notification
    });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
};

// Marcar todas como lidas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.status(200).json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações:', error);
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
};

// Obter configurações de notificação
const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    let settings = await NotificationSettings.findOne({ where: { userId } });

    if (!settings) {
      settings = await NotificationSettings.create({ userId });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro ao obter configurações de notificação' });
  }
};

// Atualizar configurações de notificação
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      enableAppointmentNotifications,
      appointmentReminderMinutes,
      enablePaymentNotifications,
      enableSMSNotifications,
      enableEmailNotifications,
      quietHoursStart,
      quietHoursEnd
    } = req.body;

    let settings = await NotificationSettings.findOne({ where: { userId } });

    if (!settings) {
      settings = await NotificationSettings.create({ userId });
    }

    await settings.update({
      enableAppointmentNotifications,
      appointmentReminderMinutes,
      enablePaymentNotifications,
      enableSMSNotifications,
      enableEmailNotifications,
      quietHoursStart,
      quietHoursEnd
    });

    res.status(200).json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: settings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

// Deletar notificação
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: 'Notificação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    res.status(500).json({ error: 'Erro ao deletar notificação' });
  }
};

module.exports = {
  getNotificationById,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getSettings,
  updateSettings,
  deleteNotification
};
