const { Appointment, Transaction, User, Service } = require('../models');
const { Op } = require('sequelize');

// Relatório financeiro
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await Transaction.findAll({
      where: {
        date: { [Op.between]: [start, end] }
      },
      order: [['date', 'DESC']]
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end
        },
        summary: {
          totalIncome: income,
          totalExpenses: expenses,
          balance: income - expenses
        },
        transactions
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
  }
};

// Relatório de atendimentos
const getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.findAll({
      where: {
        date: { [Op.between]: [start, end] }
      },
      include: [
        { model: Service, attributes: ['id', 'name'] }
      ]
    });

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const pending = appointments.filter(a => a.status === 'pending').length;

    const avgDuration = appointments.length > 0
      ? appointments.reduce((sum, a) => sum + a.duration, 0) / appointments.length
      : 0;

    // Top serviços
    const serviceCount = {};
    appointments.forEach(apt => {
      const serviceId = apt.serviceId;
      serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
    });

    const topServices = Object.entries(serviceCount)
      .map(([serviceId, count]) => ({ serviceId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end
        },
        summary: {
          total,
          completed,
          cancelled,
          pending,
          averageDuration: Math.round(avgDuration),
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        },
        topServices,
        details: appointments
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de atendimentos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de atendimentos' });
  }
};

// Relatório de clientes
const getClientReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let where = { role: 'client', isActive: true };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const clients = await User.findAll({
      where,
      attributes: ['id', 'name', 'phone', 'email', 'createdAt']
    });

    const appointmentCounts = {};
    for (const client of clients) {
      const count = await Appointment.count({
        where: { clientId: client.id, status: 'completed' }
      });
      appointmentCounts[client.id] = count;
    }

    res.status(200).json({
      success: true,
      data: {
        totalClients: clients.length,
        clients: clients.map(c => ({
          ...c.toJSON(),
          appointmentCount: appointmentCounts[c.id] || 0
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de clientes' });
  }
};

// Relatório de retenção e retorno de clientes
const getRetentionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.findAll({
      where: {
        date: { [Op.between]: [start, end] }
      },
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'phone'] },
        { model: Service, attributes: ['id', 'name'] }
      ],
      order: [['date', 'ASC']]
    });

    const clientStats = new Map();

    appointments.forEach((appointment) => {
      const client = appointment.client;
      if (!client?.id) return;

      const current = clientStats.get(client.id) || {
        id: client.id,
        name: client.name,
        phone: client.phone,
        completedCount: 0,
        cancelledCount: 0,
        totalAppointments: 0,
        lastVisitAt: null
      };

      current.totalAppointments += 1;

      if (appointment.status === 'completed') {
        current.completedCount += 1;
        current.lastVisitAt = appointment.date;
      }

      if (appointment.status === 'cancelled') {
        current.cancelledCount += 1;
      }

      clientStats.set(client.id, current);
    });

    const toReturn = Array.from(clientStats.values())
      .filter((client) => client.completedCount > 0)
      .sort((a, b) => {
        const aDate = a.lastVisitAt ? new Date(a.lastVisitAt).getTime() : 0;
        const bDate = b.lastVisitAt ? new Date(b.lastVisitAt).getTime() : 0;
        return aDate - bDate;
      })
      .slice(0, 5)
      .map((client) => ({
        ...client,
        daysSinceLastVisit: client.lastVisitAt
          ? Math.max(0, Math.floor((Date.now() - new Date(client.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)))
          : null
      }));

    const mostAbsent = Array.from(clientStats.values())
      .sort((a, b) => b.cancelledCount - a.cancelledCount)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end
        },
        summary: {
          totalTrackedClients: clientStats.size,
          returnCandidates: toReturn.length,
          topAbsences: mostAbsent[0]?.cancelledCount || 0
        },
        returnCandidates: toReturn,
        mostAbsent
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de retenção:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de retenção' });
  }
};

module.exports = {
  getFinancialReport,
  getAppointmentReport,
  getClientReport,
  getRetentionReport
};
