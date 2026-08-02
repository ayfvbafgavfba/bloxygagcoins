require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../database/models/User');

const checkBannedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/casino');
        
        console.log('Checking for banned users...');
        const bannedUsers = await User.find({ 'ban.expire': { $exists: true, $ne: null } }).select('username ban');
        
        console.log(`Found ${bannedUsers.length} banned users`);
        bannedUsers.forEach(user => {
            console.log(`- ${user.username}: expires ${user.ban.expire || 'never'} (reason: ${user.ban.reason || 'none'})`);
        });
        
        console.log('Disconnecting from MongoDB...');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error checking banned users:', error);
        process.exit(1);
    }
};

checkBannedUsers();
