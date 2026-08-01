require('dotenv').config({ path: __dirname + '/../config/config.env' });
const connectDB = require('../database');
const User = require('../database/models/User');

(async () => {
  try {
    await connectDB();

    // Unmark admin account if it was accidentally set as bot
    const adminUser = await User.findOne({ username: 'big_AMUNGUS666' });
    if (adminUser && adminUser.bot === true) {
      adminUser.bot = false;
      await adminUser.save();
      console.log('Unmarked admin user as bot:', adminUser._id.toString());
    } else if (adminUser) {
      console.log('Admin user was not marked as bot.');
    } else {
      console.log('Admin user not found by username big_AMUNGUS666');
    }

    // Find a non-admin user with a roblox id to mark as bot
    let target = await User.findOne({ 'roblox.id': { $exists: true, $ne: null }, rank: { $ne: 'admin' } });
    if (target) {
      target.bot = true;
      await target.save();
      console.log('Marked non-admin user as bot:', target.username, target._id.toString());
    } else {
      // Create a minimal test bot user
      const created = await User.create({ username: 'bot_test', roblox: { id: '999999998' }, bot: true });
      console.log('Created test bot user:', created._id.toString());
    }

    process.exit(0);
  } catch (err) {
    console.error('Error fixing bot flags:', err);
    process.exit(1);
  }
})();
