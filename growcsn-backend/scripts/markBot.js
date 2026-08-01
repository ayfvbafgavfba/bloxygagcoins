require('dotenv').config({ path: __dirname + '/../config/config.env' });
const connectDB = require('../database');
const User = require('../database/models/User');

(async () => {
  try {
    await connectDB();

    // Try to find an existing user with a roblox id
    let user = await User.findOne({ 'roblox.id': { $exists: true, $ne: null } }).lean();

    if (user) {
      // Update the existing user to be a bot
      await User.findByIdAndUpdate(user._id, { bot: true });
      console.log('Updated existing user to bot:', user._id.toString());
    } else {
      // Create a minimal test bot user
      const created = await User.create({ username: 'bot_test', roblox: { id: '999999999' }, bot: true });
      console.log('Created test bot user:', created._id.toString());
    }

    process.exit(0);
  } catch (err) {
    console.error('Error marking bot user:', err);
    process.exit(1);
  }
})();
