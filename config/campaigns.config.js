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


        {
            id: 'story-max',
            slug: 'story-max', // Friendly URL slug
            name: 'Story Max Campaign',
            description: 'Install > Trial Purchase',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://adzaffi.com/click.php',
                offerId: 13,
                affiliateId: 7,
                clickIdParam: 'sub1',
                // Custom link builder for AdzAffi network
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&sub1=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            // Map the network's parameter names to our internal system
            postbackMapping: {
                userId: 'sub1',          // Network sends: sub1
                payment: 'payout',            // Network sends: payout
                eventName: 'event',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'tdate'        // Network sends: tdate (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trial: {
                    identifiers: ['Trial_purchased', 'trial_purchased'],
                    displayName: 'Trial Purchase',
                    amount: 20
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Story Max',
                tagline: 'Install and Purchase Trial get 20 rupees',
                campaignDisplayName: 'Story Max Offer'
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
                    title: 'Welcome to Story Max Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Story Max Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Story Max offer',
                        'Get notified when your postback arrives',
                        'Check your wallet for earnings'
                    ]
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

        {
            id: 'story-tv-adzaffi',
            slug: 'story-max-adzaffi', // Friendly URL slug
            name: 'Story TV Campaign',
            description: 'Install > Trial Purchase',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://adzaffi.com/click.php',
                offerId: 14,
                affiliateId: 7,
                clickIdParam: 'sub1',
                // Custom link builder for AdzAffi network
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&sub1=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            // Map the network's parameter names to our internal system
            postbackMapping: {
                userId: 'sub1',          // Network sends: sub1
                payment: 'payout',            // Network sends: payout
                eventName: 'event',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'tdate'        // Network sends: tdate (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trial: {
                    identifiers: ['Trial_purchased', 'trial_purchased'],
                    displayName: 'Trial Purchase',
                    amount: 25
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Story TV',
                tagline: 'Install and Purchase Trial get 25 rupees',
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
                },
                help: {
                    title: 'Story TV Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Story TV offer',
                        'Get notified when your postback arrives',
                        'Check your wallet for earnings'
                    ]
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



        {
            id: 'incred-gold',
            slug: 'incred-gold', // Friendly URL slug
            name: 'Incred Gold Campaign',
            description: 'Install > Gold Purchase',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://Cashpayout-ads.gotracking.in/click/',
                offerId: 67,
                affiliateId: 8,
                clickIdParam: 'p1',
                buildLink: function (userId) {
                    return `${this.baseUrl}?pid=${this.offerId}&cid=${this.affiliateId}&p1=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            postbackMapping: {
                userId: 'p1',          // Network sends: sub1
                payment: 'payout',            // Network sends: payout
                eventName: 'event_name',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'tdate'        // Network sends: tdate (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Default'],
                    displayName: 'Install',
                    amount: 0
                },
                trial: {
                    identifiers: ['Trial_purchased', 'Gold_purchase'],
                    displayName: 'Trial Purchase',
                    amount: 13
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Incred Gold',
                tagline: 'Install and Purchase Gold for 11 rupees and get 13 rupees',
                campaignDisplayName: 'Incred Gold Offer'
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
                    title: 'Welcome to Incred Gold Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Incred Gold Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Incred Gold offer',
                        'Get notified when your postback arrives',
                        'Check your wallet for earnings'
                    ]
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


        {
            id: 'waves',
            slug: 'waves', // Friendly URL slug
            name: 'Waves Campaign',
            description: 'Welcome to Waves Campaign',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://Cashpayout-ads.gotracking.in/click/',
                offerId: 67,
                affiliateId: 6,
                clickIdParam: 'p1',
                buildLink: function (userId) {
                    return `${this.baseUrl}?pid=${this.offerId}&cid=${this.affiliateId}&p1=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            postbackMapping: {
                userId: 'p1',          // Network sends: sub1
                payment: 'payout',            // Network sends: payout
                eventName: 'event_name',           // Network sends: event
                offerId: 'offer_id',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'tdate'        // Network sends: tdate (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Default'],
                    displayName: 'Payment Tracked',
                    amount: 3
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Waves',
                tagline: 'Welcome to Waves Campaign',
                campaignDisplayName: 'Waves Offer'
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
                    title: 'Welcome to Waves Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Waves Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Incred Gold offer',
                        'Get notified when your postback arrives',
                        'Check your wallet for earnings'
                    ]
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
