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
        enum: (() => {
            // Dynamically load all event displayNames from campaigns config
            const campaignsConfig = require('../config/campaigns.config');
            const eventNames = [];
            for (const campaign of campaignsConfig.campaigns) {
                if (campaign.events) {
                    for (const eventKey of Object.keys(campaign.events)) {
                        const displayName = campaign.events[eventKey].displayName;
                        if (displayName && !eventNames.includes(displayName)) {
                            eventNames.push(displayName);
                        }
                    }
                }
            }
            return eventNames;
        })()
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
