const { DataTypes } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

const TelegramVerification = sequelize.define('TelegramVerification', {
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    defaultValue: () => new ObjectId().toHexString()
  },
  token: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  upiId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'telegram_verifications',
  timestamps: false,
  indexes: [
    { fields: ['token'] },
    { fields: ['expiresAt'] }
  ]
});

module.exports = TelegramVerification;
