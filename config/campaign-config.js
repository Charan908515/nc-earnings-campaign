/**
 * ============================================
 * 🎯 CAMPAIGN CONFIGURATION ADAPTER
 * ============================================
 * 
 * This file provides backward compatibility by reading from
 * the new campaigns.config.js file and exposing the active
 * campaign's settings in the old format.
 */

const campaignsConfig = require('./campaigns.config');

// Get the active campaign
const activeCampaign = campaignsConfig.getActiveCampaign();

// If no campaigns exist, export safe defaults
if (!activeCampaign) {
    module.exports = {
        campaign: {
            name: 'No Campaign',
            displayTitle: 'No Campaign Active',
            description: 'No campaigns configured',
            isActive: false,
            branding: {
                logoText: 'NO CAMPAIGN',
                tagline: 'Add campaigns in config/campaigns.config.js',
                campaignDisplayName: 'No Campaign'
            }
        },
        payments: {
            installAmount: 0,
            trialAmount: 0,
            currency: '₹',
            minWithdrawal: 30
        },
        events: {},
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
                placeholder: 'Enter your UPI ID',
                maxLength: 50,
                pattern: '[a-zA-Z0-9.\\-_]{2,}@[a-zA-Z]{2,}',
                errorMessage: 'Please enter a valid UPI ID'
            }
        },
        affiliate: {
            baseUrl: '',
            offerId: '',
            affiliateId: '',
            subAffiliateId: '',
            clickIdParam: 'aff_click_id',
            buildLink: () => '#'
        },
        telegram: {
            botUsername: 'ncearnings123bot',
            welcomeMessage: {
                title: 'No Campaign Active',
                description: 'Please contact admin'
            },
            notification: {
                title: 'NOTIFICATION',
                showCumulativeEarnings: true,
                footer: 'Powered by NC Earnings'
            }
        },
        postback: {
            enableDuplicateDetection: false,
            verboseLogging: true,
            timezone: 'Asia/Kolkata',
            dateLocale: 'en-IN'
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
        }
    };
} else {
    // Export in the old format for backward compatibility
    module.exports = {
        // Campaign Information
        campaign: {
            name: activeCampaign.name,
            displayTitle: `${activeCampaign.name} Campaign`,
            description: activeCampaign.description,
            isActive: activeCampaign.isActive,
            branding: activeCampaign.branding
        },

        // Payment Configuration
        payments: {
            installAmount: activeCampaign.events.install?.amount || 0,
            trialAmount: Object.values(activeCampaign.events).find(e => e.amount > 0)?.amount || 0,
            currency: activeCampaign.settings.currency,
            minWithdrawal: activeCampaign.settings.minWithdrawal
        },

        // Event Detection
        events: activeCampaign.events,

        // User Input Configuration
        userInput: activeCampaign.userInput,

        // Affiliate Link Configuration
        affiliate: {
            ...activeCampaign.affiliate,
            // Legacy fields (if needed)
            baseUrl: '',
            offerId: '',
            affiliateId: '',
            subAffiliateId: '',
            clickIdParam: 'aff_click_id'
        },

        // Telegram Configuration
        telegram: activeCampaign.telegram,

        // Postback Configuration
        postback: {
            enableDuplicateDetection: activeCampaign.settings.enableDuplicateDetection,
            verboseLogging: activeCampaign.settings.verboseLogging,
            timezone: activeCampaign.settings.timezone,
            dateLocale: activeCampaign.settings.dateLocale
        },

        // UI Configuration
        ui: {
            submitButtonText: 'Proceed to Offer',
            walletLinkText: 'Check Earnings / Wallet',
            messages: {
                registrationSuccess: 'Registration Successful!',
                updateSuccess: 'Phone Number Updated!',
                notificationsDisabled: 'Notifications Disabled',
                campaignOver: 'Campaign is Over'
            }
        }
    };
}
