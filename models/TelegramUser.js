const mongoose = require('mongoose');

const telegramUserSchema = new mongoose.Schema({
    chat_id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone_number: {
        type: String,
        required: true,
        index: true
    },
    registered_at: {
        type: Date,
        default: Date.now
    },
    last_query: {
        type: Date
    },
    notifications_enabled: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('TelegramUser', telegramUserSchema);
