const mongoose = require('mongoose');
const TelegramUser = require('../models/TelegramUser');
require('dotenv').config();

const checkDuplicates = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        console.log('🔍 Scanning for duplicate phone numbers (UPI IDs)...');

        // Aggregate to find duplicates
        const duplicates = await TelegramUser.aggregate([
            {
                $group: {
                    _id: "$phone_number",
                    uniqueIds: { $addToSet: "$_id" },
                    count: { $sum: 1 },
                    details: {
                        $push: {
                            chat_id: "$chat_id",
                            registered_at: "$registered_at",
                            db_id: "$_id"
                        }
                    }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('✨ No duplicates found. Every UPI ID is linked to exactly one Telegram account.');
        } else {
            console.log(`⚠️  Found ${duplicates.length} UPI IDs with multiple Telegram accounts:`);

            duplicates.forEach(dup => {
                console.log(`\n📱 UPI ID: ${dup._id} (Count: ${dup.count})`);
                dup.details.forEach((detail, index) => {
                    console.log(`   ${index + 1}. Chat ID: ${detail.chat_id} | Registered: ${detail.registered_at}`);
                });
            });
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkDuplicates();
