const { DataTypes } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

const TelegramUser = sequelize.define('TelegramUser', {
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    defaultValue: () => new ObjectId().toHexString()
  },
  chat_id: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true
  },
  phone_number: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  registered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  last_query: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notifications_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'telegram_users',
  timestamps: false,
  indexes: [
    { fields: ['phone_number'] },
    { fields: ['chat_id'] }
  ]
});

module.exports = TelegramUser;
