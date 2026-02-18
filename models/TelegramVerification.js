const mongoose = require('mongoose');

const telegramVerificationSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    upiId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Token expires in 5 minutes
    }
});

module.exports = mongoose.model('TelegramVerification', telegramVerificationSchema);
