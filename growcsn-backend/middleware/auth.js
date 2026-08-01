const jwt = require('jsonwebtoken');

// Load database models
const User = require('../database/models/User');

const authorizeUser = (strict) => {
    return async(req, res, next) => {
        // Get token from header
        const token = req.header('x-auth-token');

        // Check for token
        if(typeof token !== 'string' && strict === false) { 
            req.user = null; 
            return next();
        } else if(typeof token !== 'string') {
            return res.status(401).json({ success: false, message: 'Authorization denied.' });
        }

        // Verify token
        try {
            req.user = await jwt.verify(token, process.env.TOKEN_SECRET);
            next();
        } catch(err) {
            return res.status(401).json({ success: false, error: { type: 'error', message: 'Authorization denied.' } });
        }
    }
}

const authorizeAdmin = (req, res, next) => {
    try {
        if(req.user.rank !== 'admin') { return res.status(403).json({ success: false, message: 'You are not authorized to access this route.' }); }
        next();
    } catch(err) {
        return res.status(403).json({ success: false, error: { type: 'error', message: 'You are not authorized to access this route.' } });
    }
}

const authorizeBot = (req, res, next) => {
    const botKey = req.header('x-bot-key') || (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

    if(typeof botKey !== 'string' || botKey.trim().length === 0 || botKey !== process.env.BOT_KEY) {
        return res.status(401).json({ success: false, message: 'Bot authorization denied.' });
    }

    next();
}

module.exports = {
    authorizeUser,
    authorizeAdmin,
    authorizeBot
}
