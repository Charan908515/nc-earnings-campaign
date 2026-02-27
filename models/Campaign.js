const { DataTypes, Sequelize } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

class Campaign extends Sequelize.Model {
  buildLink(userId) {
    const affiliate = this.affiliate || {};
    const url = affiliate.affiliateUrl || affiliate.baseUrl || '';
    const param = affiliate.userIdParam || affiliate.clickIdParam || 'p1';
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${param}=${userId}`;
  }

  getEventsObject() {
    const eventsObj = {};
    if (this.events && Array.isArray(this.events) && this.events.length > 0) {
      this.events.forEach(evt => {
        eventsObj[evt.key] = {
          identifiers: evt.identifiers || [],
          displayName: evt.displayName || '',
          amount: evt.amount || 0
        };
      });
    }
    return eventsObj;
  }
}

Campaign.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    defaultValue: () => new ObjectId().toHexString()
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  wallet_display: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  process: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  affiliate: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  postbackMapping: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  events: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  branding: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  userInput: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  telegram: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  sequelize,
  tableName: 'campaigns',
  timestamps: true,
  indexes: [
    { fields: ['slug'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Campaign;
