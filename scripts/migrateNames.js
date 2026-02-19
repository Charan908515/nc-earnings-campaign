// Migration Script: Add 'name' field to users
require('dotenv').config(); // Load .env from current directory
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const result = await User.updateMany(
            { name: { $exists: false } }, // Find users without 'name'
            { $set: { name: 'user' } }    // Set default name
        );

        console.log(`✅ Migration complete. Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
