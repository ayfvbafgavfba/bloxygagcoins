const express = require('express');
const path = require('path');
const router = express.Router();

const User = require('../../database/models/User');
const RobuxOffer = require('../../database/models/RobuxOffer');
const RobuxTransaction = require('../../database/models/RobuxTransaction');
const Report = require('../../database/models/Report');
const { authorizeBot } = require('../../middleware/auth');

const petValues = require(path.join(__dirname, '..', '..', '..', 'growcsn-frontend', 'src', 'assets', 'pet-values.json'));

const botStatus = {
    lastPing: null,
    txCount: 0,
    slot: 0
};

const normalizeText = (text) => String(text || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');
const findPetValueItem = (value) => {
    if (!Array.isArray(petValues.items)) {
        return null;
    }
    const normalized = normalizeText(value);
    if (normalized === '') {
        return null;
    }
    return petValues.items.find((item) => {
        if (normalizeText(item.slug) === normalized) return true;
        if (normalizeText(item.name) === normalized) return true;
        if (normalizeText(item.display_name) === normalized) return true;
        if (Array.isArray(item.variants)) {
            return item.variants.some((variant) => normalizeText(variant.id) === normalized);
        }
        return false;
    }) || null;
};

const getBotItemTokenValue = (item) => {
    if (item === undefined || item === null) {
        return null;
    }
    if (typeof item.amount === 'number' && !Number.isNaN(item.amount) && item.amount > 0) {
        return Math.floor(item.amount);
    }
    const uniqueId = typeof item.uniqueId === 'string' ? item.uniqueId.trim() : '';
    const variantId = typeof item.variantId === 'string' ? item.variantId.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const petItem = findPetValueItem(uniqueId) || findPetValueItem(variantId) || findPetValueItem(name);
    if (petItem === null) {
        return null;
    }
    return Number(Array.isArray(petItem.variants) && petItem.variants.length > 0
        ? Number(petItem.variants[0].tokens || 0)
        : Number(petItem.variant_tokens?.Normal || 0)
    );
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getBotUser = async (data) => {
    if(data === undefined || data === null) {
        throw new Error('Bot user data is missing.');
    }

    if(typeof data.username !== 'string' || data.username.trim().length === 0) {
        if(typeof data.roblox_username === 'string' && data.roblox_username.trim().length > 0) {
            data.username = data.roblox_username.trim();
        } else if(typeof data.robloxUsername === 'string' && data.robloxUsername.trim().length > 0) {
            data.username = data.robloxUsername.trim();
        }
    }

    if(data.userId !== undefined && typeof data.userId === 'string' && data.userId.trim().length > 0) {
        const userById = await User.findById(data.userId).select('username roblox').lean();
        if(userById !== null) { return userById; }
    }

    if(data.robloxId !== undefined && data.robloxId !== null && String(data.robloxId).trim().length > 0) {
        const userByRobloxId = await User.findOne({ 'roblox.id': String(data.robloxId).trim() }).select('username roblox').lean();
        if(userByRobloxId !== null) { return userByRobloxId; }
    }

    if(data.username !== undefined && typeof data.username === 'string' && data.username.trim().length > 0) {
        const username = data.username.trim();
        const userByUsername = await User.findOne({ username: { $regex: `^${escapeRegExp(username)}$`, $options: 'i' } }).select('username roblox').lean();
        if(userByUsername !== null) { return userByUsername; }

        const userByRobloxId = await User.findOne({ 'roblox.id': username }).select('username roblox').lean();
        if(userByRobloxId !== null) { return userByRobloxId; }
    }

    throw new Error('User not found for bot action.');
};

const formatWithdrawalOffer = (offer) => ({
    _id: offer._id,
    offerId: offer._id,
    type: offer.type,
    amount: offer.amount,
    state: offer.state,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    username: offer.user.username,
    items: offer.data && Array.isArray(offer.data.items) ? offer.data.items : [],
    user: {
        _id: offer.user._id,
        username: offer.user.username,
        robloxId: offer.user.roblox.id
    }
});

module.exports = (io) => {
    router.get('/pending-withdrawals', authorizeBot, async(req, res) => {
        try {
            const offersDatabase = await RobuxOffer.find({ type: 'gag2-withdraw', state: 'created' }).sort({ createdAt: 1 }).populate({ path: 'user', select: 'username roblox.id' }).lean();
            return res.status(200).json({ success: true, withdrawals: offersDatabase.map(formatWithdrawalOffer) });
        } catch(err) {
            return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.get('/gag/ping', authorizeBot, async(req, res) => {
        botStatus.lastPing = new Date().getTime();
        return res.status(200).json({
            success: true,
            time: new Date().toISOString(),
            slot: botStatus.slot || 0,
            tx_count: botStatus.txCount || 0
        });
    });

    router.get('/gag/accounts', async(req, res) => {
        try {
            const botUsers = await User.find({ bot: true, 'roblox.id': { $exists: true, $ne: null } }).select('username roblox.id').lean();
            const online = botStatus.lastPing !== null && new Date().getTime() - botStatus.lastPing < 1000 * 60;
            const accounts = botUsers.map((bot) => ({
                _id: bot._id,
                username: bot.username,
                robloxId: bot.roblox.id,
                online: online
            }));

            return res.status(200).json({ success: true, accounts });
        } catch(err) {
            return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.get('/gag/next-bot', authorizeBot, async(req, res) => {
        try {
            const excludeSlot = Number(req.query.exclude_slot || 0);
            const botUsers = await User.find({ bot: true, 'roblox.id': { $exists: true, $ne: null } }).select('username roblox.id').lean();
            const bot = botUsers.find((botUser, index) => index !== excludeSlot) || botUsers[0] || null;
            return res.status(200).json({ success: true, bot: bot ? { username: bot.username, robloxId: bot.roblox.id } : null });
        } catch(err) {
            return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.post('/gag/tx-complete', authorizeBot, async(req, res) => {
        try {
            if(req.body.username === undefined || typeof req.body.username !== 'string' || req.body.username.trim().length === 0) {
                throw new Error('Bot username is required.');
            }

            botStatus.txCount = (botStatus.txCount || 0) + 1;
            return res.status(200).json({ success: true, tx_count: botStatus.txCount });
        } catch(err) {
            return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    router.post('/deposit', authorizeBot, async(req, res) => {
        try {
            let amount = null;
            if(Array.isArray(req.body.items) && req.body.items.length > 0) {
                let totalTokens = 0;
                const invalidItems = [];

                for(const item of req.body.items) {
                    if(item === null || typeof item !== 'object') {
                        continue;
                    }
                    const count = Number(item.qty || item.count || 1);
                    if(!Number.isInteger(count) || count <= 0) {
                        invalidItems.push(item.name || item.uniqueId || 'unknown');
                        continue;
                    }

                    const itemTokens = getBotItemTokenValue(item);
                    if(itemTokens === null || itemTokens <= 0) {
                        invalidItems.push(item.name || item.uniqueId || 'unknown');
                        continue;
                    }

                    totalTokens += itemTokens * count;
                }

                if(totalTokens <= 0) {
                    throw new Error('Deposit amount is invalid.');
                }
                if(invalidItems.length > 0) {
                    throw new Error(`Deposit items are invalid: ${[...new Set(invalidItems)].join(', ')}`);
                }

                amount = Math.floor(totalTokens * 1000);
            } else {
                if(req.body.amount === undefined || typeof req.body.amount !== 'number' || Number.isNaN(req.body.amount) || req.body.amount <= 0) {
                    throw new Error('Deposit amount is invalid.');
                }
                amount = Math.floor(req.body.amount);
            }

            const userDatabase = await getBotUser(req.body);
            const depositData = {
                amount: amount,
                data: {
                    productId: typeof req.body.productId === 'string' ? req.body.productId : undefined,
                    tradeId: typeof req.body.tradeId === 'string' ? req.body.tradeId : undefined
                },
                deposit: {
                    user: userDatabase._id
                },
                state: 'completed'
            };

            const transactionDatabase = await RobuxTransaction.create(depositData);

            const updatedUser = await User.findByIdAndUpdate(userDatabase._id, {
                $inc: {
                    balance: amount,
                    'stats.deposit': amount,
                    'limits.betToWithdraw': amount
                },
                updatedAt: new Date().getTime()
            }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean();

            await Report.findOneAndUpdate({ createdAt: new Date().toISOString().slice(0, 10) }, {
                $inc: {
                    'stats.total.deposit': amount,
                    'stats.robux.deposit': amount
                }
            }, { upsert: true });

            if(io !== undefined && io.of !== undefined) {
                io.of('/general').to(updatedUser._id.toString()).emit('user', { user: updatedUser });
            }

            return res.status(200).json({ success: true, transaction: transactionDatabase.toObject(), user: updatedUser });
        } catch(err) {
            return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    return router;
};
