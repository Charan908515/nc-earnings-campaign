const express = require('express');
const router = express.Router();
const campaignConfig = require('../config/campaigns.config');
const CampaignState = require('../models/CampaignState');

// Public config endpoint (sanitized - no secrets)
router.get('/public', async (req, res) => {
    try {
        const { slug } = req.query;
        // Strict Lookup
        let activeCampaign = campaignConfig.getCampaignStrict(slug);

        if (!activeCampaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // DB State Check
        const state = await CampaignState.findOne({ slug });
        if (state && !state.isActive) {
            return res.status(503).json({ error: 'Campaign is suspended' });
        }

        // Return only public-safe configuration
        const publicConfig = {
            campaign: {
                name: activeCampaign.name,
                displayTitle: `${activeCampaign.name} Campaign`,
                description: activeCampaign.description,
                isActive: activeCampaign.isActive,
                branding: activeCampaign.branding
            },
            userInput: activeCampaign.userInput,
            userInput: activeCampaign.userInput,
            affiliate: {
                // Return generic structure or empty if handled via specific endpoints
                // The frontend likely expects these, but if they are inside a function in config, we can't send them easily.
                // We will rely on the frontend loader to request a link generation or we will refactor config later.
                // For now, returning safe defaults from activeCampaign if available, or empty.
                ...activeCampaign.affiliate
            },
            ui: activeCampaign.ui || {
                submitButtonText: 'Proceed to Offer',
                walletLinkText: 'Check Earnings / Wallet',
                messages: {
                    registrationSuccess: 'Registration Successful!',
                    updateSuccess: 'Phone Number Updated!',
                    notificationsDisabled: 'Notifications Disabled',
                    campaignOver: 'Campaign is Over'
                }
            },
            payments: {
                // Extract currency/minWithdrawal from settings if available
                currency: activeCampaign.settings.currency || '₹',
                minWithdrawal: activeCampaign.settings.minWithdrawal || 100
            }
        };

        res.json(publicConfig);
    } catch (error) {
        console.error('Error serving config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Generate affiliate link securely using server-side logic
router.get('/generate-link', (req, res) => {
    try {
        const { slug, userId } = req.query;

        if (!slug || !userId) {
            return res.status(400).json({ error: 'Missing slug or userId' });
        }

        const campaign = campaignConfig.getCampaignStrict(slug);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (!campaign.isActive) {
            return res.status(403).json({ error: 'Campaign is not active' });
        }

        // Use the campaign's buildLink function if it exists
        if (campaign.affiliate && typeof campaign.affiliate.buildLink === 'function') {
            const link = campaign.affiliate.buildLink(userId);
            return res.json({ success: true, link });
        } else {
            // Fallback if no buildLink function is defined (should not happen for properly configured campaigns)
            // But we can construct a basic one based on standard params if needed, or return error.
            // For safety and strictness, let's return an error if buildLink is missing, encouraging proper config.
            console.warn(`Campaign ${slug} missing buildLink function.`);
            return res.status(500).json({ error: 'Link generation not configured for this campaign' });
        }

    } catch (error) {
        console.error('Error generating link:', error);
        res.status(500).json({ error: 'Failed to generate link' });
    }
});

module.exports = router;
