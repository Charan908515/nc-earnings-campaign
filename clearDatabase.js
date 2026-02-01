require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Earning = require('./models/Earning');
const Withdrawal = require('./models/Withdrawal');
const TelegramUser = require('./models/TelegramUser');

async function clearDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Clear all collections
        console.log('\n🗑️  Clearing all collections...\n');

        const usersDeleted = await User.deleteMany({});
        console.log(`✅ Deleted ${usersDeleted.deletedCount} users`);

        const earningsDeleted = await Earning.deleteMany({});
        console.log(`✅ Deleted ${earningsDeleted.deletedCount} earnings`);

        const withdrawalsDeleted = await Withdrawal.deleteMany({});
        console.log(`✅ Deleted ${withdrawalsDeleted.deletedCount} withdrawals`);

        const telegramUsersDeleted = await TelegramUser.deleteMany({});
        console.log(`✅ Deleted ${telegramUsersDeleted.deletedCount} telegram users`);

        console.log('\n✨ Database cleared successfully!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

// Run the script
clearDatabase();
