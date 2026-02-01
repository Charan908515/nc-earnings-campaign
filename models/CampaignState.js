const mongoose = require('mongoose');

const CampaignStateSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Update lastModified on save
CampaignStateSchema.pre('save', function (next) {
    this.lastModified = Date.now();
    next();
});

module.exports = mongoose.model('CampaignState', CampaignStateSchema);
