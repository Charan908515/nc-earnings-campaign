const mongoose = require('mongoose');
const TelegramUser = require('../models/TelegramUser');
require('dotenv').config();

const cleanUpDuplicates = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        console.log('🔍 Finding all users...');
        const users = await TelegramUser.find({}).sort({ registered_at: -1 });

        const uniqueUsers = new Map();
        const duplicates = [];

        // Group users by phone_number (UPI ID)
        // Since we sorted by registered_at DESC, the first one encountered is the most recent
        for (const user of users) {
            // If phone_number is already in map, this one is older -> Duplicate
            if (uniqueUsers.has(user.phone_number)) {
                duplicates.push(user._id);
            } else {
                uniqueUsers.set(user.phone_number, user);
            }
        }

        console.log(`📊 Found ${users.length} total records.`);
        console.log(`🔥 Found ${duplicates.length} duplicate records to delete.`);

        if (duplicates.length > 0) {
            const result = await TelegramUser.deleteMany({ _id: { $in: duplicates } });
            console.log(`✅ Deleted ${result.deletedCount} duplicate records.`);
        } else {
            console.log('✨ No duplicates found.');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

cleanUpDuplicates();
