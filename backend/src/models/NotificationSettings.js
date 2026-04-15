const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const NotificationSettings = sequelize.define('NotificationSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  enableAppointmentNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  appointmentReminderMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  enablePaymentNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  enableSMSNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enableEmailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  quietHoursStart: {
    type: DataTypes.STRING // HH:mm
  },
  quietHoursEnd: {
    type: DataTypes.STRING // HH:mm
  }
}, {
  timestamps: true
});

NotificationSettings.belongsTo(User, { foreignKey: 'userId' });

module.exports = NotificationSettings;
