const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Earning = require('../models/Earning');
const Withdrawal = require('../models/Withdrawal');
const TelegramVerification = require('../models/TelegramVerification');
const { v4: uuidv4 } = require('uuid');

// Generate Telegram Link
router.post('/link-telegram', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const upiId = user.upiId || user.mobileNumber; // Use UPI ID or Mobile Number as identifier
        const token = uuidv4();

        // Store token in DB
        await TelegramVerification.create({
            token,
            upiId
        });

        const botUsername = 'ncearnings123bot'; // Replace with your actual bot username if different
        const telegramLink = `https://t.me/${botUsername}?start=${token}`;

        res.json({
            success: true,
            telegramLink,
            token,
            botUsername
        });

    } catch (error) {
        console.error('Telegram link generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate Telegram link' });
    }
});

// Get user balance
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        //console.log(`📊 Balance check for user: ${user.upiId || user.mobileNumber}`);
        //console.log(`   Available: ₹${user.availableBalance}, Total: ₹${user.totalEarnings}`);

        res.json({
            success: true,
            data: {
                totalEarnings: user.totalEarnings,
                availableBalance: user.availableBalance,
                mobileNumber: user.mobileNumber,
                upiId: user.upiId,
                name: user.name
            }
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Balance fetch error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Get earnings history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const Campaign = require('../models/Campaign');

        const earnings = await Earning.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('createdAt eventType payment campaignName campaignSlug walletDisplayName');

        const dataWithDisplay = [];
        for (const item of earnings) {
            const doc = item.toObject();
            if (!doc.walletDisplayName && doc.campaignSlug) {
                const campaign = await Campaign.findOne({ slug: doc.campaignSlug });
                doc.walletDisplayName = campaign?.wallet_display || campaign?.branding?.campaignDisplayName || doc.campaignName;
            } else if (!doc.walletDisplayName) {
                doc.walletDisplayName = doc.campaignName;
            }
            dataWithDisplay.push(doc);
        }

        res.json({
            success: true,
            data: dataWithDisplay
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('History fetch error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Submit withdrawal request
router.post('/withdraw', authMiddleware, async (req, res) => {
    try {
        const { upiId, amount } = req.body;

        // SECURITY CHECK 1: Validate UPI ID
        if (!upiId || !upiId.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide UPI ID' });
        }

        // Validate UPI ID format (basic validation)
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
        if (!upiRegex.test(upiId.trim())) {
            return res.status(400).json({ success: false, message: 'Invalid UPI ID format' });
        }

        // SECURITY CHECK 2: Check for pending withdrawals
        const pendingWithdrawal = await Withdrawal.findOne({
            userId: req.user.userId,
            status: 'pending'
        });

        if (pendingWithdrawal) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending withdrawal request. Please wait for it to be processed.'
            });
        }

        // SECURITY CHECK 3: Get user with fresh data
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ success: false, message: 'Account suspended' });
        }

        // SECURITY CHECK 4: Validate balance
        if (user.availableBalance < 30) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is ₹30'
            });
        }

        // Parse and validate requested amount
        let amountToWithdraw = parseFloat(amount);

        if (!amountToWithdraw || isNaN(amountToWithdraw)) {
            return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
        }

        if (amountToWithdraw < 30) {
            return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹30' });
        }

        if (amountToWithdraw > user.availableBalance) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct the requested amount
        const previousBalance = user.availableBalance;
        const newBalance = previousBalance - amountToWithdraw;

        // SECURITY CHECK 7: Use atomic operation to prevent race conditions
        const updateResult = await User.findOneAndUpdate(
            {
                _id: user._id,
                availableBalance: previousBalance // Ensure balance hasn't changed
            },
            {
                $inc: { availableBalance: -amountToWithdraw }
            },
            { new: true }
        );

        if (!updateResult) {
            console.log(`⚠️ Balance changed during withdrawal for user ${user.mobileNumber}`);
            return res.status(409).json({
                success: false,
                message: 'Balance changed during withdrawal. Please try again.'
            });
        }

        // Create withdrawal request
        const withdrawal = new Withdrawal({
            userId: user._id,
            mobileNumber: user.mobileNumber,
            amount: amountToWithdraw,
            upiId: upiId.trim(),
            status: 'pending'
        });

        await withdrawal.save();

        console.log(`💰 Withdrawal request created: ₹${amountToWithdraw} for ${user.mobileNumber} to ${upiId.trim()}`);

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully.',
            data: {
                withdrawalId: withdrawal._id,
                amount: withdrawal.amount,
                status: withdrawal.status,
                upiId: withdrawal.upiId,
                previousBalance: previousBalance,
                newBalance: newBalance
            }
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Withdrawal error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Get user's withdrawal history
router.get('/withdrawals', authMiddleware, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ userId: req.user.userId })
            .sort({ requestedAt: -1 });

        res.json({
            success: true,
            data: withdrawals
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Withdrawal history error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Update profile (Name)
router.post('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name: name.trim() },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                name: user.name
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

module.exports = router;
