const { Appointment, Notification, User, Service } = require('../models');
const { Op } = require('sequelize');
const schedule = require('node-schedule');

class AppointmentConfirmationService {
  static async sendNextDayConfirmations() {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + 1);

    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.findAll({
      where: {
        date: { [Op.between]: [start, end] },
        status: { [Op.notIn]: ['cancelled', 'completed'] }
      },
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    let updatedCount = 0;

    for (const appointment of appointments) {
      await appointment.update({
        confirmationStatus: 'pending',
        confirmationChannel: appointment.confirmationChannel || 'internal',
        confirmationRequestedAt: new Date(),
        confirmationRespondedAt: null
      });

      await Notification.create({
        userId: appointment.clientId,
        type: 'reminder',
        title: 'Confirmação de presença',
        message: `Confirme sua presença para ${appointment.Service?.name || 'seu atendimento'} em ${new Date(appointment.date).toLocaleString('pt-BR')}.`,
        data: {
          appointmentId: appointment.id,
          action: 'confirm_attendance'
        }
      });

      updatedCount += 1;
    }

    return { targetDate: start, updatedCount };
  }

  static scheduleDailyConfirmationJob() {
    const cron = process.env.CONFIRMATION_JOB_CRON || '0 20 * * *';
    const expiryCron = process.env.CONFIRMATION_EXPIRY_CHECK_CRON || '0 * * * *';

    schedule.scheduleJob(cron, async () => {
      try {
        const result = await this.sendNextDayConfirmations();
        console.log(`✅ Confirmações de presença disparadas: ${result.updatedCount}`);
      } catch (error) {
        console.error('❌ Erro ao enviar confirmações de presença:', error);
      }
    });

    schedule.scheduleJob(expiryCron, async () => {
      try {
        const result = await this.expirePendingConfirmations();
        if (result.updatedCount > 0) {
          console.log(`✅ Confirmações pendentes expiradas: ${result.updatedCount}`);
        }
      } catch (error) {
        console.error('❌ Erro ao expirar confirmações pendentes:', error);
      }
    });

    console.log(`📌 Job de confirmação de presença agendado (${cron})`);
    console.log(`📌 Job de expiração de confirmação agendado (${expiryCron})`);
  }

  static async expirePendingConfirmations() {
    const expirationHours = Number(process.env.CONFIRMATION_PENDING_EXPIRY_HOURS || 12);
    const threshold = new Date(Date.now() - expirationHours * 60 * 60 * 1000);
    const now = new Date();

    const [updatedCount] = await Appointment.update(
      {
        confirmationStatus: 'no_response',
        confirmationRespondedAt: now
      },
      {
        where: {
          confirmationStatus: 'pending',
          confirmationRequestedAt: { [Op.lte]: threshold },
          status: { [Op.notIn]: ['cancelled', 'completed'] }
        }
      }
    );

    return { threshold, updatedCount };
  }
}

module.exports = AppointmentConfirmationService;
