// Usage: set MONGO_URI in env and run `node scripts/migrate-scale-box-amounts.js`

const mongoose = require('mongoose');
const path = require('path');

const Box = require(path.join(__dirname, '..', 'growcsn-backend', 'database', 'models', 'Box'));

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/grow';

(async () => {
    try {
        await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Find boxes with likely unscaled amounts (e.g., amount < 1000)
        const boxes = await Box.find({ amount: { $lt: 100000 } }).lean();
        console.log('Found', boxes.length, 'boxes with amount < 100000');

        for (const box of boxes) {
            const old = box.amount;
            const scaled = Math.floor(old * 1000);
            await Box.findByIdAndUpdate(box._id, { amount: scaled });
            console.log(`Box ${box._id} (${box.name || 'unknown'}): ${old} -> ${scaled}`);
        }

        console.log('Migration complete. Note: Consider scaling historical UnboxGame records and other related models if needed.');
        process.exit(0);
    } catch (err) {
        console.error('Error', err);
        process.exit(1);
    }
})();
