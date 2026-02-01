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
            id: 'angle_one_offers24',
            slug: 'angle-one', // Friendly URL slug
            name: 'Angle One - Offers24',
            description: 'Install > Register > Open Demat Account',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://publisher.offers24.in/click.php',
                offerId: 276,
                affiliateId: 475,
                clickIdParam: 'aff_click_id',
                // Legacy support if needed server-side
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            // Map the network's parameter names to our internal system
            postbackMapping: {
                userId: 'click_id',          // Network sends: click_id
                payment: 'payout',            // Network sends: payout
                eventName: 'event',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'timestamp'        // Network sends: timestamp (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['install', 'app_install', 'Install'],
                    displayName: 'Install',
                    amount: 0
                },
                register: {
                    identifiers: ['register', 'registration', 'Register'],
                    displayName: 'Registration',
                    amount: 0
                },
                account_open: {
                    identifiers: ['Account_Open', 'account_open', 'Accoun_open', 'demat_open'],
                    displayName: 'Account Open',
                    amount: 350
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'ANGLE ONE',
                tagline: 'Start Trading Campaign',
                campaignDisplayName: 'Angle One Offer'
            },

            // ----------------------------------------
            // 📱 USER INPUT CONFIGURATION
            // ----------------------------------------
            userInput: {
                fieldType: 'upi',  // 'mobile' or 'upi'
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
                    title: 'Welcome to Angle One Campaign!',
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
        },

        // ========================================
        // EXAMPLE 2: CashCamps Network
        // ========================================
        {
            id: 'story_tv_cashcamps',
            slug: 'story-tv',
            name: 'Story TV - CashCamps',
            description: 'Subscribe to Story TV and earn',
            isActive: true, // Activated for multi-campaign support

            affiliate: {
                baseUrl: 'https://panel.cashcamps.in/go',
                offerId: 50,
                affiliateId: 128,
                clickIdParam: 'click_id',
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}`;
                }
            },

            // CashCamps uses similar parameters
            postbackMapping: {
                userId: 'click_id',
                payment: 'payout',
                eventName: 'event',
                offerId: 'offerid',  // Note: different spelling
                ipAddress: 'ip',
                userId2: 'user_id'   // Some networks send additional user identifiers
            },

            events: {
                install: {
                    identifiers: ['install'],
                    displayName: 'Install',
                    amount: 0
                },
                trial: {
                    identifiers: ['trial', 'subscription', 'subscribe'],
                    displayName: 'Trial Purchase',
                    amount: 25
                }
            },

            branding: {
                logoText: 'STORY TV',
                tagline: 'Start Campaign',
                campaignDisplayName: 'Story TV Offer' // Branding name
            },

            userInput: {
                fieldType: 'upi',
                extractMobileFromUPI: true,
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

            settings: {
                enableDuplicateDetection: false,
                verboseLogging: true,
                timezone: 'Asia/Kolkata',
                dateLocale: 'en-IN',
                currency: '₹',
                minWithdrawal: 100
            }
        },

        // ========================================
        // EXAMPLE 3: OsamCamp Network
        // ========================================
        {
            id: 'angle_one_osamcamp',
            slug: 'master', // As requested by user "master from another camp"
            name: 'Angle One - OsamCamp',
            description: 'Open Demat Account',
            isActive: true,

            affiliate: {
                baseUrl: 'https://partner.osamcamp.in/go',
                offerId: 50,
                affiliateId: 128,
                clickIdParam: 'p1',
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}`;
                }
            },

            // OsamCamp uses different parameter names
            postbackMapping: {
                userId: 'p1',              // OsamCamp uses p1 instead of click_id
                payment: 'payout',
                eventName: 'event',
                offerId: 'offerid',
                ipAddress: 'ip'
            },

            events: {
                install: {
                    identifiers: ['install', 'Install'],
                    displayName: 'Install',
                    amount: 0
                },
                account_open: {
                    identifiers: ['Accoun_open', 'account_open', 'Basi_Details_filled'],
                    displayName: 'Account Open',
                    amount: 350
                }
            },

            branding: {
                logoText: 'MASTER',
                tagline: 'Start Trading',
                campaignDisplayName: 'Master Campaign'
            },

            userInput: {
                fieldType: 'mobile',
                extractMobileFromUPI: false,
                mobile: {
                    label: 'Your Mobile Number',
                    placeholder: 'Enter 10-digit mobile number',
                    maxLength: 10,
                    pattern: '[0-9]{10}',
                    errorMessage: 'Please enter a valid 10-digit mobile number'
                },
                upi: {
                    label: 'Your UPI ID',
                    placeholder: 'Enter your UPI ID',
                    maxLength: 50,
                    pattern: '[a-zA-Z0-9.\\-_]{2,}@[a-zA-Z]{2,}',
                    errorMessage: 'Please enter a valid UPI ID'
                }
            },

            telegram: {
                botUsername: 'ncearnings123bot',
                welcomeMessage: {
                    title: 'Welcome to Master Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                }
            },

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
