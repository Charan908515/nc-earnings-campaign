const { DataTypes } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

const Earning = sequelize.define('Earning', {
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
  eventType: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  payment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  offerId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  subId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  ipAddress: {
    type: DataTypes.STRING(64),
    allowNull: true,
    defaultValue: ''
  },
  clickTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  conversionTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  campaignSlug: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  campaignName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  walletDisplayName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'earnings',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['createdAt'] },
    { fields: ['campaignSlug'] }
  ]
});

module.exports = Earning;
