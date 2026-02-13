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
                    identifiers: ['Pc_install', 'S_Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trail: {
                    identifiers: ['Pc_Trial', 'S_Trial'],
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
            id: 'master-tv',
            slug: 'master-tv', // Friendly URL slug
            name: 'Master TV pro campaign',
            description: 'Install > buy Trail',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://aff.pro-campaign.in/c',
                offerId: 44,
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
                    identifiers: ['M_Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trail: {
                    identifiers: ['M_Trail'],
                    displayName: 'Trail Purchase',
                    amount: 23
                },

            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Master TV',
                tagline: 'Install and Buy Trail get 23 rupees',
                campaignDisplayName: 'Master TV Offer'
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
                    title: 'Welcome to Master TV Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Master TV Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Master TV offer',
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
                tagline: 'Install and Purchase Trial get 15 rupees',
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
            id: 'incred-gold',
            slug: 'incred-gold', // Friendly URL slug
            name: 'Incred Gold pro campaign',
            description: 'Install > buy Gold',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://aff.pro-campaign.in/c',
                offerId: 49,
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
                    identifiers: ['Inc_Install'],
                    displayName: 'Install',
                    amount: 0
                },
                trail: {
                    identifiers: ['Inc_Purchase'],
                    displayName: 'Trail Purchase',
                    amount: 16
                },

            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Incred Gold',
                tagline: 'Install and Buy Gold get 16 rupees',
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
            id: 'story-tv-aug24',
            slug: 'story-tv-aug24', // Friendly URL slug
            name: 'Story TV  Campaign',
            description: 'Install > Login > Trial Payment',

            // Campaign status
            isActive: true,
            affiliate: {
                baseUrl: 'https://track.affilify.in/nclk/mvkpn/kqfqr',
                offerId: 156,
                affiliateId: null,
                clickIdParam: 'click_id',
                // Custom link builder for this network
                buildLink: function (userId) {
                    const randomClickId = Math.floor(1000000000 + Math.random() * 9000000000); // Random 10-digit number
                    return `${this.baseUrl}?click_id=${randomClickId}&sub2=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            // Map the network's parameter names to our internal system
            postbackMapping: {
                userId: 'subid2',          // Network sends: subid2 (we sent mobile here)
                payment: 'payout',            // Network sends: payout
                eventName: 'goal_id',         // Network sends: goal_id
                offerId: 'offer_id',          // Network sends: offer_id (optio
                ipAddress: 'ip',
                timestamp: 'order_date'
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
                    identifiers: ['trial_payment_successful'],
                    displayName: 'Trial Payment',
                    amount: 25
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'Story TV',
                tagline: 'Install and Complete Trial',
                campaignDisplayName: 'Story TV  Offer'
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
                    title: 'Welcome to Story TV 24 Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Story TV 24 Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Story TV 24 offer',
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
