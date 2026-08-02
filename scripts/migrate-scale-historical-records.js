// Usage: set MONGO_URI in env and run `node scripts/migrate-scale-historical-records.js`
// This script scales historical BattlesGame.amount, BattlesBet.amount/payout, and UnboxGame.amount/payout

const mongoose = require('mongoose');
const path = require('path');

const BattlesGame = require(path.join(__dirname, '..', 'growcsn-backend', 'database', 'models', 'BattlesGame'));
const BattlesBet = require(path.join(__dirname, '..', 'growcsn-backend', 'database', 'models', 'BattlesBet'));
const UnboxGame = require(path.join(__dirname, '..', 'growcsn-backend', 'database', 'models', 'UnboxGame'));

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/grow';

(async () => {
    try {
        await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const THRESHOLD = 100000; // values below this are likely unscaled (e.g., 147)

        // Scale BattlesGame.amount
        const games = await BattlesGame.find({ amount: { $lt: THRESHOLD } }).lean();
        console.log('BattlesGame to scale:', games.length);
        for (const g of games) {
            const old = g.amount;
            const scaled = Math.floor(old * 1000);
            await BattlesGame.findByIdAndUpdate(g._id, { amount: scaled });
            console.log(`BattlesGame ${g._id}: ${old} -> ${scaled}`);
        }

        // Scale BattlesBet.amount and payouts
        const bets = await BattlesBet.find({ $or: [ { amount: { $lt: THRESHOLD } }, { payout: { $lt: THRESHOLD } } ] }).lean();
        console.log('BattlesBet to scale:', bets.length);
        for (const b of bets) {
            const update = {};
            if (b.amount !== undefined && b.amount < THRESHOLD) update.amount = Math.floor(b.amount * 1000);
            if (b.payout !== undefined && b.payout < THRESHOLD) update.payout = Math.floor(b.payout * 1000);
            if (Object.keys(update).length > 0) {
                // Recalculate multiplier if payout/amount available
                if (update.payout !== undefined || update.amount !== undefined) {
                    const newPayout = update.payout !== undefined ? update.payout : b.payout;
                    const newAmount = update.amount !== undefined ? update.amount : b.amount;
                    update.multiplier = Math.floor((newPayout / (newAmount === 0 ? 10 : newAmount)) * 100);
                }
                await BattlesBet.findByIdAndUpdate(b._id, update);
                console.log(`BattlesBet ${b._id} updated`, update);
            }
        }

        // Scale UnboxGame.amount and payout
        const ugames = await UnboxGame.find({ $or: [ { amount: { $lt: THRESHOLD } }, { payout: { $lt: THRESHOLD } } ] }).lean();
        console.log('UnboxGame to scale:', ugames.length);
        for (const ug of ugames) {
            const update = {};
            if (ug.amount !== undefined && ug.amount < THRESHOLD) update.amount = Math.floor(ug.amount * 1000);
            if (ug.payout !== undefined && ug.payout < THRESHOLD) update.payout = Math.floor(ug.payout * 1000);
            if (Object.keys(update).length > 0) {
                await UnboxGame.findByIdAndUpdate(ug._id, update);
                console.log(`UnboxGame ${ug._id} updated`, update);
            }
        }

        console.log('Historical scaling migration complete. Please verify on a staging environment first.');
        process.exit(0);
    } catch (err) {
        console.error('Error', err);
        process.exit(1);
    }
})();
