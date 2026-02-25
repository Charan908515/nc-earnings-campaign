const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// Public config endpoint (sanitized - no secrets)
router.get('/public', async (req, res) => {
    try {
        const { slug } = req.query;
        // Strict Lookup from DB
        let activeCampaign = await Campaign.findOne({ slug });

        if (!activeCampaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Check if campaign is suspended
        if (!activeCampaign.isActive) {
            return res.status(503).json({ error: 'Campaign is suspended' });
        }

        // Convert events array to object for frontend compatibility
        const eventsObj = activeCampaign.getEventsObject();

        // Return only public-safe configuration
        const publicConfig = {
            campaign: {
                name: activeCampaign.name,
                displayTitle: `${activeCampaign.name} Campaign`,
                description: activeCampaign.description,
                isActive: activeCampaign.isActive,
                branding: activeCampaign.branding,
                process: activeCampaign.process
            },
            userInput: activeCampaign.userInput,
            affiliate: {
                baseUrl: activeCampaign.affiliate.affiliateUrl || activeCampaign.affiliate.baseUrl,
                clickIdParam: activeCampaign.affiliate.userIdParam || activeCampaign.affiliate.clickIdParam
            },
            ui: {
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
                currency: activeCampaign.settings.currency || '₹',
                minWithdrawal: activeCampaign.settings.minWithdrawal || 30
            }
        };

        res.json(publicConfig);
    } catch (error) {
        console.error('Error serving config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Generate affiliate link securely using server-side logic
router.get('/generate-link', async (req, res) => {
    try {
        const { slug, userId } = req.query;

        if (!slug || !userId) {
            return res.status(400).json({ error: 'Missing slug or userId' });
        }

        const campaign = await Campaign.findOne({ slug });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (!campaign.isActive) {
            return res.status(403).json({ error: 'Campaign is not active' });
        }

        // Use the campaign's buildLink method
        const link = campaign.buildLink(userId);
        if (!link) {
            console.warn(`Campaign ${slug} missing affiliate URL.`);
            return res.status(500).json({ error: 'Link generation not configured for this campaign' });
        }

        return res.json({ success: true, link });

    } catch (error) {
        console.error('Error generating link:', error);
        res.status(500).json({ error: 'Failed to generate link' });
    }
});

module.exports = router;
