import socketIo from 'socket.io-client';

function normalizeSocketUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
        return rawUrl;
    }

    const trimmedUrl = rawUrl.trim();

    if (trimmedUrl.startsWith('wss://') || trimmedUrl.startsWith('ws://')) {
        if (window?.location?.protocol === 'https:' && trimmedUrl.startsWith('ws://')) {
            return trimmedUrl.replace(/^ws:/, 'wss:');
        }
        return trimmedUrl;
    }

    if (trimmedUrl.startsWith('https://')) {
        return trimmedUrl.replace(/^https:/, 'wss:');
    }

    if (trimmedUrl.startsWith('http://')) {
        return window?.location?.protocol === 'https:' ? trimmedUrl.replace(/^http:/, 'wss:') : trimmedUrl.replace(/^http:/, 'ws:');
    }

    return trimmedUrl;
}

// Resolve socket URL with robust fallbacks:
let socketUrl = normalizeSocketUrl(process.env.VUE_APP_SOCKET_URL);

// If no env provided, default to same origin (use wss on https)
if (!socketUrl || socketUrl.trim() === '') {
    socketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
} else {
    // Ensure secure transport when page is HTTPS
    if (window?.location?.protocol === 'https:' && socketUrl.startsWith('ws://')) {
        socketUrl = socketUrl.replace(/^ws:/, 'wss:');
    }
    // If someone set an http:// env accidentally, convert to wss/ws depending on page
    if (socketUrl.startsWith('http://') || socketUrl.startsWith('https://')) {
        socketUrl = socketUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    }
}
const state = {
    socketSendLoading: null,
    socketGeneral: socketIo(socketUrl + '/general', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketCrash: socketIo(socketUrl + '/crash', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketRoll: socketIo(socketUrl + '/roll', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketBlackjack: socketIo(socketUrl + '/blackjack', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketDuels: socketIo(socketUrl + '/duels', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketMines: socketIo(socketUrl + '/mines', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketTowers: socketIo(socketUrl + '/towers', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketUnbox: socketIo(socketUrl + '/unbox', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketBattles: socketIo(socketUrl + '/battles', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketUpgrader: socketIo(socketUrl + '/upgrader', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketCashier: socketIo(socketUrl + '/cashier', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']}),
    socketAdmin: socketIo(socketUrl + '/admin', { auth: {}, autoConnect: false, reconnection: true, reconnectionDelay: 5000, transports: ['websocket']})
}

const getters = {
    socketSendLoading: state => state.socketSendLoading,
    socketGeneral: state => state.socketGeneral,
    socketCrash: state => state.socketCrash,
    socketRoll: state => state.socketRoll,
    socketBlackjack: state => state.socketBlackjack,
    socketDuels: state => state.socketDuels,
    socketMines: state => state.socketMines,
    socketTowers: state => state.socketTowers,
    socketUnbox: state => state.socketUnbox,
    socketBattles: state => state.socketBattles,
    socketUpgrader: state => state.socketUpgrader,
    socketCashier: state => state.socketCashier,
    socketAdmin: state => state.socketAdmin
}

const mutations = {
    socket_set_send_loading(state, value) {
       state.socketSendLoading = value;
   }
}

const actions = {
    socketSetSendLoading({ commit }, value) {
        commit('socket_set_send_loading', value);
    },
    socketConnectGeneral({ getters, dispatch }) {
        if(getters.socketGeneral.connected === true) { getters.socketGeneral.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketGeneral.auth.token = getters.authToken; }

        getters.socketGeneral.disconnect().connect();

        dispatch('socketListenGeneral');
    },
    socketDisconnectGeneral({ getters }) {
        getters.socketGeneral.removeAllListeners();
        getters.socketGeneral.disconnect();
    },
    socketListenGeneral({ getters, dispatch }) {
        getters.socketGeneral.on('init', (data) => { dispatch('generalSocketInit', data); dispatch('chatSocketInit', data); });
        getters.socketGeneral.on('settings', (data) => { dispatch('generalSocketSettings', data); });
        getters.socketGeneral.on('user', (data) => { dispatch('generalSocketUser', data); });
        getters.socketGeneral.on('bet', (data) => { dispatch('generalSocketBet', data); });
        getters.socketGeneral.on('rain', (data) => { dispatch('generalSocketRain', data); });
        getters.socketGeneral.on('userTip', (data) => { dispatch('userTipSocket', data); });
        getters.socketGeneral.on('chatOnline', (data) => { dispatch('chatSocketOnline', data); });
        getters.socketGeneral.on('chatMessage', (data) => { dispatch('chatSocketMessage', data); });
        getters.socketGeneral.on('chatRemove', (data) => { dispatch('chatSocketRemove', data); });
        getters.socketGeneral.on('chatClear', (data) => { dispatch('chatSocketClear', data); });
        getters.socketGeneral.on('rainPayout', (data) => { dispatch('rainPayoutSocket', data); });
    },
    socketConnectCrash({ getters, dispatch }) {
        if(getters.socketCrash.connected === true) { getters.socketCrash.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketCrash.auth.token = getters.authToken; }

        getters.socketCrash.disconnect().connect();

        dispatch('socketListenCrash');
    },
    socketDisconnectCrash({ getters }) {
        getters.socketCrash.removeAllListeners();
        getters.socketCrash.disconnect();
    },
    socketListenCrash({ getters, dispatch }) {
        getters.socketCrash.on('init', (data) => { dispatch('crashSocketInit', data); });
        getters.socketCrash.on('game', (data) => { dispatch('crashSocketGame', data); });
        getters.socketCrash.on('tick', (data) => { dispatch('crashSocketTick', data); });
        getters.socketCrash.on('bet', (data) => { dispatch('crashSocketBet', data); });
    },
    socketConnectRoll({ getters, dispatch }) {
        if(getters.socketRoll.connected === true) { getters.socketRoll.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketRoll.auth.token = getters.authToken; }

        getters.socketRoll.disconnect().connect();

        dispatch('socketListenRoll');
    },
    socketDisconnectRoll({ getters }) {
        getters.socketRoll.removeAllListeners();
        getters.socketRoll.disconnect();
    },
    socketListenRoll({ getters, dispatch }) {
        getters.socketRoll.on('init', (data) => { dispatch('rollSocketInit', data); });
        getters.socketRoll.on('game', (data) => { dispatch('rollSocketGame', data); });
        getters.socketRoll.on('bet', (data) => { dispatch('rollSocketBet', data); });
    },
    socketConnectBlackjack({ getters, dispatch }) {
        if(getters.socketBlackjack.connected === true) { getters.socketBlackjack.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketBlackjack.auth.token = getters.authToken; }

        getters.socketBlackjack.disconnect().connect();

        dispatch('socketListenBlackjack');
    },
    socketDisconnectBlackjack({ getters }) {
        getters.socketBlackjack.removeAllListeners();
        getters.socketBlackjack.disconnect();
    },
    socketListenBlackjack({ getters, dispatch }) {
        getters.socketBlackjack.on('init', (data) => { dispatch('blackjackSocketInit', data); });
        getters.socketBlackjack.on('table', (data) => { dispatch('blackjackSocketTable', data); });
    },
    socketConnectDuels({ getters, dispatch }) {
        if(getters.socketDuels.connected === true) { getters.socketDuels.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketDuels.auth.token = getters.authToken; }

        getters.socketDuels.disconnect().connect();

        dispatch('socketListenDuels');
    },
    socketDisconnectDuels({ getters }) {
        getters.socketDuels.removeAllListeners();
        getters.socketDuels.disconnect();
    },
    socketListenDuels({ getters, dispatch }) {
        getters.socketDuels.on('init', (data) => { dispatch('duelsSocketInit', data); });
        getters.socketDuels.on('game', (data) => { dispatch('duelsSocketGame', data); });
    },
    socketConnectMines({ getters, dispatch }) {
        if(getters.socketMines.connected === true) { getters.socketMines.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketMines.auth.token = getters.authToken; }

        getters.socketMines.disconnect().connect();

        dispatch('socketListenMines');
    },
    socketDisconnectMines({ getters }) {
        getters.socketMines.removeAllListeners();
        getters.socketMines.disconnect();
    },
    socketListenMines({ getters, dispatch }) {
        getters.socketMines.on('init', (data) => { dispatch('minesSocketInit', data); });
    },
    socketConnectTowers({ getters, dispatch }) {
        if(getters.socketTowers.connected === true) { getters.socketTowers.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketTowers.auth.token = getters.authToken; }

        getters.socketTowers.disconnect().connect();

        dispatch('socketListenTowers');
    },
    socketDisconnectTowers({ getters }) {
        getters.socketTowers.removeAllListeners();
        getters.socketTowers.disconnect();
    },
    socketListenTowers({ getters, dispatch }) {
        getters.socketTowers.on('init', (data) => { dispatch('towersSocketInit', data); });
    },
    socketConnectUnbox({ getters, dispatch }) {
        if(getters.socketUnbox.connected === true) { getters.socketUnbox.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketUnbox.auth.token = getters.authToken; }

        getters.socketUnbox.disconnect().connect();

        dispatch('socketListenUnbox');
    },
    socketDisconnectUnbox({ getters }) {
        getters.socketUnbox.removeAllListeners();
        getters.socketUnbox.disconnect();
    },
    socketListenUnbox({ getters, dispatch }) {
        getters.socketUnbox.on('init', (data) => { dispatch('unboxSocketInit', data); });
    },
    socketConnectBattles({ getters, dispatch }) {
        if(getters.socketBattles.connected === true) { getters.socketBattles.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketBattles.auth.token = getters.authToken; }

        getters.socketBattles.disconnect().connect();

        dispatch('socketListenBattles');
    },
    socketDisconnectBattles({ getters }) {
        getters.socketBattles.removeAllListeners();
        getters.socketBattles.disconnect();
    },
    socketListenBattles({ getters, dispatch }) {
        getters.socketBattles.on('init', (data) => { dispatch('battlesSocketInit', data); });
        getters.socketBattles.on('game', (data) => { dispatch('battlesSocketGame', data); });
    },
    socketConnectUpgrader({ getters, dispatch }) {
        if(getters.socketUpgrader.connected === true) { getters.socketUpgrader.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketUpgrader.auth.token = getters.authToken; }

        getters.socketUpgrader.disconnect().connect();

        dispatch('socketListenUpgrader');
    },
    socketDisconnectUpgrader({ getters }) {
        getters.socketUpgrader.removeAllListeners();
        getters.socketUpgrader.disconnect();
    },
    socketListenUpgrader({ getters, dispatch }) {
        
    },
    socketConnectCashier({ getters, dispatch }) {
        if(getters.socketCashier.connected === true) { getters.socketCashier.removeAllListeners(); }
        if(getters.authToken !== null) { getters.socketCashier.auth.token = getters.authToken; }

        getters.socketCashier.disconnect().connect();

        dispatch('socketListenCashier');
    },
    socketDisconnectCashier({ getters }) {
        getters.socketCashier.removeAllListeners();
        getters.socketCashier.disconnect();
    },
    socketListenCashier({ getters, dispatch }) {
        getters.socketCashier.on('robuxOffer', (data) => { dispatch('cashierSocketRobuxOffer', data); });
        getters.socketCashier.on('limitedTransaction', (data) => { dispatch('cashierSocketLimitedTransaction', data); });
        getters.socketCashier.on('cryptoTransaction', (data) => { dispatch('cashierSocketCryptoTransaction', data); });
    },
    socketConnectAdmin({ getters, dispatch }) {
        if(getters.authToken !== null) { getters.socketAdmin.auth.token = getters.authToken; }

        if(getters.socketAdmin.__adminListenersAttached !== true) {
            dispatch('socketListenAdmin');
        }

        getters.socketAdmin.disconnect().connect();
    },
    socketDisconnectAdmin({ getters }) {
        getters.socketAdmin.removeAllListeners();
        getters.socketAdmin.__adminListenersAttached = false;
        getters.socketAdmin.disconnect();
    },
    socketListenAdmin({ getters, dispatch }) {
        if(getters.socketAdmin.__adminListenersAttached === true) {
            return;
        }

        getters.socketAdmin.on('connect', () => {
            // Clear any pending send states when admin socket connects
            if(getters.socketAdmin.__pendingAdminBoxCreate === true) { getters.socketAdmin.__pendingAdminBoxCreate = false; }
            dispatch('socketSetSendLoading', null);
        });

        getters.socketAdmin.on('disconnect', (reason) => {
            dispatch('socketSetSendLoading', null);
        });

        getters.socketAdmin.on('connect_error', (err) => {
            dispatch('notificationShow', {
                type: 'error',
                message: err && err.message ? `Admin socket connection failed: ${err.message}` : 'Admin socket connection failed.'
            });
        });

        getters.socketAdmin.__adminListenersAttached = true;
    }
}

const socket = {
    state,
    mutations,
    actions,
    getters
}

export default socket;
