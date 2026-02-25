/**
 * Seed existing campaigns from campaigns.config.js into MongoDB.
 * Only runs if no campaigns exist in the DB yet.
 */
const Campaign = require('../models/Campaign');
const campaignsConfig = require('../config/campaigns.config');

async function seedCampaigns() {
    try {
        const count = await Campaign.countDocuments();
        if (count > 0) {
            console.log(`📋 ${count} campaign(s) already in DB, skipping seed.`);
            return;
        }

        console.log('🌱 Seeding campaigns from config file...');

        for (const camp of campaignsConfig.campaigns) {
            // Convert events object to array format
            const eventsArray = [];
            if (camp.events && typeof camp.events === 'object') {
                for (const [key, val] of Object.entries(camp.events)) {
                    eventsArray.push({
                        key,
                        identifiers: val.identifiers || [],
                        displayName: val.displayName || '',
                        amount: val.amount || 0
                    });
                }
            }

            // Build the full affiliate URL by calling buildLink to get the real link
            // Then store the base (without userId value) so the model's buildLink method works
            let affiliateUrl = camp.affiliate?.baseUrl || '';
            let userIdParam = camp.affiliate?.clickIdParam || 'p1';

            if (typeof camp.affiliate?.buildLink === 'function') {
                try {
                    // Call with correct `this` context so this.baseUrl etc. resolve
                    const fullLink = camp.affiliate.buildLink.call(camp.affiliate, 'SEED_PLACEHOLDER');
                    // Store the URL up to (but not including) the userId value
                    // e.g. "https://...?o=99&a=128&p1=SEED_PLACEHOLDER" -> "https://...?o=99&a=128"
                    const paramPattern = new RegExp(`[&?]${userIdParam}=SEED_PLACEHOLDER$`);
                    affiliateUrl = fullLink.replace(paramPattern, '');
                    console.log(`  🔗 Extracted affiliate URL: ${affiliateUrl}`);
                } catch (e) {
                    console.log(`  ⚠️ Could not extract URL from buildLink for ${camp.name}, using baseUrl`);
                }
            }

            const campaignDoc = new Campaign({
                id: camp.id,
                slug: camp.slug,
                name: camp.name,
                wallet_display: camp.wallet_display || '',
                description: camp.description || '',
                isActive: camp.isActive !== false,
                process: camp.process || [],
                affiliate: {
                    baseUrl: camp.affiliate?.baseUrl || '',
                    affiliateUrl: affiliateUrl,
                    offerId: camp.affiliate?.offerId || 0,
                    affiliateId: camp.affiliate?.affiliateId || 0,
                    clickIdParam: userIdParam,
                    userIdParam: userIdParam
                },
                postbackMapping: {
                    userId: camp.postbackMapping?.userId || 'sub1',
                    payment: camp.postbackMapping?.payment || 'payout',
                    eventName: camp.postbackMapping?.eventName || 'event',
                    offerId: camp.postbackMapping?.offerId || 'offer_id',
                    ipAddress: camp.postbackMapping?.ipAddress || 'ip',
                    timestamp: camp.postbackMapping?.timestamp || 'tdate'
                },
                events: eventsArray,
                branding: {
                    logoText: camp.branding?.logoText || camp.name,
                    tagline: camp.branding?.tagline || '',
                    campaignDisplayName: camp.branding?.campaignDisplayName || camp.name + ' Offer'
                },
                userInput: camp.userInput || {},
                telegram: camp.telegram || {},
                settings: camp.settings || {}
            });

            await campaignDoc.save();
            console.log(`  ✅ Seeded: ${camp.name} (slug: ${camp.slug})`);
        }

        console.log('🌱 Campaign seeding complete!');
    } catch (error) {
        console.error('❌ Campaign seeding error:', error.message);
    }
}

module.exports = seedCampaigns;
