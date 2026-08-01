const crypto = require('crypto');
const path = require('path');
const petValues = require(path.join(__dirname, '..', '..', '..', '..', 'growcsn-frontend', 'src', 'assets', 'pet-values.json'));

// Load database models
const User = require('../../../database/models/User');
const UserInventory = require('../../../database/models/UserInventory');
const LimitedItem = require('../../../database/models/LimitedItem');
const LimitedTransaction = require('../../../database/models/LimitedTransaction');
const RobuxOffer = require('../../../database/models/RobuxOffer');
const Report = require('../../../database/models/Report');

// Load utils
const {
    socketRemoveAntiSpam
} = require('../../../utils/socket');
const {
    authRobloxGetToken,
    authSendRobloxChallengeContinue,
    authSendRobloxTwoStepVerify,
    authRobloxSendSecurityEnable
} = require('../../../utils/auth/roblox');
const {
    cashierCheckSendLimitedEnableRoblox,
    cashierCheckSendLimitedGenerateType,
    cashierCheckSendLimitedVerifyData,
    cashierCheckSendLimitedVerifyRoblox,
    cashierCheckSendLimitedDepositData,
    cashierCheckSendLimitedDepositRoblox,
    cashierCheckSendLimitedDepositItems,
    cashierCheckSendLimitedDepositUser,
    cashierCheckSendLimitedWithdrawData,
    cashierCheckSendLimitedWithdrawRoblox,
    cashierCheckSendLimitedWithdrawTransaction,
    cashierCheckSendLimitedWithdrawUser,
    cashierCheckSendGag2WithdrawUser,
    cashierLimitedGetDummyItem,
    cashierLimitedGetInventory,
    cashierLimitedGetItems,
    cashierLimitedGetItemImages,
    cashierGetUserCanTrade,
    cashierSendLimitedTwoStepRedeem,
    cashierLimitedSendTrade,
    cashierLimitedSendTradeAccept,
    cashierLimitedSendTradeDecline,
    cashierLimitedFormatItems,
    cashierLimitedFormatDepositItems,
    cashierLimitedFormatTransactions,
    cashierLimitedFormatTransaction
} = require('../../../utils/cashier/limited');

// Cashier robux variables
let cashierLimitedBlockTransaction = []; 

const cashierGetLimitedDataSocket = async(io, socket, user, data, callback) => {
    try {
        // Create promises array
        let promises = []; 

        // Add get limited transaction query to promises array
        promises = [
            LimitedTransaction.find({ state: 'created' }).select('amount deposit state').lean()
        ];

        // Add get user inventory and limited items queries to promises array
        if(user.roblox !== undefined) {
            promises = [
                ...promises,
                UserInventory.findOne({ user: user._id }).select('items updatedAt').lean(),
                LimitedItem.find({ accepted: true }).select('assetId image amount accepted').lean()
            ];
        }

        // Execute promises array queries
        let dataDatabase = await Promise.all(promises);

        if(user.roblox === undefined) {
            dataDatabase[1] = [];
        } else if(dataDatabase[1] === null || new Date(dataDatabase[1].updatedAt).getTime() + (1000 * 60) < new Date().getTime()) {
            // Get users roblox inventory
            const inventoryRoblox = await cashierLimitedGetInventory(user.proxy, user.roblox.id);

            // Format inventory limited items
            let formated = cashierLimitedFormatItems(inventoryRoblox, dataDatabase[2]);

            // Update user inventory in database
            dataDatabase[1] = await UserInventory.findOneAndUpdate({ user: user._id }, {
                items: formated,
                updatedAt: new Date().getTime()
            }, { new: true, upsert: true }).select('items').lean();
        }

        callback({ success: true, deposit: dataDatabase[1].items, withdraw: cashierLimitedFormatTransactions(dataDatabase[0]) });
    } catch(err) {
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const cashierSendLimitedEnableSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate user roblox
        cashierCheckSendLimitedEnableRoblox(user);

        // Create token variable
        let token = null;

        // Create two step data variable
        let body = {};

        if(data.challengeId !== undefined) {
            // Get csrf token for deposit user
            token = await authRobloxGetToken(user.proxy);

            // Add roblox two step properties to body object
            body = { 
                actionType: 'Generic', 
                challengeId: data.twoStepId, 
                code: data.twoStepCode 
            };

            // Verify roblox two step code
            const twoStepData = await authSendRobloxTwoStepVerify(
                user.proxy, 
                token, 
                user.roblox.cookie, 
                user.roblox.id, 
                'Authenticator', 
                body
            );

            // Add challenge properties to body object
            body = {
                challengeType: 'twostepverification',
                challengeId: data.challengeId,
                twoStepId: data.twoStepId,
                challengeMetadata: JSON.stringify({ actionType: 'Generic', challengeId: data.twoStepId, verificationToken: twoStepData.verificationToken, rememberDevice: false })
            }

            // Send challenge continue request
            await authSendRobloxChallengeContinue(user.proxy, token, user.roblox.cookie, body);
        }

        // Get csrf token for deposit user
        token = await authRobloxGetToken(user.proxy, user.roblox.cookie);

        // Send enable security key request
        const securityData = await authRobloxSendSecurityEnable(user.proxy, token, user.roblox.cookie, user.roblox.id, body);

        if(securityData.sessionId !== undefined) {
            callback({ success: true });
        } else { callback({ success: true, challengeId: securityData.challengeId, twoStepId: securityData.twoStepId }); }

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.relogin === undefined ? err.message : 'Your roblox session has been expired. Please login again.' } });
    }
}

const cashierSendLimitedVerifySocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        cashierCheckSendLimitedVerifyData(data);

        // Validate user roblox
        cashierCheckSendLimitedVerifyRoblox(user);

        // Get csrf token for user
        let token = await authRobloxGetToken(user.proxy);

        // Create roblox two step verify body object
        let body = { 
            actionType: 'Generic', 
            challengeId: data.challengeId, 
            code: data.twoStepCode 
        };

        // Verify roblox two step code
        const dataTwoStep = await authSendRobloxTwoStepVerify(token, user.proxy, user.roblox.cookie, user.roblox.id, 'Authenticator', body);

        // Send enable security key request
        const securityData = await authRobloxSendSecurityEnable(token, user.proxy, user.roblox.cookie, user.roblox.id, data.challengeId, dataTwoStep.verificationToken);

        /*
        // Update user in database
        const userDatabase = await User.findByIdAndUpdate(user._id, {
            verifiedAt: new Date().getTime(),
            updatedAt: new Date().getTime()
        }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean();
        */

        callback({ success: true, user: userDatabase });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.relogin === undefined ? err.message : 'Your roblox session has been expired. Please login again.' } });
    }
}

const cashierSendLimitedDepositSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        cashierCheckSendLimitedDepositData(data);

        // Validate user roblox
        cashierCheckSendLimitedDepositRoblox(user);

        // Get users roblox inventory, users created limited transactions and users canceled limited transactions in the last hour
        let dataDatabase = await Promise.all([
            UserInventory.findOne({ user: user._id }).select('items').lean(),
            LimitedTransaction.find({ 'deposit.user': user._id, state: 'created' }).select('deposit state').lean(),
            LimitedTransaction.find({ 'deposit.user': user._id, state: 'canceled', updatedAt: { $gte: new Date(new Date().getTime() - 1000 * 60 * 60) } }).select('deposit state updatedAt').lean()
        ]);

        // Validate sent items
        cashierCheckSendLimitedDepositItems(data, dataDatabase[0].items, dataDatabase[1]);

        // Format sent items
        const formated = cashierLimitedFormatDepositItems(data, dataDatabase[0].items);

        // Get users roblox trade status
        const canTradeRoblox = await cashierGetUserCanTrade(user.proxy, user.roblox.cookie, '4586404680');

        // Validate depositing user
        cashierCheckSendLimitedDepositUser(user, dataDatabase[1], dataDatabase[2], canTradeRoblox);

        // Get transaction amount
        const amount = formated.reduce((a, b) => a + b.amount, 0);

        // Create new limited transaction in the database
        dataDatabase = await LimitedTransaction.create({
            amount: amount,
            deposit: {
                user: user._id, 
                items: formated
            },
            state: 'created'
        });

        // Convert transaction object to json object
        dataDatabase = dataDatabase.toObject();

        // Send created transaction to frontend
        io.of('/cashier').emit('limitedTransaction', { transaction: cashierLimitedFormatTransaction(dataDatabase) });

        callback({ success: true, transaction: dataDatabase });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.relogin === undefined ? err.message : 'Your roblox session has been expired. Please login again.' } });
    }
}

const cashierSendGag2WithdrawSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        cashierCheckSendLimitedWithdrawData(data);

        // Format item payload for the bot queue
        const items = data.items.map((item) => {
            const catalogItem = Array.isArray(petValues.items)
                ? petValues.items.find((value) => value.slug === item.uniqueId || value.name === item.name || value.display_name === item.name || value.variants?.some((variant) => variant.id === item.uniqueId))
                : null;
            const catalogAmount = catalogItem
                ? Number(catalogItem.variants?.[0]?.tokens ?? catalogItem.variant_tokens?.Normal ?? 0)
                : 0;
            const submittedAmount = Number(item.amount || 0);

            return {
            uniqueId: item.uniqueId,
            count: Number(item.count || 1),
            amount: catalogAmount > 0 ? Math.max(catalogAmount, submittedAmount) : submittedAmount,
            name: item.name || undefined,
            image: item.image || undefined
            };
        });

        const petValueAmount = items.reduce((sum, item) => sum + (item.amount * item.count), 0);
        const amount = petValueAmount * 1000;

        // Validate withdrawing user
        cashierCheckSendGag2WithdrawUser(user, amount);

        // Validate and decrement global allowed counts now so UI shows updated stock immediately
        const { settingGet, settingSetValue } = require('../../../utils/setting');
        const settings = settingGet();
        const currCounts = (settings && settings.limited && settings.limited.allowedPetCounts) ? Object.assign({}, settings.limited.allowedPetCounts) : {};

        // Check availability
        for(const it of items) {
            const key = String(it.uniqueId);
            const dec = Number(it.count || 1);
            const prev = Number(currCounts[key] || 0);
            if(prev < dec) {
                throw new Error(`Not enough stock for item ${it.name || key}`);
            }
            currCounts[key] = Math.max(0, prev - dec);
        }

        // Persist updated counts and broadcast
        const newSettings = await settingSetValue('limited.allowedPetCounts', currCounts);
        try { io.of('/general').emit('settings', { settings: newSettings }); } catch(e) { }

        // Create robux bot offer for GAG2 withdraw processing
        const offerDatabase = await RobuxOffer.create({
            amount: amount,
            type: 'gag2-withdraw',
            user: user._id,
            state: 'created',
            data: {
                items: items
            }
        });

        // Update user balance and withdraw stats
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            $inc: {
                balance: -amount,
                'stats.withdraw': amount
            },
            updatedAt: new Date().getTime()
        }, { new: true }).select('balance xp stats rakeback mute ban verifiedAt updatedAt').lean();

        callback({ success: true, offer: offerDatabase.toObject(), user: updatedUser });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(socket.decoded._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const cashierLimitedHandleTransaction = async(io, transactionDatabase) => {
    try {

    } catch(err) {
        console.error(err);
    }
}

const cashierLimitedCheckItems = async() => {
    try {
        // Get rolimons limited items
        let itemsData = await cashierLimitedGetItems();

        // Create item ids array
        const itemIds = Object.entries(itemsData).map(([key, value]) => key);

        // Get limited images
        let cashierLimitedImages = await cashierLimitedGetItemImages(itemIds);

        // Format limited items
        itemsData = Object.entries(itemsData).map(([key, value]) => { 
            const indexImage = cashierLimitedImages.findIndex((image) => image.targetId.toString() === key.toString());
            return { assetId: key, name: value[0], image: indexImage !== -1 ? cashierLimitedImages[indexImage].imageUrl : '', amount: Math.floor(value[4] * 1000), accepted: true }
        });

        // Get limited items from the database
        const itemsDatabase = await LimitedItem.find({}).select('assetId').lean();

        // Save limited items to database
        for(const item of itemsData) {
            const indexItem = itemsDatabase.findIndex((element) => element.assetId === item.assetId);

            if(indexItem === -1) {
                // Create limited item in database
                await LimitedItem.create({ 
                    assetId: item.assetId, 
                    name: item.name,
                    image: item.image,
                    amount: item.amount,
                    amountFixed: item.amount, 
                    accepted: item.accepted 
                });
            } else {
                // Update limited item in database
                await LimitedItem.findOneAndUpdate({ assetId: item.assetId }, { 
                    amount: item.amount, 
                    accepted: item.accepted 
                }, { upsert: true });
            }
        }

        setTimeout(() => { cashierLimitedCheckItems(); }, 1000 * 60 * 60 * 24);
    } catch(err) {
        setTimeout(() => { cashierLimitedCheckItems(); }, 1000 * 60 * 60 * 24);
        console.error(err);
    }
}

const cashierLimitedInit = (io) => {
    try {
        // Check limited items
        cashierLimitedCheckItems(io);
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    cashierGetLimitedDataSocket,
    cashierSendLimitedEnableSocket,
    cashierSendLimitedVerifySocket,
    cashierSendLimitedDepositSocket,
    cashierSendGag2WithdrawSocket,
    cashierLimitedInit
}
