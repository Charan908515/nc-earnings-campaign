const mongoose = require('mongoose');

// Sub-schemas for nested objects
const EventSchema = new mongoose.Schema({
    key: { type: String, required: true },
    identifiers: [{ type: String }],
    displayName: { type: String, default: '' },
    amount: { type: Number, default: 0 }
}, { _id: false });

const CampaignSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    wallet_display: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    process: [{
        type: String
    }],

    // Affiliate link config
    affiliate: {
        baseUrl: { type: String, default: '' },
        affiliateUrl: { type: String, default: '' },
        offerId: { type: Number, default: 0 },
        affiliateId: { type: Number, default: 0 },
        clickIdParam: { type: String, default: 'p1' },
        userIdParam: { type: String, default: 'p1' }
    },

    // Postback parameter mapping
    postbackMapping: {
        userId: { type: String, default: 'sub1' },
        payment: { type: String, default: 'payout' },
        eventName: { type: String, default: 'event' },
        offerId: { type: String, default: 'offer_id' },
        ipAddress: { type: String, default: 'ip' },
        timestamp: { type: String, default: 'tdate' }
    },

    // Events array
    events: [EventSchema],

    // Branding
    branding: {
        logoText: { type: String, default: '' },
        tagline: { type: String, default: '' },
        campaignDisplayName: { type: String, default: '' }
    },

    // User input config
    userInput: {
        fieldType: { type: String, default: 'mobile' },
        extractMobileFromUPI: { type: Boolean, default: true },
        mobile: {
            label: { type: String, default: 'Your Mobile Number' },
            placeholder: { type: String, default: 'Enter 10-digit mobile number' },
            maxLength: { type: Number, default: 10 },
            pattern: { type: String, default: '[0-9]{10}' },
            errorMessage: { type: String, default: 'Please enter a valid 10-digit mobile number' }
        },
        upi: {
            label: { type: String, default: 'Your UPI ID' },
            placeholder: { type: String, default: 'Enter your UPI ID (e.g., 9876543210@paytm)' },
            maxLength: { type: Number, default: 50 },
            pattern: { type: String, default: '[a-zA-Z0-9.\\\\-_]{2,}@[a-zA-Z]{2,}' },
            errorMessage: { type: String, default: 'Please enter a valid UPI ID' }
        }
    },

    // Telegram settings
    telegram: {
        botUsername: { type: String, default: 'ncearnings123bot' },
        welcomeMessage: {
            title: { type: String, default: '' },
            description: { type: String, default: 'To register and get notifications:' }
        },
        notification: {
            title: { type: String, default: 'NEW CASHBACK RECEIVED!' },
            showCumulativeEarnings: { type: Boolean, default: true },
            footer: { type: String, default: 'Powered by @NC Earnings' }
        },
        help: {
            title: { type: String, default: '' },
            howItWorks: [{ type: String }]
        }
    },

    // Additional settings
    settings: {
        enableDuplicateDetection: { type: Boolean, default: false },
        verboseLogging: { type: Boolean, default: true },
        timezone: { type: String, default: 'Asia/Kolkata' },
        dateLocale: { type: String, default: 'en-IN' },
        currency: { type: String, default: '₹' },
        minWithdrawal: { type: Number, default: 30 }
    }
}, {
    timestamps: true
});

/**
 * Build the affiliate link for a given userId.
 * Replaces the old buildLink function that was stored in the config file.
 */
CampaignSchema.methods.buildLink = function (userId) {
    const url = this.affiliate.affiliateUrl || this.affiliate.baseUrl || '';
    const param = this.affiliate.userIdParam || this.affiliate.clickIdParam || 'p1';
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${param}=${userId}`;
};

/**
 * Convert events array to the object format expected by postback handler.
 * The old config used an object like { install: { identifiers: [...], ... } }
 * The DB stores events as an array with a 'key' field.
 */
CampaignSchema.methods.getEventsObject = function () {
    const eventsObj = {};
    if (this.events && this.events.length > 0) {
        this.events.forEach(evt => {
            eventsObj[evt.key] = {
                identifiers: evt.identifiers,
                displayName: evt.displayName,
                amount: evt.amount
            };
        });
    }
    return eventsObj;
};

// Index for fast lookups
CampaignSchema.index({ slug: 1 });
CampaignSchema.index({ id: 1 });
CampaignSchema.index({ isActive: 1 });

module.exports = mongoose.model('Campaign', CampaignSchema);
