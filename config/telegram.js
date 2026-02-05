const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const campaignConfig = require('./campaign-config');

// ============================================
// 🤖 TELEGRAM BOT CONFIGURATION
// ============================================

require('dotenv').config();

const USER_BOT_TOKEN = process.env.TELEGRAM_USER_BOT_TOKEN;

// ============================================
// 📊 DATABASE SCHEMA FOR USER REGISTRATIONS
// ============================================

const TelegramUser = require('../models/TelegramUser');

// ============================================
// 🤖 BOT INITIALIZATION
// ============================================

let userBot = null;

function initializeBots() {
    try {
        // User Bot - Handles user queries and sends notifications (WITH POLLING)
        if (USER_BOT_TOKEN) {
            try {
                userBot = new TelegramBot(USER_BOT_TOKEN, {
                    polling: {
                        interval: 1000,
                        autoStart: true,
                        params: {
                            timeout: 10
                        }
                    }
                });

                // Handle polling errors gracefully
                userBot.on('polling_error', (error) => {
                    if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
                        console.log('⚠️  User Bot: Another instance is running. Stopping polling...');
                        userBot.stopPolling();
                    } else {
                        console.error('User Bot polling error:', error.message);
                    }
                });

                console.log('✅ User Bot initialized (interactive mode)');
                setupUserBotCommands();
            } catch (error) {
                console.error('❌ User Bot failed to start:', error.message);
            }
        } else {
            console.warn('⚠️  TELEGRAM_USER_BOT_TOKEN not found in .env');
        }

        return { userBot };
    } catch (error) {
        console.error('❌ Bot initialization error:', error.message);
        return { userBot: null };
    }
}

// ============================================
// 💥 USER BOT COMMANDS
// ============================================

function setupUserBotCommands() {
    const { campaign, telegram } = campaignConfig;

    // /start command - Register UPI ID
    userBot.onText(/\/start(.*)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const upiInput = match[1]?.trim();

        if (!upiInput) {
            await userBot.sendMessage(
                chatId,
                `👋 <b>${telegram.welcomeMessage.title}</b>

${telegram.welcomeMessage.description}

📝 <b>Command:</b>
<code>/start YOUR_UPI_ID</code>

<b>Example:</b>
<code>/start 9876543210@paytm</code>

✅ Once registered, you'll receive instant notifications for ALL campaigns when your postbacks arrive!

🔕 Use /stop to disable notifications`,
                { parse_mode: 'HTML', disable_web_page_preview: true }
            );
            return;
        }

        // Validate UPI ID format
        if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiInput)) {
            await userBot.sendMessage(
                chatId,
                '❌ Invalid UPI ID format. Please enter a valid UPI ID.\n\nExample: <code>/start 9876543210@paytm</code>',
                { parse_mode: 'HTML', disable_web_page_preview: true }
            );
            return;
        }

        try {
            let user = await TelegramUser.findOne({ chat_id: chatId.toString() });

            if (user) {
                if (user.phone_number !== upiInput) {
                    user.phone_number = upiInput;  // Store UPI ID in phone_number field
                    user.registered_at = new Date();
                    user.notifications_enabled = true;
                    await user.save();
                    await userBot.sendMessage(
                        chatId,
                        `✅ <b>UPI ID Updated!</b>

Your new UPI ID: <code>${upiInput}</code>

🔔 Notifications: <b>ENABLED</b>

📱 You'll receive alerts for ALL campaigns when postbacks arrive!`,
                        { parse_mode: 'HTML', disable_web_page_preview: true }
                    );
                } else {
                    await userBot.sendMessage(
                        chatId,
                        `ℹ️ You're already registered with UPI ID: <code>${upiInput}</code>

🔔 Notifications: <b>${user.notifications_enabled ? 'ENABLED' : 'DISABLED'}</b>

📱 You'll receive alerts for ALL campaigns!`,
                        { parse_mode: 'HTML', disable_web_page_preview: true }
                    );
                }
            } else {
                user = await TelegramUser.create({
                    chat_id: chatId.toString(),
                    phone_number: upiInput,  // Store UPI ID in phone_number field
                    notifications_enabled: true
                });

                await userBot.sendMessage(
                    chatId,
                    `🎉 <b>Registration Successful!</b>

Your UPI ID: <code>${upiInput}</code>

✅ You'll now receive notifications for ALL campaigns!

🔕 Use /stop to disable notifications
📖 Use /help for more commands`,
                    { parse_mode: 'HTML', disable_web_page_preview: true }
                );
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            await userBot.sendMessage(
                chatId,
                '❌ Registration failed. Please try again later.'
            );
        }
    });

    // /stop command - Disable notifications
    userBot.onText(/\/stop/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const user = await TelegramUser.findOne({ chat_id: chatId.toString() });

            if (!user) {
                await userBot.sendMessage(chatId, '⚠️ You are not registered yet.');
                return;
            }

            user.notifications_enabled = false;
            await user.save();

            await userBot.sendMessage(
                chatId,
                `🔕 <b>Notifications Disabled</b>

You will no longer receive automatic postback alerts.

To enable notifications again, use:
<code>/start ${user.phone_number}</code>`,
                { parse_mode: 'HTML', disable_web_page_preview: true }
            );
        } catch (error) {
            await userBot.sendMessage(chatId, '❌ Failed to update settings');
        }
    });

    // /help command
    userBot.onText(/\/help/, async (msg) => {
        const chatId = msg.chat.id;
        const howItWorksText = telegram.help.howItWorks.map((step, i) => `${i + 1}. ${step}`).join('\n');

        await userBot.sendMessage(
            chatId,
            `📖 <b>${telegram.help.title}</b>

<b>1. Register/Update UPI ID:</b>
<code>/start YOUR_UPI_ID</code>
Example: <code>/start 9876543210@paytm</code>

<b>2. Disable Notifications:</b>
<code>/stop</code>

<b>3. Help:</b>
<code>/help</code>

━━━━━━━━━━━━━━━━━━━━

💡 <b>How it works:</b>
${howItWorksText}

📱 <b>One UPI ID = All Campaigns</b>
Register once and get notifications for ALL campaigns!

Need support? Contact the admin.`,
            { parse_mode: 'HTML', disable_web_page_preview: true }
        );
    });

    console.log('✅ User bot commands configured');
}

// ============================================
// 🔔 USER BOT - Send Notification to Specific User
// ============================================

async function sendUserNotification(postbackData) {
    if (!userBot) {
        console.warn('⚠️  User bot not initialized');
        return;
    }

    try {
        const { phone_number, amount, status, campaign, click_id, date, time } = postbackData;
        const { telegram, payments } = campaignConfig;

        // Find user by UPI ID (stored in phone_number field)
        const user = await TelegramUser.findOne({ phone_number: phone_number });

        if (!user) {
            console.log(`ℹ️  No Telegram user registered for identifier: ${phone_number}`);
            return;
        }

        if (!user.notifications_enabled) {
            console.log(`🔕 Notifications disabled for: ${phone_number}`);
            return;
        }

        const emoji = amount > 0 ? '💰' : '📲';
        const eventName = status;
        const displayAmount = amount;

        // Calculate cumulative unpaid earnings by UPI ID
        const Earning = mongoose.model('Earning');
        const User = mongoose.model('User');

        const userAccount = await User.findOne({ upiId: phone_number });

        let cumulativeEarnings = 0;
        if (userAccount) {
            cumulativeEarnings = userAccount.availableBalance;
        }

        let message = `
${emoji} <b>${telegram.notification.title}</b>

🎯 <b>Campaign:</b> ${campaign || telegram.campaignDisplayName}

💵 <b>This Earning:</b> ${payments.currency}${displayAmount}

📊 <b>Event:</b> ${eventName}`;

        // Only show cumulative for trial purchases (when amount > 0)
        if (amount > 0 && telegram.notification.showCumulativeEarnings) {
            message += `\n💰 <b>Total Unpaid:</b> ${payments.currency}${cumulativeEarnings}  \n \n`;
        }
        message += `\n\n📅 <b>Date:</b> ${date}

⏰ <b>Time:</b> ${time}

${telegram.notification.footer.replace('@NC Earnings', `<a href="https://t.me/ncearningssmart">@NC Campaigns</a>`)}`;

        await userBot.sendMessage(user.chat_id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        console.log(`📨 User notification sent to ${phone_number} (Total unpaid: ${payments.currency}${cumulativeEarnings})`);

    } catch (error) {
        console.error('❌ Failed to send user notification:', error.message);
    }
}

// ============================================
// 📤 EXPORTS
// ============================================

module.exports = {
    initializeBots,
    sendUserNotification,
    TelegramUser
};
