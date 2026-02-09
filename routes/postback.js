const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Earning = require('../models/Earning');
const { sendUserNotification } = require('../config/telegram');
const campaignsConfig = require('../config/campaigns.config');

// Get campaign by offer ID
const getCampaignByOfferId = (offerId) => {
    return campaignsConfig.campaigns.find(c => String(c.affiliate.offerId) === String(offerId));
};

// Get active campaign based on request (cid fallback)
const getCampaign = (cid) => campaignsConfig.getCampaign(cid);

// Postback receiver endpoint - Universal handler for any affiliate network
router.get('/', async (req, res) => {
    try {
        const { cid, offer_id } = req.query;

        // Try to find campaign by offer_id first (more reliable), then fall back to cid
        let activeCampaign = null;
        if (offer_id) {
            activeCampaign = getCampaignByOfferId(offer_id);
            if (activeCampaign) {
                console.log(`🔍 Campaign detected by offer_id ${offer_id}: ${activeCampaign.name}`);
            }
        }

        // Fall back to cid if offer_id didn't match
        if (!activeCampaign) {
            activeCampaign = getCampaign(cid);
            if (activeCampaign) {
                console.log(`🔍 Campaign detected by cid ${cid}: ${activeCampaign.name}`);
            }
        }

        if (!activeCampaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const { postbackMapping, events, settings, slug, name } = activeCampaign;

        // Verify Secret Key
        const secret = req.query.secret;
        if (secret !== process.env.POSTBACK_SECRET) {
            console.log(`⛔ Unauthorized Postback Attempt: Invalid Secret '${secret || 'MISSING'}'`);
            return res.status(403).json({
                success: false,
                message: 'Invalid or missing secret key'
            });
        }

        // ============================================
        // 🔄 UNIVERSAL PARAMETER MAPPING
        // ============================================
        // Extract values using the campaign's parameter mapping
        const extractedData = {};

        for (const [internalKey, networkParam] of Object.entries(postbackMapping)) {
            extractedData[internalKey] = req.query[networkParam];
        }

        const {
            userId,
            payment: networkPayment,
            eventName,
            offerId,
            ipAddress,
            timestamp
        } = extractedData;

        if (settings.verboseLogging) {
            console.log('\n' + '='.repeat(60));
            console.log('📥 POSTBACK RECEIVED');
            console.log('='.repeat(60));
            console.log('🎯 Campaign:', activeCampaign.name);
            console.log('📱 User ID:', userId);
            console.log('🎪 Event Name:', eventName);
            console.log('💰 Network Payment:', networkPayment);
            console.log('🆔 Offer ID:', offerId);
            console.log('🌐 IP Address:', ipAddress);
            console.log('📋 Full Query:', JSON.stringify(req.query, null, 2));
            console.log('🔄 Mapped Data:', JSON.stringify(extractedData, null, 2));
            console.log('='.repeat(60) + '\n');
        }

        // Validate required parameters
        if (!userId || !eventName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: userId and eventName'
            });
        }

        // ============================================
        // 👤 FIND USER
        // ============================================
        let user = null;

        // Try to find user by mobile number first
        user = await User.findOne({ mobileNumber: userId });

        // If not found, try finding by UPI ID
        if (!user) {
            user = await User.findOne({ upiId: userId });
            if (user) {
                console.log(`🔍 Found user by UPI ID: ${userId}`);
            }
        }

        if (!user) {
            console.log(`⚠️ User not found for identifier: ${userId}`);
            console.log(`   Searched in both mobileNumber and upiId fields`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log(`✅ Found user with UPI ID: ${user.upiId} (searched with: ${userId})`);

        // ============================================
        // 💰 DETERMINE PAYMENT BASED ON EVENT
        // ============================================
        const normalizedEvent = eventName ? eventName.toLowerCase() : '';

        let payment = 0;
        let standardizedEventName = eventName;
        let foundEvent = false;

        // Check all event definitions in the campaign
        for (const [eventKey, eventData] of Object.entries(events)) {
            const identifiers = eventData.identifiers.map(id => id.toLowerCase());

            if (identifiers.includes(normalizedEvent)) {
                payment = eventData.amount;
                standardizedEventName = eventData.displayName;
                foundEvent = true;
                console.log(`✅ Event matched: ${eventKey} -> ${standardizedEventName} (${settings.currency}${payment})`);
                break;
            }
        }

        if (!foundEvent) {
            console.log(`⚠️ Unknown event type: ${eventName} - Recording with ${settings.currency}0 payment`);
            payment = 0;
        }

        // ============================================
        // 💾 CREATE EARNING RECORD
        // ============================================
        const earning = new Earning({
            userId: user._id,
            mobileNumber: user.mobileNumber || userId,
            eventType: standardizedEventName,
            payment: payment,
            offerId: offerId || '',
            subId: req.query.sub_aff_id || req.query.sub1 || '',
            ipAddress: ipAddress || req.ip || '',
            clickTime: (timestamp && timestamp !== 'null' && !isNaN(parseInt(timestamp))) ? new Date(parseInt(timestamp) * 1000) : null,
            conversionTime: new Date(),
            campaignSlug: slug,
            campaignName: name
        });

        await earning.save();

        // Update user's earnings
        user.totalEarnings += payment;
        user.availableBalance += payment;
        await user.save();

        // ============================================
        // 📱 SEND TELEGRAM NOTIFICATION
        // ============================================
        try {
            const now = new Date();
            await sendUserNotification({
                phone_number: user.upiId || user.mobileNumber,
                amount: payment,
                status: standardizedEventName,
                campaign: activeCampaign.branding.campaignDisplayName,
                date: now.toLocaleDateString(settings.dateLocale, {
                    timeZone: settings.timezone
                }),
                time: now.toLocaleTimeString(settings.dateLocale, {
                    timeZone: settings.timezone
                })
            });
        } catch (telegramError) {
            console.error('⚠️  Telegram notification failed:', telegramError.message);
            // Don't fail the postback if Telegram fails
        }

        res.json({
            success: true,
            message: 'Postback processed successfully',
            data: {
                campaign: activeCampaign.name,
                upiId: user.upiId,
                mobileNumber: user.mobileNumber,
                eventType: standardizedEventName,
                payment,
                newBalance: user.availableBalance
            }
        });
    } catch (error) {
        console.error('❌ Postback processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing postback'
        });
    }
});

module.exports = router;
