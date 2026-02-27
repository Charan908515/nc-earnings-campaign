const bcrypt = require('bcryptjs');
const { DataTypes } = require('../config/sequelize');
const { sequelize } = require('../config/sequelize');
const { ObjectId } = require('bson');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    defaultValue: () => new ObjectId().toHexString()
  },
  upiId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  mobileNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: null
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'user'
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  availableBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
