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
            wallet_display: 'Story Max',
            slug: 'story-max', // Friendly URL slug
            name: 'Story Max Campaign adzaffi',
            description: 'Install > Trial Purchase',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 📝 CAMPAIGN PROCESS
            // ----------------------------------------
            process: [
                "Register with your Mobile Number",
                "Install the Story Max App",
                "Register & Complete Trial Purchase",
                "Cashback will be added to wallet"
            ],

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
                minWithdrawal: 30
            }
        },

        {
            id: 'incred-gold',
            wallet_display: 'Incred Gold',
            slug: 'incred-gold',
            name: 'Incred Gold Campaign cashout',
            description: 'Install > Gold Purchase',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 📝 CAMPAIGN PROCESS
            // ----------------------------------------
            process: [
                "Register with your Mobile Number",
                "Install the Incred App",
                "Purchase Gold for ₹11",
                "Get ₹13 Cashback in Wallet"
            ],

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
                minWithdrawal: 30
            }
        },


        {
            id: 'waves',
            wallet_display: 'Waves',
            slug: 'waves',
            name: 'Waves Campaign cashout',
            description: 'Welcome to Waves Campaign',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 📝 CAMPAIGN PROCESS
            // ----------------------------------------
            process: [
                "Register with your Mobile Number",
                "Install the Waves App",
                "Complete Registration",
                "Cashback will be added to wallet"
            ],

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
                minWithdrawal: 30
            }
        },


        {
            id: 'story-tv-visioncamp',
            wallet_display: 'Story TV',
            slug: 'story-tv',
            name: 'Story TV Campaign visioncamp',
            description: 'Install > Trial Purchase',

            isActive: true,

            process: [
                "Install the Story TV App",
                "Register & Complete Trial Purchase",
                "Cashback will be added to wallet"
            ],

            affiliate: {
                baseUrl: 'https://panel.visioncamp.in/go?cid=145&uid=919',
                offerId: 0,
                affiliateId: 0,
                clickIdParam: 'sub1',
                buildLink: function (userId) {
                    return 'https://panel.visioncamp.in/go?cid=145&uid=919&sub1=' + userId;
                }
            },

            postbackMapping: {
                userId: 'sub1',
                payment: 'payout',
                eventName: 'event',
                offerId: 'offer_id',
                ipAddress: 'ip',
                timestamp: 'tdate'
            },

            events: {
                install: {
                    identifiers: ['install'],
                    displayName: 'Install',
                    amount: 0
                },
                trial: {
                    identifiers: ['Trial_purchased', 'trial_purchased', 'trial_buy'],
                    displayName: 'Trial Purchase',
                    amount: 25
                }
            },

            branding: {
                logoText: 'Story TV',
                tagline: 'Install and Purchase Trial get 25 rupees',
                campaignDisplayName: 'Story TV Offer'
            },

            userInput: {
                fieldType: 'mobile',
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
                    pattern: '[a-zA-Z0-9.\\\\-_]{2,}@[a-zA-Z]{2,}',
                    errorMessage: 'Please enter a valid UPI ID'
                }
            },

            telegram: {
                botUsername: 'ncearnings123bot',
                welcomeMessage: {
                    title: 'Welcome to Story TV Campaign visioncamp Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'Story TV Campaign visioncamp Help',
                    howItWorks: [
                        'Register with your UPI ID using /start YOUR_UPI_ID',
                        'Complete the Story TV Campaign visioncamp offer',
                        'Get notified when your postback arrives',
                        'Check your wallet for earnings'
                    ]
                }
            },

            settings: {
                enableDuplicateDetection: false,
                verboseLogging: true,
                timezone: 'Asia/Kolkata',
                dateLocale: 'en-IN',
                currency: '₹',
                minWithdrawal: 30
            }
        },

        {
            id: 'story-tv-cashpayout id 5',
            wallet_display: 'Story TV',
            slug: 'story-tv-2',
            name: 'STORY TV Campaign cashout id 5',
            description: 'Welcome to Story tv Campaign',

            // Campaign status
            isActive: true,

            process: [
                "Enter  your Mobile Number and click on proceed",
                "Install the Story TV App",
                "Wait for the install tracking message from the telegram bot",
                "After successful tracking of install enter the number and otp and buy the 1RS trial purchase",
                "Wait for the trail tracking message from the telegram bot",
                "Cashback will be added to wallet",
                "Repeat the process after deleting the advertising id and the toggling the areoplane mode"
            ],

            affiliate: {
                baseUrl: 'https://Cashpayout-ads.gotracking.in/click/',
                offerId: 67,
                affiliateId: 5,
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
                    identifiers: ['Initial'],
                    displayName: 'Install Tracked',
                    amount: 0
                },
                trail: {
                    identifiers: ['dep'],
                    displayName: 'Trail Tracked',
                    amount: 25
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'STORY TV',
                tagline: 'Install and Purchase Trial get 25 rupees',
                campaignDisplayName: 'STORY TV Offer'
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
                    title: 'Welcome to STORY TV Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'STORY TV Help',
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
                minWithdrawal: 30
            }
        },

        {
            id: 'story-tv-cashpayout id 9',
            wallet_display: 'Story TV',
            slug: 'story-tv-3',
            name: 'STORY TV Campaign cashout id 9',
            description: 'Welcome to Story tv Campaign',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 📝 CAMPAIGN PROCESS
            // ----------------------------------------
            process: [
                "Enter  your Mobile Number and click on proceed",
                "Install the Story TV App",
                "Wait for the install tracking message from the telegram bot",
                "After successful tracking of install enter the number and otp and buy the 1RS trial purchase",
                "Wait for the trail tracking message from the telegram bot",
                "Cashback will be added to wallet",
                "Repeat the process after deleting the advertising id and the toggling the areoplane mode"
            ],

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://Cashpayout-ads.gotracking.in/click/',
                offerId: 67,
                affiliateId: 9,
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
                    displayName: 'Install Tracked',
                    amount: 0
                },
                trail: {
                    identifiers: ['Trial'],
                    displayName: 'Trail Tracked',
                    amount: 25
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'STORY TV',
                tagline: 'Install and Purchase Trial get 25 rupees',
                campaignDisplayName: 'STORY TV Offer'
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
                    title: 'Welcome to STORY TV Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'STORY TV Help',
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
                minWithdrawal: 30
            }
        }
        ,

        {
            id: 'story-tv-osamcampaign',
            wallet_display: 'Story TV',
            slug: 'story-tv-4',
            name: 'STORY TV Campaign cashout id 9',
            description: 'Welcome to Story tv Campaign',

            // Campaign status
            isActive: true,

            // ----------------------------------------
            // 📝 CAMPAIGN PROCESS
            // ----------------------------------------
            process: [
                "Enter  your Mobile Number and click on proceed",
                "Install the Story TV App",
                "Wait for the install tracking message from the telegram bot",
                "After successful tracking of install enter the number and otp and buy the 1RS trial purchase",
                "Wait for the trail tracking message from the telegram bot",
                "Cashback will be added to wallet",
                "Repeat the process after deleting the advertising id and the toggling the areoplane mode"
            ],

            // ----------------------------------------
            // 🔗 AFFILIATE LINK CONFIGURATION
            // ----------------------------------------
            affiliate: {
                baseUrl: 'https://partner.osamcamp.in/go',
                offerId: 99,
                affiliateId: 128,
                clickIdParam: 'p1',
                buildLink: function (userId) {
                    return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&p1=${userId}`;
                }
            },

            // ----------------------------------------
            // 📥 POSTBACK PARAMETER MAPPING
            // ----------------------------------------
            postbackMapping: {
                userId: 'p1',          // Network sends: sub1
                payment: 'payout',            // Network sends: payout
                eventName: 'event',           // Network sends: event
                offerId: 'offerid',          // Network sends: offer_id (optional)
                ipAddress: 'ip',              // Network sends: ip (optional)
                timestamp: 'tdate'        // Network sends: tdate (optional)
            },

            // ----------------------------------------
            // 💰 EVENT DEFINITIONS & PAYMENTS
            // ----------------------------------------
            events: {
                install: {
                    identifiers: ['Install'],
                    displayName: 'Install Tracked',
                    amount: 0
                },
                trail: {
                    identifiers: ['trial'],
                    displayName: 'Trial Tracked',
                    amount: 25
                }
            },

            // ----------------------------------------
            // 🎨 BRANDING & UI
            // ----------------------------------------
            branding: {
                logoText: 'STORY TV',
                tagline: 'Install and Purchase Trial get 25 rupees',
                campaignDisplayName: 'STORY TV Offer'
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
                    title: 'Welcome to STORY TV Campaign!',
                    description: 'To register and get notifications:'
                },
                notification: {
                    title: 'NEW CASHBACK RECEIVED!',
                    showCumulativeEarnings: true,
                    footer: 'Powered by @NC Earnings'
                },
                help: {
                    title: 'STORY TV Help',
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
                minWithdrawal: 30
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
