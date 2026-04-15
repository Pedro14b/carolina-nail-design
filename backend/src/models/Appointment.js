const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  professionalId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Services',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // em minutos
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'pending'
  },
  confirmationStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'declined', 'no_response'),
    defaultValue: 'no_response'
  },
  confirmationChannel: {
    type: DataTypes.ENUM('internal', 'sms', 'whatsapp'),
    defaultValue: 'internal'
  },
  confirmationRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmationRespondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

Appointment.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
Appointment.belongsTo(User, { as: 'professional', foreignKey: 'professionalId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = Appointment;
