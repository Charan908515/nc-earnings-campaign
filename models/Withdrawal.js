const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    upiId: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
