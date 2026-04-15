const { Appointment, User, Service, Client, Notification } = require('../models');
const { Op } = require('sequelize');

const VALID_CONFIRMATION_CHANNELS = ['internal', 'sms', 'whatsapp'];
const VALID_CONFIRMATION_RESPONSES = ['confirmed', 'declined'];

const buildDateRange = (rawDate) => {
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const [year, month, day] = rawDate.split('-').map(Number);
    return {
      start: new Date(year, month - 1, day, 0, 0, 0, 0),
      end: new Date(year, month - 1, day, 23, 59, 59, 999)
    };
  }

  const baseDate = rawDate ? new Date(rawDate) : new Date();
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Listar agendamentos
const listAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, confirmationStatus, date, clientId, professionalId } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (confirmationStatus) where.confirmationStatus = confirmationStatus;
    if (clientId) where.clientId = clientId;
    if (professionalId) where.professionalId = professionalId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'professional', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name', 'duration'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['date', 'ASC']]
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
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
};

// Buscar agendamento por ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: { id },
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'professional' },
        { model: Service }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
};

// Criar agendamento
const createAppointment = async (req, res) => {
  try {
    const { clientId, professionalId, serviceId, date, notes } = req.body;

    if (!clientId || !professionalId || !serviceId || !date) {
      return res.status(400).json({
        error: 'Cliente, profissional, serviço e data são obrigatórios'
      });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verificar disponibilidade (sem conflitos de horário)
    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000);

    const conflict = await Appointment.findOne({
      where: {
        professionalId,
        date: { [Op.between]: [appointmentDate, endTime] },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (conflict) {
      return res.status(409).json({ error: 'Horário não disponível' });
    }

    const appointment = await Appointment.create({
      clientId,
      professionalId,
      serviceId,
      date: appointmentDate,
      duration: service.duration,
      totalPrice: service.price,
      notes,
      status: 'pending'
    });

    // Enviar notificação
    await Notification.create({
      userId: clientId,
      type: 'appointment',
      title: 'Novo Agendamento',
      message: `Seu agendamento para ${new Date(appointmentDate).toLocaleDateString('pt-BR')} foi confirmado!`,
      data: { appointmentId: appointment.id }
    });

    const populated = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'professional' },
        { model: Service }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: populated
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
};

// Atualizar agendamento
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, notes } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const updatePayload = {};
    if (date !== undefined) updatePayload.date = date;
    if (status !== undefined) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    await appointment.update(updatePayload);

    const updated = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'professional' },
        { model: Service }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
};

// Cancelar agendamento
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await appointment.update({ status: 'cancelled' });

    await Notification.create({
      userId: appointment.clientId,
      type: 'appointment',
      title: 'Agendamento Cancelado',
      message: 'Seu agendamento foi cancelado.',
      data: { appointmentId: id }
    });

    res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
};

const requestAppointmentConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedChannel = String(req.body?.channel || 'internal');
    const channel = VALID_CONFIRMATION_CHANNELS.includes(requestedChannel) ? requestedChannel : 'internal';

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ error: 'Não é possível solicitar confirmação para este agendamento' });
    }

    await appointment.update({
      confirmationStatus: 'pending',
      confirmationChannel: channel,
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

    return res.status(200).json({
      success: true,
      message: 'Solicitação de confirmação enviada com sucesso',
      data: appointment
    });
  } catch (error) {
    console.error('Erro ao solicitar confirmação de presença:', error);
    return res.status(500).json({ error: 'Erro ao solicitar confirmação de presença' });
  }
};

const respondAppointmentConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const response = String(req.body?.response || '').toLowerCase();

    if (!VALID_CONFIRMATION_RESPONSES.includes(response)) {
      return res.status(400).json({ error: 'Resposta de confirmação inválida' });
    }

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: User, as: 'professional', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      return res.status(400).json({ error: 'Este agendamento não pode mais receber confirmação' });
    }

    await appointment.update({
      confirmationStatus: response,
      confirmationRespondedAt: new Date()
    });

    await Notification.create({
      userId: appointment.professionalId,
      type: 'appointment',
      title: 'Resposta de confirmação',
      message: `${appointment.client?.name || 'Cliente'} ${response === 'confirmed' ? 'confirmou' : 'recusou'} o atendimento de ${new Date(appointment.date).toLocaleString('pt-BR')}.`,
      data: {
        appointmentId: appointment.id,
        confirmationStatus: response
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Resposta de confirmação registrada com sucesso',
      data: appointment
    });
  } catch (error) {
    console.error('Erro ao responder confirmação de presença:', error);
    return res.status(500).json({ error: 'Erro ao responder confirmação de presença' });
  }
};

const getConfirmationSummary = async (req, res) => {
  try {
    const { start, end } = buildDateRange(req.query?.date);

    const appointments = await Appointment.findAll({
      where: {
        date: { [Op.between]: [start, end] },
        status: { [Op.notIn]: ['cancelled', 'completed'] }
      },
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: User, as: 'professional', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] }
      ],
      order: [['date', 'ASC']]
    });

    const summary = appointments.reduce((acc, appointment) => {
      acc.total += 1;
      const key = appointment.confirmationStatus || 'no_response';
      if (acc[key] !== undefined) {
        acc[key] += 1;
      }
      return acc;
    }, {
      total: 0,
      pending: 0,
      confirmed: 0,
      declined: 0,
      no_response: 0
    });

    const expiredToday = await Appointment.count({
      where: {
        confirmationStatus: 'no_response',
        confirmationRequestedAt: { [Op.ne]: null },
        confirmationRespondedAt: { [Op.between]: [start, end] }
      }
    });

    summary.expiredToday = expiredToday;

    return res.status(200).json({
      success: true,
      data: {
        date: start,
        summary,
        appointments
      }
    });
  } catch (error) {
    console.error('Erro ao gerar resumo de confirmações:', error);
    return res.status(500).json({ error: 'Erro ao gerar resumo de confirmações' });
  }
};

const requestBatchAppointmentConfirmations = async (req, res) => {
  try {
    const requestedChannel = String(req.body?.channel || 'internal');
    const channel = VALID_CONFIRMATION_CHANNELS.includes(requestedChannel) ? requestedChannel : 'internal';
    const requestedStatus = String(req.body?.status || 'all');
    const requestedConfirmationStatuses = Array.isArray(req.body?.confirmationStatuses)
      ? req.body.confirmationStatuses
      : null;
    const dryRun = req.body?.dryRun === true;

    const { start, end } = buildDateRange(req.body?.date);

    const where = {
      date: { [Op.between]: [start, end] }
    };

    if (requestedStatus !== 'all') {
      where.status = requestedStatus;
    } else {
      where.status = { [Op.notIn]: ['cancelled', 'completed'] };
    }

    if (requestedConfirmationStatuses?.length) {
      where.confirmationStatus = { [Op.in]: requestedConfirmationStatuses };
    } else {
      where.confirmationStatus = { [Op.in]: ['no_response', 'declined'] };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    if (dryRun) {
      return res.status(200).json({
        success: true,
        message: 'Prévia de solicitações calculada com sucesso',
        data: {
          date: start,
          channel,
          targetedCount: appointments.length,
          filters: {
            status: requestedStatus,
            confirmationStatuses: requestedConfirmationStatuses?.length
              ? requestedConfirmationStatuses
              : ['no_response', 'declined']
          }
        }
      });
    }

    let requestedCount = 0;

    for (const appointment of appointments) {
      await appointment.update({
        confirmationStatus: 'pending',
        confirmationChannel: channel,
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

      requestedCount += 1;
    }

    return res.status(200).json({
      success: true,
      message: 'Solicitações de confirmação enviadas com sucesso',
      data: {
        date: start,
        channel,
        requestedCount,
        filters: {
          status: requestedStatus,
          confirmationStatuses: requestedConfirmationStatuses?.length
            ? requestedConfirmationStatuses
            : ['no_response', 'declined']
        }
      }
    });
  } catch (error) {
    console.error('Erro ao solicitar confirmações em lote:', error);
    return res.status(500).json({ error: 'Erro ao solicitar confirmações em lote' });
  }
};

module.exports = {
  listAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  requestAppointmentConfirmation,
  respondAppointmentConfirmation,
  getConfirmationSummary,
  requestBatchAppointmentConfirmations
};
