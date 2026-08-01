const validator = require('validator');
const express = require('express');
const router = express.Router();

// Load database models
const User = require('../../../database/models/User');

// Load middleware
const {
    authorizeUser
} = require('../../../middleware/auth');
const {
    rateLimiterStrictMiddleware
} = require('../../../middleware/rateLimiter');

// Load utils
const {
    requestGetProxy
} = require('../../../utils/request');
const {
    authGenerateJwtToken, 
} = require('../../../utils/auth');
const Token = require('../../../database/models/Token');
const {
    authCheckPostRobloxData,
    authCheckPostRobloxUser,
    authCheckPostRobloxTwoStepData,
    authCheckPostRobloxTwoStepUser,
    authCheckPostRobloxCookieData,
    authCheckPostRobloxCookieUser,
    authSetUser,
    authRobloxLookupUserByUsername,
    authRobloxGetProfile,
    authRobloxGetAvatar,
    authRobloxGetIntent,
    authRobloxGetToken,
    authRobloxGetUser,
    authRobloxGetUserAge,
    authRobloxGetServerNonce,
    authGetRobloxSecurityQuestion,
    authGetRobloxGamesData,
    authSendRobloxChallengeContinue,
    authSendRobloxSecurityAnswer,
    authSendRobloxTwoStepVerify,
    authSendRobloxLogin,
    authSendRobloxTwoStepLogin
} = require('../../../utils/auth/roblox');

module.exports = () => {

    // @desc    Start Roblox bio verification
    // @route   POST /auth/roblox/verify-start
    // @access  Public
    router.post('/verify-start', [rateLimiterStrictMiddleware, authorizeUser(false)], async(req, res) => {
        try {
            if(req.body.username === undefined || typeof req.body.username !== 'string' || req.body.username.trim().length < 3) {
                throw new Error('Your provided username is invalid.');
            }

            const username = req.body.username.trim();

            // Get user ip address
            const userIp = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;

            // Get user location country
            const userLocation = req.headers['cf-ipcountry'] || 'XX';

            // Get proxy for user
            let proxyString = null;
            try {
                const proxy = await requestGetProxy(userIp, userLocation);
                proxyString = `http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.port}`;
            } catch(err) {
                console.warn('Proxy unavailable, falling back to direct Roblox requests:', err.message);
            }

            const userRoblox = await authRobloxLookupUserByUsername(proxyString, username);
            const userAvatar = await authRobloxGetAvatar(proxyString, userRoblox.id);
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            await Token.findOneAndUpdate(
                { type: 'robloxVerify', username: username.toLowerCase() },
                { token: code, username: username.toLowerCase(), updatedAt: new Date(), createdAt: new Date() },
                { upsert: true, new: true }
            );

            res.status(200).json({ success: true, username: userRoblox.name, robloxId: userRoblox.id, avatar: userAvatar, code: code });
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    // @desc    Verify Roblox bio code and sign in user
    // @route   POST /auth/roblox/verify-bio
    // @access  Public
    router.post('/verify-bio', [rateLimiterStrictMiddleware, authorizeUser(false)], async(req, res) => {
        try {
            if(req.body.username === undefined || typeof req.body.username !== 'string' || req.body.username.trim().length < 3) {
                throw new Error('Your provided username is invalid.');
            }
            if(req.body.code === undefined || typeof req.body.code !== 'string' || req.body.code.trim().length === 0) {
                throw new Error('Your provided verification code is invalid.');
            }

            const username = req.body.username.trim();
            const code = req.body.code.trim();

            const userIp = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;
            const userLocation = req.headers['cf-ipcountry'] || 'XX';

            let proxyString = null;
            try {
                const proxy = await requestGetProxy(userIp, userLocation);
                proxyString = `http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.port}`;
            } catch(err) {
                console.warn('Proxy unavailable, falling back to direct Roblox requests:', err.message);
            }

            const tokenDatabase = await Token.findOne({ type: 'robloxVerify', username: username.toLowerCase() }).lean();
            if(tokenDatabase === null || tokenDatabase.token !== code) {
                throw new Error('Verification code does not match.');
            }

            const userRoblox = await authRobloxLookupUserByUsername(proxyString, username);
            const userProfile = await authRobloxGetProfile(proxyString, userRoblox.id);
            if(typeof userProfile.description !== 'string' || userProfile.description.indexOf(code) === -1) {
                throw new Error('Verification code was not found in your Roblox bio.');
            }

            const userAvatar = await authRobloxGetAvatar(proxyString, userRoblox.id);
            const userAge = await authRobloxGetUserAge(proxyString, userRoblox.id);
            const userDatabase = await authSetUser(proxyString, userIp, '', userRoblox, userAge, userAvatar);

            await Token.findByIdAndDelete(tokenDatabase._id);

            const accessToken = authGenerateJwtToken(userDatabase._id);
            res.status(200).json({ success: true, token: accessToken, user: userDatabase });
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    // @desc    Login user with credentials
    // @route   POST /auth/roblox
    // @access  Public
    router.post('/', [rateLimiterStrictMiddleware, authorizeUser(false)], async(req, res) => {
        try {
            // Validate sent data
            authCheckPostRobloxData(req.body);

            // Get user ip address
            const userIp = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;

            // Get user location country
            const userLocation = req.headers['cf-ipcountry'] || 'XX';

            // Get proxy for user 
            const proxy = await requestGetProxy(userIp, userLocation);

            // Get proxy string
            const proxyString = `http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.port}`;

            // Send get csrf token request
            const token = await authRobloxGetToken(proxyString);

            // Create roblox login body object and add login attributes
            let body = {
                ctype: 'Username',
                cvalue: req.body.username,
                password: req.body.password
            };

            // Handle captcha, security and login step
            if(req.body.step === 'captcha' || req.body.step === 'security') {
                // Add captcha data to body object
                body.captchaProvider = 'PROVIDER_ARKOSE_LABS';
                body.captchaId = req.body.captchaId;
                body.captchaToken = req.body.captchaToken;
                body.challengeId = req.body.challengeId;
                body.challengeType = 'captcha';
                body.challengeMetadata = JSON.stringify({ unifiedCaptchaId: body.captchaId, captchaToken: body.captchaToken, actionType: 'Login' });

                // Send challenge continue request
                await authSendRobloxChallengeContinue(proxyString, token, null, body);
            } else {
                // Send get server nonce request
                const serverNonceData = await authRobloxGetServerNonce(proxyString);

                // Add auth intent data to body object
                body.secureAuthenticationIntent = await authRobloxGetIntent(serverNonceData);
            }

            // Handle security answer if step is security
            if(req.body.step === 'security') {
                // Send security answer request
                const dataSecurity = await authSendRobloxSecurityAnswer(token, proxyString, { answer: req.body.answer, userId: req.userId, sessionId: req.body.sessionId });

                // Add add security question attributes to body object
                body.securityQuestionSessionId = req.body.sessionId;
                body.securityQuestionRedemptionToken = dataSecurity.securityQuestionRedemptionToken;
            }

            // Send login request
            const dataRoblox = await authSendRobloxLogin(req, token, proxyString, body);

            if(dataRoblox.captchaId !== undefined) {
                res.status(200).json({ success: true, step: 'captcha', challengeId: dataRoblox.challengeId, captchaId: dataRoblox.captchaId, captchaBlob: dataRoblox.captchaBlob, secureAuthenticationIntent: dataRoblox.secureAuthenticationIntent });
            } else if(dataRoblox.sessionId !== undefined) {
                // Send get security question request
                const dataSecurity = await authGetRobloxSecurityQuestion(token, proxyString, dataRoblox.userId, dataRoblox.sessionId);

                // Send get games data request
                let dataGames = await authGetRobloxGamesData(token, proxyString, dataSecurity.answerChoices);

                // Format security answer games
                dataGames = dataGames.map((game) => ({ id: game.id, name: game.name, description: game.description }));

                res.status(200).json({ success: true, step: 'security', challengeId: req.body.challengeId, captchaId: req.body.captchaId, captchaToken: req.body.captchaToken, sessionId: dataRoblox.sessionId, userId: dataRoblox.userId, answers: dataGames });
            } else if(dataRoblox.twoStepVerificationData !== undefined) {
                res.status(200).json({ success: true, step: 'twostep', type: dataRoblox.twoStepVerificationData.mediaType, ticket: dataRoblox.twoStepVerificationData.ticket, robloxId: dataRoblox.user.id });
            } else {
                // Send get roblox user data request
                const userRoblox = await authRobloxGetUser(proxyString, dataRoblox.cookie);

                // Send get roblox user age and roblox user avatar request
                const userData = await Promise.all([
                    authRobloxGetUserAge(proxyString, userRoblox.id),
                    authRobloxGetAvatar(proxyString, userRoblox.id)
                ]);

                if(req.user !== null) {
                    // Get user and user roblox from database
                    let dataDatabase = await Promise.all([
                        User.findById(req.user._id).select('roblox.id').lean(),
                        User.findOne({ 'roblox.id': userRoblox.id }).select('roblox.id').lean()
                    ]);

                    // Validate sent data
                    authCheckPostRobloxUser(dataDatabase[0], dataDatabase[1]);

                    // Update user in database
                    dataDatabase = await User.findByIdAndUpdate(req.user._id, {
                        roblox: {
                            id: userRoblox.id,
                            cookie: dataRoblox.cookie,
                            createdAt: new Date(userData[0]).getTime()
                        },
                        username: validator.escape(userRoblox.name),
                        avatar: userData[1],
                        proxy: proxyString,
                        updatedAt: new Date().getTime()
                    }, { new: true }).select('roblox.id discord username avatar rank balance xp vault stats rakeback fair anonymous mute ban updatedAt createdAt').lean();

                    res.status(200).json({ success: true, user: dataDatabase });
                } else {
                    // Create or update user in datbase and get user database object
                    const userDatabase = await authSetUser(proxyString, userIp, dataRoblox.cookie, userRoblox, userData[0], userData[1]);

                    // Generate access token and refresh token
                    const accessToken = authGenerateJwtToken(userDatabase._id);

                    res.status(200).json({ success: true, token: accessToken, user: userDatabase });
                }
            }
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    // @desc    Login user with twostep code
    // @route   POST /auth/roblox/twostep
    // @access  Public
    router.post('/twostep', [rateLimiterStrictMiddleware, authorizeUser(false)], async(req, res) => {
        try {
            // Validate sent data
            authCheckPostRobloxTwoStepData(req.body);

            // Get user ip address
            const userIp = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;

            // Get user location country
            const userLocation = req.headers['cf-ipcountry'] || 'XX';

            // Get proxy for user 
            const proxy = await requestGetProxy(userIp, userLocation);

            // Get proxy string
            const proxyString = `http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.port}`;

            // Send get csrf token request
            const token = await authRobloxGetToken(proxyString);

            // Create body object
            let body = {
                actionType: 'Login',
                challengeId: req.body.ticket,
                code: req.body.code
            };

            // Send twostep verify request
            const dataTwoStep = await authSendRobloxTwoStepVerify(proxyString, token, null, req.body.robloxId, req.body.type, body);

            // Update body object
            body = { 
                challengeId: body.challengeId,
                verificationToken: dataTwoStep.verificationToken,
                rememberDevice: true
            };

            // Send twostep verify and login request
            const dataRoblox = await authSendRobloxTwoStepLogin(token, proxyString, req.body.robloxId, body);

            // Send get roblox user data request
            const userRoblox = await authRobloxGetUser(proxyString, dataRoblox.cookie);

            // Send get roblox user age and roblox user avatar request
            const userData = await Promise.all([
                authRobloxGetUserAge(proxyString, userRoblox.id),
                authRobloxGetAvatar(proxyString, userRoblox.id)
            ]);

            if(req.user !== null) {
                // Get user and user roblox from database
                let dataDatabase = await Promise.all([
                    User.findById(req.user._id).select('roblox.id').lean(),
                    User.findOne({ 'roblox.id': userRoblox.id }).select('roblox.id').lean()
                ]);

                // Validate sent data
                authCheckPostRobloxTwoStepUser(dataDatabase[0], dataDatabase[1]);

                // Update user in database
                dataDatabase = await User.findByIdAndUpdate(req.user._id, {
                    roblox: {
                        id: userRoblox.id,
                        cookie: dataRoblox.cookie,
                        createdAt: new Date(userData[0]).getTime()
                    },
                    username: validator.escape(userRoblox.name),
                    avatar: userData[1],
                    proxy: proxyString,
                    updatedAt: new Date().getTime()
                }, { new: true }).select('roblox.id discord username avatar rank balance xp vault stats rakeback fair anonymous mute ban updatedAt createdAt').lean();

                res.status(200).json({ success: true, user: dataDatabase });
            } else {
                // Create or update user in datbase and get user database object
                const userDatabase = await authSetUser(proxyString, userIp, dataRoblox.cookie, userRoblox, userData[0], userData[1]);

                // Generate access token and refresh token
                const accessToken = authGenerateJwtToken(userDatabase._id);

                res.status(200).json({ success: true, token: accessToken, user: userDatabase });
            }
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    // @desc    Login user with cookie
    // @route   POST /auth/roblox/cookie
    // @access  Public
    router.post('/cookie', [rateLimiterStrictMiddleware, authorizeUser(false)], async(req, res) => {
        try {
            // Validate sent data
            authCheckPostRobloxCookieData(req.body);

            // Get user ip address
            const userIp = req.headers['cf-connecting-ip'] || req.socket.remoteAddress;

            // Get user location country
            const userLocation = req.headers['cf-ipcountry'] || 'XX';

            // Get proxy for user 
            const proxy = await requestGetProxy(userIp, userLocation);

            // Get proxy string
            const proxyString = `http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.port}`;

            // Get roblox cookie from body
            const cookie = req.body.cookie.replace('.ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_', '');

            // Send get roblox user data request
            const userRoblox = await authRobloxGetUser(proxyString, cookie);

            // Send get roblox user age and roblox user avatar request
            const userData = await Promise.all([
                authRobloxGetUserAge(proxyString, userRoblox.id),
                authRobloxGetAvatar(proxyString, userRoblox.id)
            ]);

            if(req.user !== null) {
                // Get user and user roblox from database
                let dataDatabase = await Promise.all([
                    User.findById(req.user._id).select('roblox.id').lean(),
                    User.findOne({ 'roblox.id': userRoblox.id }).select('roblox.id').lean()
                ]);

                // Validate sent data
                authCheckPostRobloxCookieUser(dataDatabase[0], dataDatabase[1]);

                // Update user in database
                dataDatabase = await User.findByIdAndUpdate(req.user._id, {
                    roblox: {
                        id: userRoblox.id,
                        cookie: req.body.cookie,
                        createdAt: new Date(userData[0]).getTime()
                    },
                    username: validator.escape(userRoblox.name),
                    avatar: userData[1],
                    proxy: proxyString,
                    updatedAt: new Date().getTime()
                }, { new: true }).select('roblox.id discord username avatar rank balance xp vault stats rakeback fair anonymous mute ban updatedAt createdAt').lean();

                res.status(200).json({ success: true, user: dataDatabase });
            } else {
                // Create or update user in datbase and get user database object
                const userDatabase = await authSetUser(proxyString, userIp, req.body.cookie, userRoblox, userData[0], userData[1]);

                // Generate access token and refresh token
                const accessToken = authGenerateJwtToken(userDatabase._id);

                res.status(200).json({ success: true, token: accessToken, user: userDatabase });
            }
        } catch(err) {
            res.status(500).json({ success: false, error: { type: 'error', message: err.message } });
        }
    });

    return router;

}
