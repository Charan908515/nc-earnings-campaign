const User = require('./User');
const Earning = require('./Earning');
const Withdrawal = require('./Withdrawal');
const Campaign = require('./Campaign');
const CampaignState = require('./CampaignState');
const TelegramUser = require('./TelegramUser');
const TelegramVerification = require('./TelegramVerification');

User.hasMany(Earning, { foreignKey: 'userId' });
Earning.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Withdrawal, { foreignKey: 'userId' });
Withdrawal.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Earning,
  Withdrawal,
  Campaign,
  CampaignState,
  TelegramUser,
  TelegramVerification
};
