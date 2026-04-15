const { Service } = require('../models');

// Listar serviços
const listServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
};

// Buscar serviço por ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar serviço' });
  }
};

// Criar serviço
const createService = async (req, res) => {
  try {
    const { name, description, duration, price, category } = req.body;

    if (!name || !duration || !price) {
      return res.status(400).json({
        error: 'Nome, duração e preço são obrigatórios'
      });
    }

    const service = await Service.create({
      name,
      description,
      duration,
      price,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
};

// Atualizar serviço
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, category } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    await service.update({ name, description, duration, price, category });

    res.status(200).json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
};

// Deletar serviço
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    await service.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
};

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
