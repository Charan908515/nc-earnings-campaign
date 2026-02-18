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
                upiId: user.upiId
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
        const earnings = await Earning.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('createdAt eventType payment campaignName');

        res.json({
            success: true,
            data: earnings
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

        // SECURITY CHECK 5: Minimum withdrawal amount (redundant with check 4, but kept for clarity if logic changes)
        const MIN_WITHDRAWAL = 30; // Minimum ₹30
        if (user.availableBalance < MIN_WITHDRAWAL) {
            return res.status(400).json({
                success: false,
                message: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`
            });
        }

        // SECURITY CHECK 6: If amount is provided, validate it matches available balance
        if (amount !== undefined && amount !== user.availableBalance) {
            console.log(`⚠️ Withdrawal amount mismatch: requested ${amount}, available ${user.availableBalance}`);
            return res.status(400).json({
                success: false,
                message: 'Withdrawal amount does not match available balance'
            });
        }

        // Store the withdrawal amount before resetting balance
        const withdrawalAmount = user.availableBalance;

        // SECURITY CHECK 7: Use atomic operation to prevent race conditions
        const updateResult = await User.findOneAndUpdate(
            {
                _id: user._id,
                availableBalance: withdrawalAmount // Ensure balance hasn't changed
            },
            {
                $set: { availableBalance: 0 }
            },
            { new: false } // Return old document to verify
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
            amount: withdrawalAmount,
            upiId: upiId.trim(),
            status: 'pending'
        });

        await withdrawal.save();

        console.log(`💰 Withdrawal request created: ₹${withdrawalAmount} for ${user.mobileNumber} to ${upiId.trim()}`);

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully. Your balance has been reset to ₹0.',
            data: {
                withdrawalId: withdrawal._id,
                amount: withdrawal.amount,
                status: withdrawal.status,
                upiId: withdrawal.upiId,
                previousBalance: withdrawalAmount,
                newBalance: 0
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

module.exports = router;
