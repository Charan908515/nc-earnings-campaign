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
const TelegramVerification = require('../models/TelegramVerification');

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

    // /start command - Register UPI ID or Verify Token
    userBot.onText(/\/start(.*)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const input = match[1]?.trim();

        // SCENARIO 1: No input - Show instructions
        if (!input) {
            await userBot.sendMessage(
                chatId,
                `👋 <b>${telegram.welcomeMessage.title}</b>

${telegram.welcomeMessage.description}

📝 <b>To get started:</b>
Please go to your wallet dashboard and click "🤖 Bot Notifications" to automatically register.

Or manually register:
<code>/start YOUR_UPI_ID</code>

✅ Once registered, you'll receive instant notifications for ALL campaigns when your postbacks arrive!

🔕 Use /stop to disable notifications`,
                { parse_mode: 'HTML', disable_web_page_preview: true }
            );
            return;
        }

        // SCENARIO 2: Input is a UUID (Token Verification)
        // UUID regex (approximate)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
            try {
                const verification = await TelegramVerification.findOne({ token: input });

                if (!verification) {
                    await userBot.sendMessage(chatId, '❌ Invalid or expired verification link. Please generate a new one from your wallet.');
                    return;
                }

                // Register user
                const upiId = verification.upiId;

                let user = await TelegramUser.findOne({ chat_id: chatId.toString() });

                if (user) {
                    user.phone_number = upiId;
                    user.notifications_enabled = true;
                    await user.save();
                } else {
                    user = await TelegramUser.create({
                        chat_id: chatId.toString(),
                        phone_number: upiId,
                        notifications_enabled: true
                    });
                }

                // Delete used token
                await TelegramVerification.deleteOne({ _id: verification._id });

                await userBot.sendMessage(
                    chatId,
                    `🎉 <b>Registration Successful!</b>

Your UPI ID: <code>${upiId}</code>

✅ You'll now receive notifications for ALL campaigns!
`,
                    { parse_mode: 'HTML', disable_web_page_preview: true }
                );
                return;

            } catch (error) {
                console.error('Token verification error:', error);
                await userBot.sendMessage(chatId, '❌ An error occurred during verification.');
                return;
            }
        }

        // SCENARIO 3: Input is a UPI ID (Manual Registration - Backward Compatibility)
        if (/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(input)) {
            try {
                let user = await TelegramUser.findOne({ chat_id: chatId.toString() });

                if (user) {
                    if (user.phone_number !== input) {
                        user.phone_number = input;
                        user.registered_at = new Date();
                        user.notifications_enabled = true;
                        await user.save();
                        await userBot.sendMessage(
                            chatId,
                            `✅ <b>UPI ID Updated!</b>

Your new UPI ID: <code>${input}</code>

🔔 Notifications: <b>ENABLED</b>`,
                            { parse_mode: 'HTML', disable_web_page_preview: true }
                        );
                    } else {
                        await userBot.sendMessage(
                            chatId,
                            `ℹ️ You're already registered with UPI ID: <code>${input}</code>`,
                            { parse_mode: 'HTML', disable_web_page_preview: true }
                        );
                    }
                } else {
                    user = await TelegramUser.create({
                        chat_id: chatId.toString(),
                        phone_number: input,
                        notifications_enabled: true
                    });

                    await userBot.sendMessage(
                        chatId,
                        `🎉 <b>Registration Successful!</b>

Your UPI ID: <code>${input}</code>

✅ You'll verify receive notifications for ALL campaigns!`,
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
            return;
        }

        // SCENARIO 4: Invalid Input
        await userBot.sendMessage(
            chatId,
            '❌ Invalid format. Please use the link from your wallet or enter a valid UPI ID.\n\nExample: <code>/start 9876543210@paytm</code>',
            { parse_mode: 'HTML', disable_web_page_preview: true }
        );

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

${telegram.notification.footer.replace('@NC Earnings', `<a href="https://t.me/nccampaigns">@NC Campaigns</a>`)}`;

        await userBot.sendMessage(user.chat_id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        console.log(`📨 User notification sent to ${phone_number} (Total unpaid: ${payments.currency}${cumulativeEarnings})`);

    } catch (error) {
        console.error('❌ Failed to send user notification:', error.message);
    }
}

// ============================================
// 📢 CHANNEL BOT - Broadcast to Public Channel
// ============================================

async function sendChannelNotification(postbackData) {
    if (!userBot) {
        console.warn('⚠️  User bot not initialized for channel broadcast');
        return;
    }

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!channelId) {
        console.warn('⚠️  TELEGRAM_CHANNEL_ID not configured');
        return;
    }

    try {
        const { mobile_number, amount, status, campaign, date, time } = postbackData;
        const { telegram, payments } = campaignConfig;

        // Anonymize mobile number - show first 3 and last 2 digits
        const anonymizedNumber = anonymizeMobileNumber(mobile_number);

        const emoji = amount > 0 ? '💰' : '📲';
        const eventName = status;
        const displayAmount = amount;

        const message = `
${emoji} <b>New Postback Alert!</b>

🎯 <b>Campaign:</b> ${campaign || telegram.campaignDisplayName}

💵 <b>Amount:</b> ${payments.currency}${displayAmount}

📊 <b>Event:</b> ${eventName}

👤 <b>User:</b> <code>${anonymizedNumber}</code>

📅 <b>Date:</b> ${date}
⏰ <b>Time:</b> ${time}

━━━━━━━━━━━━━━━━━━━━
📢 <a href="https://t.me/nccampaigns">Join NC Earnings Channel</a>`;

        await userBot.sendMessage(channelId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        console.log(`📢 Channel broadcast sent to ${channelId}`);

    } catch (error) {
        console.error('❌ Failed to send channel notification:', error.message);
        // Don't throw - channel broadcast failure shouldn't break postback processing
    }
}

// ============================================
// 💰 WITHDRAWAL APPROVAL NOTIFICATION
// ============================================

async function sendWithdrawalApprovalNotification(withdrawalData) {
    if (!userBot) {
        console.warn('⚠️  User bot not initialized');
        return;
    }

    try {
        const { userId, upiId, amount, processedAt, closingBalance } = withdrawalData;

        // Get the User model to find account owner's UPI ID
        const User = mongoose.model('User');
        const accountOwner = await User.findById(userId);

        if (!accountOwner) {
            console.log(`ℹ️  User account not found for userId: ${userId}`);
            return;
        }

        // Find Telegram user by the ACCOUNT OWNER's UPI ID (not withdrawal destination UPI)
        const telegramUser = await TelegramUser.findOne({ phone_number: accountOwner.upiId });

        if (!telegramUser) {
            console.log(`ℹ️  No Telegram user registered for account UPI: ${accountOwner.upiId}`);
            return;
        }

        if (!telegramUser.notifications_enabled) {
            console.log(`🔕 Notifications disabled for: ${accountOwner.upiId}`);
            return;
        }

        // Format the timestamp in Asia/Kolkata timezone (GMT+5:30)
        const date = new Date(processedAt);
        const formattedTime = date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Message shows the withdrawal destination UPI (where money will be sent)
        const message = `✅ <b>Your Withdrawal Approved</b>

💵 <b>Amount :</b> ₹${amount.toFixed(2)}

📌 <b>UPI :</b> <code>${upiId}</code>

💰 <b>Closing Balance :</b> ₹${closingBalance.toFixed(2)}

🕒 <b>Time :</b> ${formattedTime}`;

        // Send to account owner's Telegram chat
        await userBot.sendMessage(telegramUser.chat_id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        console.log(`📨 Withdrawal approval notification sent to account owner: ${accountOwner.upiId} (payment to: ${upiId})`);

    } catch (error) {
        console.error('❌ Failed to send withdrawal approval notification:', error.message);
    }
}

// ============================================
// ❌ WITHDRAWAL REJECTION NOTIFICATION
// ============================================

async function sendWithdrawalRejectionNotification(withdrawalData) {
    if (!userBot) {
        console.warn('⚠️  User bot not initialized');
        return;
    }

    try {
        const { userId, upiId, amount, processedAt, newBalance } = withdrawalData;

        // Get the User model to find account owner's UPI ID
        const User = mongoose.model('User');
        const accountOwner = await User.findById(userId);

        if (!accountOwner) {
            console.log(`ℹ️  User account not found for userId: ${userId}`);
            return;
        }

        // Find Telegram user by the ACCOUNT OWNER's UPI ID (not withdrawal destination UPI)
        const telegramUser = await TelegramUser.findOne({ phone_number: accountOwner.upiId });

        if (!telegramUser) {
            console.log(`ℹ️  No Telegram user registered for account UPI: ${accountOwner.upiId}`);
            return;
        }

        if (!telegramUser.notifications_enabled) {
            console.log(`🔕 Notifications disabled for: ${accountOwner.upiId}`);
            return;
        }

        // Format the timestamp in Asia/Kolkata timezone (GMT+5:30)
        const date = new Date(processedAt);
        const formattedTime = date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Message shows the withdrawal destination UPI (where money would have been sent)
        const message = `❌ <b>Your Withdrawal Rejected</b>

💵 <b>Amount :</b> ₹${amount.toFixed(2)}

📌 <b>UPI :</b> <code>${upiId}</code>

💰 <b>Refunded Balance :</b> ₹${newBalance.toFixed(2)}

🕒 <b>Time :</b> ${formattedTime}

💡 <i>Your amount has been returned to your wallet.</i>`;

        // Send to account owner's Telegram chat
        await userBot.sendMessage(telegramUser.chat_id, message, { parse_mode: 'HTML', disable_web_page_preview: true });
        console.log(`📨 Withdrawal rejection notification sent to account owner: ${accountOwner.upiId} (payment was for: ${upiId})`);

    } catch (error) {
        console.error('❌ Failed to send withdrawal rejection notification:', error.message);
    }
}

// ============================================
// 🔒 HELPER - Anonymize Mobile Number
// ============================================

function anonymizeMobileNumber(mobileNumber) {
    if (!mobileNumber) return '***';

    // Convert to string and remove any non-digit characters
    const digits = String(mobileNumber).replace(/\D/g, '');

    // If less than 5 digits, just mask it
    if (digits.length < 5) {
        return '***';
    }

    // Show first 3 and last 2 digits (e.g., 9876543210 -> 987****10)
    const firstThree = digits.slice(0, 3);
    const lastTwo = digits.slice(-2);
    const maskedLength = digits.length - 5;
    const mask = '*'.repeat(maskedLength);

    return `${firstThree}${mask}${lastTwo}`;
}

// ============================================
// 📤 EXPORTS
// ============================================

module.exports = {
    initializeBots,
    sendUserNotification,
    sendChannelNotification,
    sendWithdrawalApprovalNotification,
    sendWithdrawalRejectionNotification,
    TelegramUser
};
