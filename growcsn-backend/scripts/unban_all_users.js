require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../database/models/User');

const unbanAllUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/casino');
        
        console.log('Unbanning all users...');
        const result = await User.updateMany(
            { 'ban.expire': { $exists: true } },
            { $set: { ban: {} } }
        );
        
        console.log(`Unbanned ${result.modifiedCount} users`);
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error unbanning users:', error);
        process.exit(1);
    }
};

unbanAllUsers();
