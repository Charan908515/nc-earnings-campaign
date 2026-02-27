const { DataTypes } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    defaultValue: () => new ObjectId().toHexString()
  },
  userId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  mobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  upiId: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'withdrawals',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['requestedAt'] }
  ]
});

module.exports = Withdrawal;
