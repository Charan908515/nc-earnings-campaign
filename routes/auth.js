const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const campaignConfig = require('../config/campaigns.config');

// Helper function to extract mobile number from UPI ID
function extractMobileFromUPI(upiId) {
    if (!campaignConfig.userInput.extractMobileFromUPI) {
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
        const upiPattern = new RegExp(campaignConfig.userInput.upi.pattern);
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
        if (campaignConfig.userInput.extractMobileFromUPI) {
            const username = upiId.split('@')[0];
            const digits = username.replace(/\D/g, '');
            if (digits.length >= 10) {
                mobileNumber = digits.substring(0, 10);
            }
        }

        // Create new user with UPI ID as primary identifier
        const user = new User({
            upiId: upiId,           // Primary identifier
            mobileNumber: mobileNumber || upiId,  // For affiliate links or fallback
            password
        });
        await user.save();

        // Generate JWT token with shorter expiration
        const token = jwt.sign(
            { userId: user._id, upiId: user.upiId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // 15 minutes for better security
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
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

        // Generate JWT token with shorter expiration
        const token = jwt.sign(
            { userId: user._id, upiId: user.upiId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // 15 minutes for better security
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
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

module.exports = router;
