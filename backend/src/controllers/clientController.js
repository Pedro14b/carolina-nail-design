const { Client, User, Appointment, Transaction, Service } = require('../models');
const { Op } = require('sequelize');

// Listar clientes
const listClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: { ...where, role: 'client', isActive: true },
      include: [{ model: Client, attributes: ['birthDate', 'address', 'city', 'state', 'totalSpent', 'allergies', 'preferences', 'favoriteServices'] }],
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
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
};

// Buscar cliente por ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id, role: 'client' },
      include: [Client]
    });

    if (!user) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Obter estatísticas
    const appointments = await Appointment.findAll({
      where: { clientId: id },
      include: [
        { model: Service, attributes: ['id', 'name', 'duration', 'price', 'category'] },
        { model: User, as: 'professional', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['date', 'DESC']],
      limit: 20
    });

    const nextAppointment = await Appointment.findOne({
      where: {
        clientId: id,
        date: { [Op.gte]: new Date() },
        status: { [Op.notIn]: ['cancelled'] }
      },
      include: [{ model: Service, attributes: ['id', 'name', 'duration', 'price', 'category'] }],
      order: [['date', 'ASC']]
    });

    const totalSpent = await Transaction.sum('amount', {
      where: {
        appointmentId: { [Op.in]: appointments.map(apt => apt.id) },
        type: 'income'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        stats: {
          totalAppointments: appointments.length,
          totalSpent: totalSpent || 0,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          lastVisitAt: appointments[0]?.date || null,
          nextVisitAt: nextAppointment?.date || null
        },
        history: appointments.map((appointment) => ({
          id: appointment.id,
          date: appointment.date,
          status: appointment.status,
          notes: appointment.notes,
          totalPrice: appointment.totalPrice,
          service: appointment.Service ? {
            id: appointment.Service.id,
            name: appointment.Service.name,
            duration: appointment.Service.duration,
            price: appointment.Service.price,
            category: appointment.Service.category
          } : null,
          professional: appointment.professional ? {
            id: appointment.professional.id,
            name: appointment.professional.name,
            phone: appointment.professional.phone
          } : null
        })),
        nextAppointment: nextAppointment ? {
          id: nextAppointment.id,
          date: nextAppointment.date,
          status: nextAppointment.status,
          notes: nextAppointment.notes,
          totalPrice: nextAppointment.totalPrice,
          service: nextAppointment.Service ? {
            id: nextAppointment.Service.id,
            name: nextAppointment.Service.name,
            duration: nextAppointment.Service.duration,
            price: nextAppointment.Service.price,
            category: nextAppointment.Service.category
          } : null
        } : null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

// Criar novo cliente
const createClient = async (req, res) => {
  try {
    const { name, phone, email, birthDate, address, city, state, zipCode, notes, allergies, preferences, favoriteServices } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ error: 'Telefone já registrado' });
    }

    const user = await User.create({
      name,
      phone,
      email,
      role: 'client',
      password: Math.random().toString(36).slice(-8) // Senha temporária
    });

    const client = await Client.create({
      userId: user.id,
      birthDate,
      address,
      city,
      state,
      zipCode,
      notes,
      allergies,
      preferences,
      favoriteServices
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: { ...user.toJSON(), Client: client }
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

// Atualizar cliente
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, birthDate, address, city, state, zipCode, notes, allergies, preferences, favoriteServices } = req.body;

    const user = await User.findOne({ where: { id, role: 'client' } });
    if (!user) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await user.update({ name, email });
    
    const client = await Client.findOne({ where: { userId: id } });
    if (client) {
      await client.update({ birthDate, address, city, state, zipCode, notes, allergies, preferences, favoriteServices });
    }

    const refreshedUser = await User.findOne({
      where: { id, role: 'client' },
      include: [Client]
    });

    res.status(200).json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: refreshedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

// Deletar cliente (soft delete)
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ where: { id, role: 'client' } });
    if (!user) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await user.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
};

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
