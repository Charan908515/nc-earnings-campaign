const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['S-install', 'S_trail', 'Install', 'Trial Purchase', 'Pc_Install', 'Pc_Trial']
    },
    payment: {
        type: Number,
        required: true
    },
    offerId: {
        type: String,
        default: ''
    },
    subId: {
        type: String,
        default: ''
    },
    ipAddress: {
        type: String,
        default: ''
    },
    clickTime: {
        type: Date,
        default: null
    },
    conversionTime: {
        type: Date,
        default: null
    },
    campaignSlug: {
        type: String,
        default: ''
    },
    campaignName: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Earning', earningSchema);
