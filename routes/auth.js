const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const campaignConfig = require('../config/campaigns.config');

// Get active campaign
const getActiveCampaign = () => campaignConfig.getActiveCampaign();

// Helper function to extract mobile number from UPI ID
function extractMobileFromUPI(upiId, campaign) {
    if (!campaign.userInput.extractMobileFromUPI) {
        return null;
    }

    // Extract the part before @ symbol
    const username = upiId.split('@')[0];

    // Extract first 10 digits
    const digits = username.replace(/\D/g, '');

    if (digits.length >= 10) {
        return digits.substring(0, 10);
    }

    return null;
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { upiId, password } = req.body;
        const activeCampaign = getActiveCampaign();

        // Validate input
        if (!upiId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide UPI ID and password' });
        }

        // Input length validation
        if (upiId.length > 100) {
            return res.status(400).json({ success: false, message: 'Invalid input length' });
        }
        if (password.length > 128) {
            return res.status(400).json({ success: false, message: 'Invalid input length' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Validate UPI ID format
        const upiPattern = new RegExp(activeCampaign.userInput.upi.pattern);
        if (!upiPattern.test(upiId)) {
            return res.status(400).json({ success: false, message: 'Invalid UPI ID format' });
        }

        // Check if user already exists (by UPI ID) - Generic error message for security
        const existingUser = await User.findOne({ upiId });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Registration failed. Please try a different UPI ID' });
        }

        // Extract mobile number from UPI ID if flag is enabled (for affiliate links)
        let mobileNumber = null;
        if (activeCampaign.userInput.extractMobileFromUPI) {
            const username = upiId.split('@')[0];
            const digits = username.replace(/\D/g, '');
            if (digits.length >= 10) {
                mobileNumber = digits.substring(0, 10);
            }
        }

        // Check if another user already exists with the same mobile number
        if (mobileNumber) {
            const existingByMobile = await User.findOne({ mobileNumber });
            if (existingByMobile && existingByMobile.upiId !== upiId) {
                // Mask the existing UPI ID for privacy (e.g., 91****3854@pa**m)
                const existingUpi = existingByMobile.upiId;
                const [upiUser, upiProvider] = existingUpi.split('@');
                let maskedUser = upiUser;
                if (upiUser.length > 4) {
                    maskedUser = upiUser.substring(0, 2) + '****' + upiUser.substring(upiUser.length - 4);
                }
                let maskedProvider = upiProvider || '';
                if (maskedProvider.length > 3) {
                    maskedProvider = maskedProvider.substring(0, 2) + '**' + maskedProvider.substring(maskedProvider.length - 1);
                }
                const maskedUpi = maskedUser + '@' + maskedProvider;

                return res.status(400).json({
                    success: false,
                    message: `You are already registered with UPI ID: ${maskedUpi}. Please login with that UPI ID instead.`
                });
            }
        }

        // Create new user with UPI ID as primary identifier
        const user = new User({
            upiId: upiId,           // Primary identifier
            mobileNumber: mobileNumber || upiId,  // For affiliate links or fallback
            password,
            name: req.body.name || 'user' // Default to 'user' if not provided
        });
        await user.save();

        // Log user registration details
        console.log('\n' + '='.repeat(60));
        console.log('✅ NEW USER REGISTERED');
        console.log('='.repeat(60));
        console.log('🆔 MongoDB ID:', user._id);
        console.log('👤 Name:', user.name);
        console.log('💳 UPI ID:', user.upiId);
        console.log('📱 Mobile Number:', user.mobileNumber);
        console.log('💰 Initial Balance:', user.availableBalance);
        console.log('📅 Registration Time:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        console.log('='.repeat(60) + '\n');

        // Generate JWT token with longer expiration
        // Generate JWT token with longer expiration (30 days)
        const token = jwt.sign(
            { userId: user._id, upiId: user.upiId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // 30 days
        );

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                upiId: user.upiId,
                mobileNumber: user.mobileNumber,
                totalEarnings: user.totalEarnings,
                availableBalance: user.availableBalance
            }
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Registration error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { upiId, password } = req.body;

        // Validate input
        if (!upiId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide UPI ID and password' });
        }

        // Input length validation
        if (upiId.length > 100 || password.length > 128) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Find user by UPI ID - Use generic error message
        const user = await User.findOne({ upiId });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is suspended
        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact admin.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token with longer expiration
        // Generate JWT token with longer expiration (30 days)
        const token = jwt.sign(
            { userId: user._id, upiId: user.upiId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // 30 days
        );

        // Set token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                upiId: user.upiId,
                mobileNumber: user.mobileNumber,
                totalEarnings: user.totalEarnings,
                availableBalance: user.availableBalance
            }
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Login error:', error);
        }
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
