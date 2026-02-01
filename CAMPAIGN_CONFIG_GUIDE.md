# 📋 Campaign Configuration Guide

This guide explains how to configure campaigns in `config/campaigns.config.js`.

## 🚀 Quick Start

1. Open `config/campaigns.config.js`
2. Add your campaign to the `campaigns` array
3. Configure all required fields
4. Save and restart the server
5. Access your campaign at `/c/your-slug`

## 📝 Campaign Structure

Each campaign object has the following structure:

```javascript
{
    id: 'unique_campaign_id',
    slug: 'url-friendly-slug',
    name: 'Campaign Display Name',
    description: 'Brief description',
    isActive: true,
    
    affiliate: { /* Affiliate link config */ },
    postbackMapping: { /* Parameter mapping */ },
    events: { /* Event definitions */ },
    branding: { /* UI branding */ },
    userInput: { /* Input field config */ },
    telegram: { /* Telegram bot settings */ },
    settings: { /* Additional settings */ }
}
```

## 🔧 Configuration Fields

### Basic Information

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier for the campaign |
| `slug` | string | ✅ | URL-friendly slug (used in `/c/slug`) |
| `name` | string | ✅ | Display name of the campaign |
| `description` | string | ✅ | Brief description |
| `isActive` | boolean | ✅ | Whether campaign is active |

**Example:**
```javascript
id: 'angle_one_offers24',
slug: 'angle-one',
name: 'Angle One - Offers24',
description: 'Install > Register > Open Demat Account',
isActive: true
```

### Affiliate Link Configuration

Configure how affiliate links are generated:

```javascript
affiliate: {
    baseUrl: 'https://publisher.network.com/click.php',
    offerId: 276,
    affiliateId: 475,
    clickIdParam: 'aff_click_id',  // Parameter name for user tracking
    buildLink: function (userId) {
        return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}`;
    }
}
```

**Common Click ID Parameters:**
- `aff_click_id` - Offers24
- `click_id` - CashCamps
- `p1` - OsamCamp

### Postback Parameter Mapping

Map the affiliate network's parameter names to your internal system:

```javascript
postbackMapping: {
    userId: 'click_id',      // Network's parameter for user ID
    payment: 'payout',       // Network's parameter for payment amount
    eventName: 'event',      // Network's parameter for event name
    offerId: 'offer_id',     // (Optional) Network's offer ID
    ipAddress: 'ip',         // (Optional) User's IP address
    timestamp: 'timestamp'   // (Optional) Event timestamp
}
```

**Example Mappings:**

| Network | userId | payment | eventName |
|---------|--------|---------|-----------|
| Offers24 | `click_id` | `payout` | `event` |
| CashCamps | `click_id` | `payout` | `event` |
| OsamCamp | `p1` | `payout` | `event` |

### Event Definitions & Payments

Define events and their payment amounts:

```javascript
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
        identifiers: ['Account_Open', 'account_open', 'demat_open'],
        displayName: 'Account Open',
        amount: 350  // ₹350 payment
    }
}
```

**Key Points:**
- `identifiers`: Array of possible event names from the network
- `displayName`: User-friendly name shown in UI
- `amount`: Payment amount in rupees (0 for tracking-only events)

### Branding & UI

Customize the campaign's appearance:

```javascript
branding: {
    logoText: 'ANGLE ONE',
    tagline: 'Start Trading Campaign',
    campaignDisplayName: 'Angle One Offer'
}
```

### User Input Configuration

Configure what information users need to provide:

```javascript
userInput: {
    fieldType: 'upi',  // 'mobile' or 'upi'
    extractMobileFromUPI: true,  // Extract mobile from UPI for click_id
    
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
}
```

**Field Types:**
- `mobile`: Users enter mobile number directly
- `upi`: Users enter UPI ID (can extract mobile if `extractMobileFromUPI: true`)

### Telegram Settings

Configure Telegram bot notifications:

```javascript
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
}
```

### Additional Settings

```javascript
settings: {
    enableDuplicateDetection: false,
    verboseLogging: true,
    timezone: 'Asia/Kolkata',
    dateLocale: 'en-IN',
    currency: '₹',
    minWithdrawal: 100
}
```

## 📚 Complete Example

Here's a complete campaign configuration:

```javascript
{
    id: 'story_tv_cashcamps',
    slug: 'story-tv',
    name: 'Story TV - CashCamps',
    description: 'Subscribe to Story TV and earn',
    isActive: true,

    affiliate: {
        baseUrl: 'https://panel.cashcamps.in/go',
        offerId: 50,
        affiliateId: 128,
        clickIdParam: 'click_id',
        buildLink: function (userId) {
            return `${this.baseUrl}?o=${this.offerId}&a=${this.affiliateId}&${this.clickIdParam}=${userId}`;
        }
    },

    postbackMapping: {
        userId: 'click_id',
        payment: 'payout',
        eventName: 'event',
        offerId: 'offerid',
        ipAddress: 'ip'
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
        campaignDisplayName: 'Story TV Offer'
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
}
```

## 🎯 Common Scenarios

### Scenario 1: Mobile-Only Campaign
```javascript
userInput: {
    fieldType: 'mobile',
    extractMobileFromUPI: false,
    // ... mobile config only
}
```

### Scenario 2: UPI with Mobile Extraction
```javascript
userInput: {
    fieldType: 'upi',
    extractMobileFromUPI: true,  // Extracts first 10 digits from UPI
    // ... upi config
}
```

### Scenario 3: Multiple Payment Events
```javascript
events: {
    install: { identifiers: ['install'], displayName: 'Install', amount: 0 },
    register: { identifiers: ['register'], displayName: 'Register', amount: 5 },
    purchase: { identifiers: ['purchase'], displayName: 'Purchase', amount: 50 }
}
```

## 🔍 Testing Your Configuration

1. **Add Campaign**: Add your config to `campaigns` array
2. **Restart Server**: `npm start`
3. **Check Admin Panel**: Visit `/admin.html` → Campaigns
4. **Test URL**: Visit `/c/your-slug`
5. **Test Postback**: Send test postback to `/api/postback`

## ⚠️ Common Issues

### Campaign Not Showing
- Check `isActive: true`
- Verify slug is unique
- Restart server after config changes

### Postback Not Working
- Verify `postbackMapping` matches network's parameters
- Check event `identifiers` match network's event names
- Enable `verboseLogging: true` to see postback data

### Wrong Payment Amount
- Check `events` configuration
- Verify event identifiers match exactly (case-sensitive)

## 📌 Best Practices

1. **Use Descriptive IDs**: `angle_one_offers24` not `campaign1`
2. **URL-Friendly Slugs**: `angle-one` not `Angle One!`
3. **Multiple Identifiers**: Include variations for event names
4. **Test First**: Test with small amounts before going live
5. **Backup Config**: Keep a backup before making changes

## 🆘 Need Help?

- Check server logs for errors
- Enable `verboseLogging: true` for detailed logs
- Test postback URLs with tools like Postman
- Verify affiliate network documentation for parameter names
