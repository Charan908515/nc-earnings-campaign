const { sequelize } = require('./sequelize');
require('../models');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ MySQL Connected Successfully');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
