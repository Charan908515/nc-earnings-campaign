const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
require('dotenv').config();

// ============================================
// 🤖 POSTBACK BROADCAST BOT CONFIGURATION
// ============================================
// This bot sends ALL postbacks to ALL registered users
// It's a broadcast notification system for monitoring

const BOT_TOKEN = '7617859790:AAFswmsLRsqgPV5oLlogQTuOjEaNwDuZCvg';
const MONGO_URI = process.env.MONGO_URI;

// ============================================
// 📊 DATABASE MODELS
// ============================================

const TelegramUser = require('./models/TelegramUser');
const User = require('./models/User');
const Earning = require('./models/Earning');

// ============================================
// 🤖 BOT INITIALIZATION
// ============================================

let bot = null;

async function initializeBot() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Initialize bot with polling
        bot = new TelegramBot(BOT_TOKEN, {
            polling: {
                interval: 1000,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
        });

        // Handle polling errors
        bot.on('polling_error', (error) => {
            if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
                console.log('⚠️  Another instance is running. Stopping polling...');
                bot.stopPolling();
            } else {
                console.error('Polling error:', error.message);
            }
        });

        console.log('✅ Postback Broadcast Bot initialized');
        setupCommands();
    } catch (error) {
        console.error('❌ Bot initialization error:', error.message);
        process.exit(1);
    }
}

// ============================================
// 💥 BOT COMMANDS
// ============================================

function setupCommands() {
    // /start command - Info message (no registration needed)
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            `👋 <b>Postback Broadcast Bot</b>

📢 This bot automatically sends ALL postback notifications to users registered with the personal user bot.

ℹ️ <b>No separate registration needed!</b>

If you're registered with the personal user bot (@ncearnings123bot), you'll automatically receive broadcast notifications here.

🔔 <b>What you'll receive:</b>
• All postbacks from all users
• Real-time campaign activity
• Earnings monitoring

� <b>To register:</b>
Use the personal user bot: @ncearnings123bot
Send: <code>/start YOUR_UPI_ID</code>

Need help? Use /help`,
            { parse_mode: 'HTML', disable_web_page_preview: true }
        );
    });

    // /help command
    bot.onText(/\/help/, async (msg) => {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            `📖 <b>Postback Broadcast Bot - Help</b>

📢 <b>Purpose:</b>
This bot broadcasts ALL postbacks to ALL registered users for monitoring purposes.

� <b>How to get notifications:</b>
1. Register with the personal user bot: @ncearnings123bot
2. Send: <code>/start YOUR_UPI_ID</code>
3. You'll automatically receive broadcasts here!

💡 <b>What you'll see:</b>
• Which user earned (masked for privacy)
• Campaign name
• Event type
• Amount earned
• User's total unpaid balance

� <b>Notification Format:</b>
Every postback shows:
👤 User: 9876XXXX10@paytm (masked)
🎯 Campaign: [Campaign Name]
💵 Earning: ₹[Amount]
📊 Event: [Event Type]

� <b>To disable notifications:</b>
Use the personal user bot and send /stop

Need support? Contact the admin.`,
            { parse_mode: 'HTML', disable_web_page_preview: true }
        );
    });

    console.log('✅ Bot commands configured');
}

// ============================================
// � HELPER FUNCTION - MASK PHONE NUMBER
// ============================================

function maskPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length < 6) {
        return phoneNumber; // Return as-is if too short
    }

    // Extract first 4 and last 2 characters
    const first4 = phoneNumber.substring(0, 4);
    const last2 = phoneNumber.substring(phoneNumber.length - 2);

    // Calculate middle length (should be 4 X's)
    const middleLength = Math.max(4, phoneNumber.length - 6);
    const masked = 'X'.repeat(middleLength);

    return `${first4}${masked}${last2}`;
}

// ============================================
// �🔔 BROADCAST POSTBACK TO ALL USERS
// ============================================

async function broadcastPostback(postbackData) {
    if (!bot) {
        console.warn('⚠️  Bot not initialized');
        return;
    }

    try {
        const { phone_number, amount, status, campaign, date, time } = postbackData;

        // Get all users with notifications enabled
        const users = await TelegramUser.find({ notifications_enabled: true });

        if (users.length === 0) {
            console.log('ℹ️  No users registered for broadcast notifications');
            return;
        }

        // Get user account for cumulative earnings
        const userAccount = await User.findOne({ upiId: phone_number });
        let cumulativeEarnings = 0;
        if (userAccount) {
            cumulativeEarnings = userAccount.availableBalance;
        }

        const emoji = amount > 0 ? '💰' : '📲';
        const eventName = status;
        const displayAmount = amount;

        // Mask the phone number (first 4 + XXXX + last 2)
        const maskedPhoneNumber = maskPhoneNumber(phone_number);

        let message = `
${emoji} <b>POSTBACK RECEIVED!</b>

🎯 <b>Campaign:</b> ${campaign}

👤 <b>User:</b> <code>${maskedPhoneNumber}</code>

💵 <b>This Earning:</b> ₹${displayAmount}

📊 <b>Event:</b> ${eventName}`;


        message += `\n\n📅 <b>Date:</b> ${date}

⏰ <b>Time:</b> ${time}

<a href="https://t.me/ncearningssmart">@NC Campaigns</a>`;

        // Broadcast to all users
        let successCount = 0;
        let failCount = 0;
        let chatNotFoundCount = 0;

        for (const user of users) {
            try {
                await bot.sendMessage(user.chat_id, message, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                });
                successCount++;
            } catch (error) {
                // Silently skip "chat not found" errors (user hasn't started this bot)
                if (error.message && error.message.includes('chat not found')) {
                    chatNotFoundCount++;
                } else {
                    console.error(`❌ Failed to send to ${user.chat_id}:`, error.message);
                    failCount++;
                }
            }
        }

        // Only log if there were actual sends or real errors (not just chat not found)
        if (successCount > 0 || failCount > 0) {
            console.log(`📨 Broadcast sent: ${successCount} successful, ${failCount} failed, ${chatNotFoundCount} not started bot (Total: ${users.length} users)`);
        }

    } catch (error) {
        console.error('❌ Failed to broadcast postback:', error.message);
    }
}

// ============================================
// 📤 EXPORTS
// ============================================

module.exports = {
    initializeBot,
    broadcastPostback,
    bot
};

// ============================================
// 🚀 START BOT IF RUN DIRECTLY
// ============================================

if (require.main === module) {
    initializeBot();
    console.log('🤖 Postback Broadcast Bot is running...');
    console.log('📢 All postbacks will be broadcast to all registered users');
}
