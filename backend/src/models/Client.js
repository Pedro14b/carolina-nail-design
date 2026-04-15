const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  birthDate: {
    type: DataTypes.DATE
  },
  address: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING
  },
  zipCode: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  allergies: {
    type: DataTypes.TEXT
  },
  preferences: {
    type: DataTypes.TEXT
  },
  favoriteServices: {
    type: DataTypes.TEXT
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

Client.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Client, { foreignKey: 'userId' });

module.exports = Client;
