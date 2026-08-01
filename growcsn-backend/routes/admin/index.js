const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const RobuxOffer = require('../../database/models/RobuxOffer');
const Report = require('../../database/models/Report');
const { authorizeUser, authorizeAdmin, authorizeBot } = require('../../middleware/auth');
const { settingGet, settingSetValue } = require('../../utils/setting');

const authorizeBotOrAdmin = async(req, res, next) => {
    const botKey = req.header('x-bot-key') || (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if(typeof botKey === 'string' && botKey.trim().length > 0 && botKey === process.env.BOT_KEY) {
        return next();
    }

    try {
        if(typeof req.header('x-auth-token') !== 'string') {
            return res.status(401).json({ success: false, error: { type: 'error', message: 'Authorization denied.' } });
        }
        req.user = await jwt.verify(req.header('x-auth-token'), process.env.TOKEN_SECRET);
        if(req.user.rank !== 'admin') {
            return res.status(403).json({ success: false, error: { type: 'error', message: 'You are not authorized to access this route.' } });
        }
        next();
    } catch(err) {
        return res.status(401).json({ success: false, error: { type: 'error', message: 'Authorization denied.' } });
    }
};

router.post('/withdrawals/complete', authorizeBotOrAdmin, async(req, res) => {
    try {
        const offerId = typeof req.body.offerId === 'string' && req.body.offerId.trim().length > 0 ? req.body.offerId.trim() :
            typeof req.body.id === 'string' && req.body.id.trim().length > 0 ? req.body.id.trim() : null;
        if(offerId === null) {
            throw new Error('Offer id is invalid.');
        }
        const success = req.body.success === undefined ? true : req.body.success;

        const offerDatabase = await RobuxOffer.findById(offerId).populate({ path: 'user', select: 'balance stats' }).lean();
        if(offerDatabase === null) {
            throw new Error('Offer not found.');
        }
        if(['withdraw', 'gag2-withdraw'].includes(offerDatabase.type) !== true) {
            throw new Error('Offer is not a withdraw.');
        }
        if(['created', 'pending'].includes(offerDatabase.state) !== true) {
            throw new Error('Offer is not in a valid state for completion.');
        }

        if(req.body.success === true || req.body.success === 'true') {
            const updatedOffer = await RobuxOffer.findByIdAndUpdate(offerDatabase._id, {
                state: 'completed',
                updatedAt: new Date().getTime()
            }, { new: true }).lean();

            // If this is a GAG2 withdraw, decrement global allowed counts for the withdrawn items
            try {
                if(updatedOffer && updatedOffer.type === 'gag2-withdraw' && updatedOffer.data && Array.isArray(updatedOffer.data.items)) {
                    const settings = settingGet();
                    const currCounts = (settings && settings.limited && settings.limited.allowedPetCounts) ? Object.assign({}, settings.limited.allowedPetCounts) : {};

                    for(const it of updatedOffer.data.items) {
                        const key = String(it.uniqueId);
                        const dec = Number(it.count || 1);
                        const prev = Number(currCounts[key] || 0);
                        currCounts[key] = Math.max(0, prev - dec);
                    }

                    // Persist updated counts and refresh in-memory settings
                    const newSettings = await settingSetValue('limited.allowedPetCounts', currCounts);

                    // broadcast updated settings to connected clients
                    try { io.of('/general').emit('settings', { settings: newSettings }); } catch(e) { }
                }
            } catch(e) {
                console.error('Failed to update allowedPetCounts on withdraw complete:', e.message);
            }

            return res.status(200).json({ success: true, offer: updatedOffer });
        }

        // Offer canceled: refund user and restore allowedPetCounts if gag2-withdraw
        const updatedUser = await User.findByIdAndUpdate(offerDatabase.user._id, {
            $inc: {
                balance: offerDatabase.amount,
                'stats.withdraw': -offerDatabase.amount
            },
            updatedAt: new Date().getTime()
        }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean();

        // Restore counts for gag2 withdraws
        try {
            if(offerDatabase && offerDatabase.type === 'gag2-withdraw' && offerDatabase.data && Array.isArray(offerDatabase.data.items)) {
                const settings = settingGet();
                const currCounts = (settings && settings.limited && settings.limited.allowedPetCounts) ? Object.assign({}, settings.limited.allowedPetCounts) : {};

                for(const it of offerDatabase.data.items) {
                    const key = String(it.uniqueId);
                    const inc = Number(it.count || 1);
                    const prev = Number(currCounts[key] || 0);
                    currCounts[key] = prev + inc;
                }

                const newSettings = await settingSetValue('limited.allowedPetCounts', currCounts);
                try { io.of('/general').emit('settings', { settings: newSettings }); } catch(e) { }
            }
        } catch(e) {
            console.error('Failed to restore allowedPetCounts on withdraw cancel:', e.message);
        }

        const updatedOffer = await RobuxOffer.findByIdAndUpdate(offerDatabase._id, {
            state: 'canceled',
            updatedAt: new Date().getTime()
        }, { new: true }).lean();

        return res.status(200).json({ success: true, offer: updatedOffer, user: updatedUser });
    } catch(err) {
        return res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
    }
});

module.exports = (io) => router;
