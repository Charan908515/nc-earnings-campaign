const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Earning = require('../models/Earning');
const Withdrawal = require('../models/Withdrawal');
const CampaignState = require('../models/CampaignState');
const Campaign = require('../models/Campaign');
const { sendWithdrawalApprovalNotification, sendWithdrawalRejectionNotification } = require('../config/telegram');

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate credentials
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Generate JWT token with admin role - Long expiry (30 days)
      const token = jwt.sign(
        { role: 'admin', username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Set token as HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        message: 'Admin login successful'
      });
    } else {
      res.status(403).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin login error:', error);
    }
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

// Get all pending withdrawals
router.get('/withdrawals', adminMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'name mobileNumber')
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin withdrawals fetch error:', error);
    }
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

// Approve withdrawal
router.post('/withdrawals/:id/approve', adminMiddleware, async (req, res) => {
  try {
    // SECURITY CHECK 1: Validate withdrawal ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID' });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    // SECURITY CHECK 2: Ensure withdrawal is pending
    if (withdrawal.status !== 'pending') {
      console.log(`⚠️ Attempt to approve non-pending withdrawal: ${req.params.id} (status: ${withdrawal.status})`);
      return res.status(400).json({
        success: false,
        message: `Withdrawal already ${withdrawal.status}. Cannot approve.`
      });
    }

    // SECURITY CHECK 3: Validate withdrawal amount is positive
    if (withdrawal.amount <= 0) {
      console.log(`⚠️ Invalid withdrawal amount: ${withdrawal.amount}`);
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    // Use atomic update to prevent race conditions
    const updateResult = await Withdrawal.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'pending' // Only update if still pending
      },
      {
        $set: {
          status: 'completed',
          processedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updateResult) {
      console.log(`⚠️ Withdrawal status changed during approval: ${req.params.id}`);
      return res.status(409).json({
        success: false,
        message: 'Withdrawal was already processed by another admin'
      });
    }

    console.log(`✅ Withdrawal approved: ₹${withdrawal.amount} to ${withdrawal.upiId} for ${withdrawal.mobileNumber}`);

    // Get user's current balance for notification
    const user = await User.findById(withdrawal.userId);
    const currentBalance = user ? user.availableBalance : 0;

    // Send Telegram notification to user
    try {
      await sendWithdrawalApprovalNotification({
        userId: withdrawal.userId,
        upiId: withdrawal.upiId,
        amount: withdrawal.amount,
        processedAt: updateResult.processedAt,
        closingBalance: currentBalance
      });
    } catch (notifError) {
      console.error('Failed to send approval notification:', notifError.message);
    }

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      data: updateResult
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Withdrawal approval error:', error);
    }
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

// Reject withdrawal
router.post('/withdrawals/:id/reject', adminMiddleware, async (req, res) => {
  try {
    // SECURITY CHECK 1: Validate withdrawal ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID' });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    // SECURITY CHECK 2: Ensure withdrawal is pending
    if (withdrawal.status !== 'pending') {
      console.log(`⚠️ Attempt to reject non-pending withdrawal: ${req.params.id} (status: ${withdrawal.status})`);
      return res.status(400).json({
        success: false,
        message: `Withdrawal already ${withdrawal.status}. Cannot reject.`
      });
    }

    // SECURITY CHECK 3: Use atomic operations to prevent race conditions
    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Atomically update withdrawal status
    const updateResult = await Withdrawal.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'pending' // Only update if still pending
      },
      {
        $set: {
          status: 'rejected',
          processedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updateResult) {
      console.log(`⚠️ Withdrawal status changed during rejection: ${req.params.id}`);
      return res.status(409).json({
        success: false,
        message: 'Withdrawal was already processed by another admin'
      });
    }

    // Return amount to user's balance
    user.availableBalance += withdrawal.amount;
    await user.save();

    console.log(`❌ Withdrawal rejected: ₹${withdrawal.amount} returned to ${withdrawal.mobileNumber}`);

    // Send Telegram notification to user
    try {
      await sendWithdrawalRejectionNotification({
        userId: withdrawal.userId,
        upiId: withdrawal.upiId,
        amount: withdrawal.amount,
        processedAt: updateResult.processedAt,
        newBalance: user.availableBalance
      });
    } catch (notifError) {
      console.error('Failed to send rejection notification:', notifError.message);
    }

    res.json({
      success: true,
      message: 'Withdrawal rejected and amount returned to user',
      data: {
        withdrawal: updateResult,
        refundedAmount: withdrawal.amount,
        userNewBalance: user.availableBalance
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Withdrawal rejection error:', error);
    }
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});

// Get platform statistics
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    // Helper to get start of day in IST (UTC+5:30)
    const getISTStartOfDay = (date = new Date()) => {
      // Create a date object for the current time
      const now = new Date(date);

      // Convert to IST time string
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istString);

      // Set to midnight
      istDate.setHours(0, 0, 0, 0);

      // We now have "00:00 IST" as a Date object in the *server's* timezone context 
      // (which is confusing), OR we can just act on the timestamp.
      // A more robust way without locale string parsing (which can vary):

      // 1. Get UTC timestamp
      const utcTs = now.getTime() + (now.getTimezoneOffset() * 60000);

      // 2. Add IST offset (+5.5h) to get "IST Time" in linear ms
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const istLinear = utcTs + istOffsetMs;

      // 3. Create date from this linear time to extract day boundaries
      const istPseudoDate = new Date(istLinear);
      istPseudoDate.setHours(0, 0, 0, 0); // Floor to midnight

      // 4. Subtract offset to get back to the true UTC timestamp of "IST Midnight"
      return new Date(istPseudoDate.getTime() - istOffsetMs);
    };

    const todayStart = getISTStartOfDay();

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayStart);
    yesterdayEnd.setMilliseconds(-1);

    // Month Start in IST
    const monthStartPseudo = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (5.5 * 3600000));
    monthStartPseudo.setDate(1);
    monthStartPseudo.setHours(0, 0, 0, 0);
    const monthStart = new Date(monthStartPseudo.getTime() - (5.5 * 3600000));

    // Helper for aggregations
    const getStats = async (startDate, endDate) => {
      const matchStage = { createdAt: { $gte: startDate } };
      if (endDate) matchStage.createdAt.$lte = endDate;

      const stats = await Earning.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            total: { $sum: '$payment' }
          }
        }
      ]);

      // Calculate totals and format breakdown
      const result = {
        count: 0,
        total: 0,
        breakdown: {}
      };

      stats.forEach(s => {
        result.count += s.count;
        result.total += s.total;
        const type = s._id || 'Unknown';
        result.breakdown[type] = s.count;
      });

      return result;
    };

    const [
      totalUsers,
      totalEarningsResult,
      pendingWithdrawals,
      totalWithdrawalResult,
      totalWalletResult,
      statsToday,
      statsYesterday,
      statsMonth
    ] = await Promise.all([
      User.countDocuments(),
      Earning.aggregate([{ $group: { _id: null, total: { $sum: '$payment' } } }]),
      Withdrawal.countDocuments({ status: 'pending' }),
      Withdrawal.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$availableBalance' } } }]),
      getStats(todayStart),
      getStats(yesterdayStart, yesterdayEnd),
      getStats(monthStart)
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalEarnings: totalEarningsResult[0]?.total || 0,
        totalWalletBalance: totalWalletResult[0]?.total || 0,
        pendingWithdrawals,
        totalWithdrawalAmount: totalWithdrawalResult[0]?.total || 0,
        postbacks: {
          today: { count: statsToday.count, breakdown: statsToday.breakdown },
          yesterday: { count: statsYesterday.count, breakdown: statsYesterday.breakdown },
          month: { count: statsMonth.count, breakdown: statsMonth.breakdown }
        },
        earnings: {
          today: statsToday.total,
          yesterday: statsYesterday.total,
          month: statsMonth.total
        }
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password'); // Exclude password from result

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Unsuspend user
router.post('/users/:id/unsuspend', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isSuspended: false });
    res.json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Suspend user
router.post('/users/:id/suspend', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isSuspended: true });
    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    // Optional: Check if user has pending withdrawals?
    // For now, simple delete
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user balance
router.post('/users/:id/balance', adminMiddleware, async (req, res) => {
  try {
    const { newBalance } = req.body;

    if (typeof newBalance !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid balance amount' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.availableBalance = newBalance;
    await user.save();

    res.json({ success: true, message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get payment history (successful withdrawals only)
router.get('/history', adminMiddleware, async (req, res) => {
  try {
    const successfulWithdrawals = await Withdrawal.find({ status: 'completed' })
      .sort({ processedAt: -1 })
      .populate('userId', 'name')
      .select('userId mobileNumber amount upiId requestedAt processedAt');

    res.json({
      success: true,
      data: successfulWithdrawals
    });
  } catch (error) {
    console.error('Payment history fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get system logs (all postback events)
router.get('/logs', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Earning.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name')
        .select('userId createdAt eventType mobileNumber payment offerId campaignName'),
      Earning.countDocuments()
    ]);

    // Format logs with campaign name
    const formattedLogs = logs.map((log, index) => ({
      sno: skip + index + 1,
      time: log.createdAt,
      eventName: log.eventType,
      userName: log.userId?.name || 'Unknown',
      upiId: log.mobileNumber,
      payment: log.payment,
      offerId: log.offerId
    }));

    res.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Logs fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 📢 CAMPAIGN MANAGEMENT ROUTES
// ==========================================

// Get all campaigns with status
router.get('/campaigns', adminMiddleware, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    const data = campaigns.map(camp => ({
      slug: camp.slug,
      name: camp.name,
      description: camp.description,
      isActive: camp.isActive
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle campaign status
router.post('/campaigns/:slug/toggle', adminMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const { isActive } = req.body;

    const campaign = await Campaign.findOneAndUpdate(
      { slug },
      { isActive },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: `Campaign ${isActive ? 'activated' : 'suspended'} successfully`,
      data: { slug, isActive: campaign.isActive }
    });
  } catch (error) {
    console.error('Campaign toggle error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new campaign
router.post('/campaigns', adminMiddleware, async (req, res) => {
  try {
    const {
      id, slug, name, wallet_display, description, isActive,
      process: processSteps,
      affiliate, postbackMapping, events,
      branding, userInput, settings
    } = req.body;

    // Validate required fields
    if (!id || !slug || !name) {
      return res.status(400).json({ success: false, message: 'id, slug, and name are required' });
    }

    // Check for duplicate slug/id
    const existing = await Campaign.findOne({ $or: [{ slug }, { id }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A campaign with this slug or id already exists' });
    }

    // Convert events to array format
    let eventsArray = [];
    if (events && Array.isArray(events)) {
      eventsArray = events.map(evt => ({
        key: evt.key,
        identifiers: evt.identifiers || [],
        displayName: evt.displayName || '',
        amount: parseFloat(evt.amount) || 0
      }));
    }

    const affUrl = affiliate?.affiliateUrl || '';
    const userIdParam = affiliate?.userIdParam || 'p1';

    const campaign = new Campaign({
      id,
      slug,
      name,
      wallet_display: wallet_display || '',
      description: description || '',
      isActive: isActive !== false,
      process: processSteps || [],
      affiliate: {
        baseUrl: affUrl,
        affiliateUrl: affUrl,
        offerId: 0,
        affiliateId: 0,
        clickIdParam: userIdParam,
        userIdParam: userIdParam
      },
      postbackMapping: {
        userId: postbackMapping?.userId || 'sub1',
        payment: postbackMapping?.payment || 'payout',
        eventName: postbackMapping?.eventName || 'event',
        offerId: postbackMapping?.offerId || 'offer_id',
        ipAddress: postbackMapping?.ipAddress || 'ip',
        timestamp: postbackMapping?.timestamp || 'tdate'
      },
      events: eventsArray,
      branding: {
        logoText: branding?.logoText || name,
        tagline: branding?.tagline || '',
        campaignDisplayName: branding?.campaignDisplayName || name + ' Offer'
      },
      userInput: {
        fieldType: userInput?.fieldType || 'mobile',
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
          title: `Welcome to ${name} Campaign!`,
          description: 'To register and get notifications:'
        },
        notification: {
          title: 'NEW CASHBACK RECEIVED!',
          showCumulativeEarnings: true,
          footer: 'Powered by @NC Earnings'
        },
        help: {
          title: `${name} Help`,
          howItWorks: [
            'Register with your UPI ID using /start YOUR_UPI_ID',
            `Complete the ${name} offer`,
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
        currency: settings?.currency || '₹',
        minWithdrawal: parseInt(settings?.minWithdrawal) || 30
      }
    });

    await campaign.save();
    console.log(`✅ New campaign added: ${name} (slug: ${slug})`);

    res.json({
      success: true,
      message: 'Campaign added successfully',
      data: { id, slug, name },
      postbackSecret: process.env.POSTBACK_SECRET
    });

  } catch (error) {
    console.error('Add campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to add campaign: ' + error.message });
  }
});

// Get a single campaign
router.get('/campaigns/:slug', adminMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const campaign = await Campaign.findOne({ slug });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Build a preview of the affiliate URL
    let affiliateUrlPreview = campaign.affiliate.affiliateUrl || campaign.affiliate.baseUrl;

    const dataToSend = campaign.toObject();
    dataToSend.affiliate.affiliateUrl = affiliateUrlPreview;

    // Convert events array back to the format the admin frontend expects
    dataToSend.events = campaign.events;

    res.json({
      success: true,
      data: dataToSend,
      postbackSecret: process.env.POSTBACK_SECRET
    });
  } catch (error) {
    console.error('Fetch campaign error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an existing campaign
router.put('/campaigns/:slug', adminMiddleware, async (req, res) => {
  try {
    const currentSlug = req.params.slug;
    const {
      id, slug, name, wallet_display, description, isActive,
      process: processSteps,
      affiliate, postbackMapping, events,
      branding, userInput, settings
    } = req.body;

    if (!id || !slug || !name) {
      return res.status(400).json({ success: false, message: 'id, slug, and name are required' });
    }

    // Check if new slug already exists for a DIFFERENT campaign
    if (slug !== currentSlug) {
      const existingBySlug = await Campaign.findOne({ slug });
      if (existingBySlug) {
        return res.status(400).json({ success: false, message: 'Another campaign with this slug already exists' });
      }
    }

    // Convert events to array format
    let eventsArray = [];
    if (events && Array.isArray(events)) {
      eventsArray = events.map(evt => ({
        key: evt.key,
        identifiers: evt.identifiers || [],
        displayName: evt.displayName || '',
        amount: parseFloat(evt.amount) || 0
      }));
    }

    const affUrl = affiliate?.affiliateUrl || '';
    const userIdParam = affiliate?.userIdParam || 'p1';

    const updateData = {
      id,
      slug,
      name,
      wallet_display: wallet_display || '',
      description: description || '',
      isActive: isActive !== false,
      process: processSteps || [],
      affiliate: {
        baseUrl: affUrl,
        affiliateUrl: affUrl,
        offerId: 0,
        affiliateId: 0,
        clickIdParam: userIdParam,
        userIdParam: userIdParam
      },
      postbackMapping: {
        userId: postbackMapping?.userId || 'sub1',
        payment: postbackMapping?.payment || 'payout',
        eventName: postbackMapping?.eventName || 'event',
        offerId: postbackMapping?.offerId || 'offer_id',
        ipAddress: postbackMapping?.ipAddress || 'ip',
        timestamp: postbackMapping?.timestamp || 'tdate'
      },
      events: eventsArray,
      branding: {
        logoText: branding?.logoText || name,
        tagline: branding?.tagline || '',
        campaignDisplayName: branding?.campaignDisplayName || name + ' Offer'
      },
      userInput: {
        fieldType: userInput?.fieldType || 'mobile',
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
          title: `Welcome to ${name} Campaign!`,
          description: 'To register and get notifications:'
        },
        notification: {
          title: 'NEW CASHBACK RECEIVED!',
          showCumulativeEarnings: true,
          footer: 'Powered by @NC Earnings'
        },
        help: {
          title: `${name} Help`,
          howItWorks: [
            'Register with your UPI ID using /start YOUR_UPI_ID',
            `Complete the ${name} offer`,
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
        currency: settings?.currency || '₹',
        minWithdrawal: parseInt(settings?.minWithdrawal) || 30
      }
    };

    const campaign = await Campaign.findOneAndUpdate(
      { slug: currentSlug },
      updateData,
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: { id, slug, name },
      postbackSecret: process.env.POSTBACK_SECRET
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to update campaign: ' + error.message });
  }
});

// Delete a campaign
router.delete('/campaigns/:slug', adminMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;

    const campaign = await Campaign.findOneAndDelete({ slug });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    console.log(`🗑️ Campaign deleted: ${campaign.name} (slug: ${slug})`);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete campaign: ' + error.message });
  }
});

module.exports = router;
