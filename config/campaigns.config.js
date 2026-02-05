/**
 * ============================================
 * 🌍 UNIVERSAL MULTI-CAMPAIGN CONFIGURATION
 * ============================================
 * 
 * This file allows you to manage MULTIPLE campaigns from ANY affiliate network.
 * 
 * HOW TO USE:
 * 1. Add your campaign to the 'campaigns' array below
 * 2. access via /c/campaign-id
 * 
 */

module.exports = {
    // ============================================
    // 📋 CAMPAIGN DEFINITIONS
    // ============================================
    campaigns: [
        // ========================================
        // EXAMPLE 1: Offers24.in Network
        // ========================================
        {
            id: 'story-tv',
            slug: 'story-tv', // Friendly URL slug
            name: 'Story TV pro campaign',
            description: 'Install > buy Trail',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://aff.pro-campaign.in/c',
                offerId: 47,
                affiliateId: 49,
                clickIdParam: 'aff_click_id',
                // Legacy support if needed server-side
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}&sub_aff_id="Chakri"`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            // Map the network's parameter names to our internal system
            postbackMapping: {
                userId: 'aff_click_id',          // Network sends: click_id
                payment: 'payout',            // Network sends: payout
                eventName: 'event_name',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 't_time'        // Network sends: timestamp (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Pc_install', 'install', 'app_install', 'Install','S_Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trail: {
                    identifiers: ['Pc_Trial', 'S_Trial','trial', 'registration', 'Register'],
                    displayName: 'Trail Purchase',
                    amount: 25
                },

            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Story TV',
                tagline: 'Install and Buy Trail get 25 rupees',
                campaignDisplayName: 'Story TV Offer'
            },

            // ----------------------------------------
            // 📱 USER INPUT CONFIGURATION
            // ----------------------------------------
            userInput: {
                fieldType: 'mobile',  // 'mobile' or 'upi'
                extractMobileFromUPI: true,  // Extract mobile from UPI ID for click_id

                mobile: {
                    label: 'Your Mobile Number',
                    placeholder: 'Enter 10-digit mobile number',
                    maxLength: 10,
                    pattern: '[0-9]{10}',
                    errorMessage: 'Please enter a valid 10-digit mobile number'
                },

                upi: {
                    label: 'Your UPI ID',
                    placeholder: 'Enter your UPI ID (e.g., 9876543210@paytm)',
                    maxLength: 50,
                    pattern: '[a-zA-Z0-9.\\-_]{2,}@[a-zA-Z]{2,}',
                    errorMessage: 'Please enter a valid UPI ID'
                }
            },

            // ----------------------------------------
            // 📱 TELEGRAM SETTINGS
            // ----------------------------------------
            telegram: {
                botUsername: 'ncearnings123bot',
                welcomeMessage: {
                    title: 'Welcome to Story TV Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                }
            },

            // ----------------------------------------
            // ⚙️ ADDITIONAL SETTINGS
            // ----------------------------------------
            settings: {
                enableDuplicateDetection: false,
                verboseLogging: true,
                timezone: 'Asia/Kolkata',
                dateLocale: 'en-IN',
                currency: '₹',
                minWithdrawal: 100
            }
        }
    ],

    // ============================================
    // 🔧 HELPER FUNCTIONS
    // ============================================

    /**
     * Get campaign by Slug or ID
     */
    getCampaign: function (slugOrId) {
        if (!slugOrId) return this.campaigns[0]; // Default to first
        return this.campaigns.find(c => c.slug === slugOrId || c.id === slugOrId) || this.campaigns[0];
    },

    /**
     * Strict campaign lookup (returns undefined if not found)
     */
    getCampaignStrict: function (slugOrId) {
        return this.campaigns.find(c => c.slug === slugOrId || c.id === slugOrId);
    },

    /**
     * Get campaign by ID (Legacy support)
     */
    getCampaignById: function (campaignId) {
        return this.campaigns.find(c => c.id === campaignId);
    },

    /**
     * Get Active Campaign (Legacy support - returns first active or first)
     */
    getActiveCampaign: function () {
        return this.campaigns.find(c => c.isActive) || this.campaigns[0];
    }
};


