const state = {
    cashierFilterSearch: '',
    cashierFilterAmountMin: '',
    cashierFilterAmountMax: '',
    cashierFilterSort: 'Highest',
    cashierLimitedSelected: [],
    cashierRobuxData: {
        offers: null,
        count: null,
        loading: false,
        page: 1
    },
    cashierLimitedData: {
        deposit: null,
        withdraw: null,
        selected: [],
        loading: false,
        loadedAt: null,
        page: 1
    },
    cashierCryptoData: {
        prices: null,
        addresses: null,
        loading: false
    }
}

const getters = {
    cashierFilterSearch: state => state.cashierFilterSearch,
    cashierFilterAmountMin: state => state.cashierFilterAmountMin,
    cashierFilterAmountMax: state => state.cashierFilterAmountMax,
    cashierFilterSort: state => state.cashierFilterSort,
    cashierRobuxData: state => state.cashierRobuxData,
    cashierLimitedData: state => state.cashierLimitedData,
    cashierCryptoData: state => state.cashierCryptoData
}

const mutations = {
    cashier_set_filter_search(state, value) {
        state.cashierFilterSearch = value;
    },
    cashier_set_filter_amount_min(state, value) {
        state.cashierFilterAmountMin = value;
    },
    cashier_set_filter_amount_max(state, value) {
        state.cashierFilterAmountMax = value;
    },
    cashier_set_filter_sort(state, value) {
        state.cashierFilterSort = value;
    },
    cashier_set_robux_data(state, data) {
        state.cashierRobuxData.offers = data.offers;
        state.cashierRobuxData.count = data.count;
    },
    cashier_add_robux_data(state, offer) {
        state.cashierRobuxData.offers.unshift(offer);
    },
    cashier_update_robux_data(state, offer) {
        state.cashierRobuxData.offers.splice(state.cashierRobuxData.offers.findIndex((element) => element._id === offer._id), 1, offer);
    },
    cashier_remove_robux_data(state, offer) {
        state.cashierRobuxData.offers.splice(state.cashierRobuxData.offers.findIndex((element) => element._id === offer._id), 1);
    },
    cashier_set_robux_data_loading(state, status) {
        state.cashierRobuxData.loading = status;
    },
    cashier_set_robux_data_page(state, page) {
        state.cashierRobuxData.page = page;
    },
    cashier_set_limited_data(state, data) {
        state.cashierLimitedData.deposit = data.deposit;
        state.cashierLimitedData.withdraw = data.withdraw;
        state.cashierLimitedData.loadedAt = new Date();
    },
    cashier_add_limited_data_withdraw(state, transaction) {
        state.cashierLimitedData.withdraw.push(transaction);
    },
    cashier_update_limited_data_withdraw(state, transaction) {
        state.cashierLimitedData.withdraw.splice(state.cashierLimitedData.withdraw.findIndex((element) => element._id === transaction._id), 1, transaction);
    },
    cashier_remove_limited_data_withdraw(state, transaction) {
        state.cashierLimitedData.withdraw.splice(state.cashierLimitedData.withdraw.findIndex((element) => element._id === transaction._id), 1);
    },
    cashier_add_limited_data_selected(state, item) {
        // ensure count and available properties
        const copy = Object.assign({}, item);
        if(copy.count === undefined) copy.count = 1;
        if(copy.available === undefined && item.available !== undefined) copy.available = Number(item.available);
        state.cashierLimitedData.selected.push(copy);
    },
    cashier_remove_limited_data_selected(state, item) {
        const idx = state.cashierLimitedData.selected.findIndex((element) => {
            if(item.uniqueId !== undefined && element.uniqueId === item.uniqueId) return true;
            if(item._id !== undefined && element._id === item._id) return true;
            return false;
        });
        if(idx !== -1) state.cashierLimitedData.selected.splice(idx, 1);
    },
    cashier_empty_limited_data_selected(state) {
        state.cashierLimitedData.selected = [];
    },
    cashier_increment_limited_data_selected(state, item) {
        const idx = state.cashierLimitedData.selected.findIndex((element) => element.uniqueId === item.uniqueId);
        if(idx !== -1) {
            const curr = Number(state.cashierLimitedData.selected[idx].count || 1);
            let available = Infinity;
            if(item.available !== undefined) {
                available = Number(item.available);
            } else if(state.cashierLimitedData.selected[idx].available !== undefined) {
                available = Number(state.cashierLimitedData.selected[idx].available);
            }
            if(curr < available) {
                state.cashierLimitedData.selected[idx].count = curr + 1;
            } else {
                // cap at available
                state.cashierLimitedData.selected[idx].count = available;
            }
        } else {
            const copy = Object.assign({}, item);
            const available = (item.available !== undefined ? Number(item.available) : Infinity);
            if(available <= 0) {
                // do not add if nothing available
                return;
            }
            copy.count = 1;
            if(copy.available === undefined && item.available !== undefined) copy.available = Number(item.available);
            state.cashierLimitedData.selected.push(copy);
        }
    },
    cashier_decrement_limited_data_selected(state, item) {
        const idx = state.cashierLimitedData.selected.findIndex((element) => element.uniqueId === item.uniqueId);
        if(idx !== -1) {
            const curr = state.cashierLimitedData.selected[idx].count || 1;
            if(curr > 1) {
                state.cashierLimitedData.selected[idx].count = curr - 1;
            } else {
                state.cashierLimitedData.selected.splice(idx, 1);
            }
        }
    },
    cashier_set_limited_data_loading(state, status) {
        state.cashierLimitedData.loading = status;
    },
    cashier_set_limited_data_page(state, page) {
        state.cashierLimitedData.page = page;
    },
    cashier_set_crypto_data(state, data) {
        state.cashierCryptoData.prices = data.prices;
        state.cashierCryptoData.addresses = data.addresses;
    },
    cashier_set_crypto_data_loading(state, status) {
        state.cashierCryptoData.loading = status;
    }
}

const actions = {
    cashierSetFilterSearch({ commit }, value) {
        commit('cashier_set_filter_search', value);
    },
    cashierSetFilterAmountMin({ commit }, value) {
        commit('cashier_set_filter_amount_min', value);
    },
    cashierSetFilterAmountMax({ commit }, value) {
        commit('cashier_set_filter_amount_max', value);
    },
    cashierSetFilterSort({ commit }, value) {
        commit('cashier_set_filter_sort', value);
    },
    cashierSetRobuxDataPage({ commit }, page) {
        commit('cashier_set_robux_data_page', page);
    },
    cashierSetLimitedDataPage({ commit }, page) {
        commit('cashier_set_limited_data_page', page);
    },
    cashierAddLimitedDataSelected({ commit }, item) {
        commit('cashier_add_limited_data_selected', item);
    },
    cashierRemoveLimitedDataSelected({ commit }, item) {
        commit('cashier_remove_limited_data_selected', item);
    },
    cashierEmptyLimitedDataSelected({ commit }) {
        commit('cashier_remove_limited_data_selected');
    },
    cashierSocketRobuxOffer({ getters, commit }, data) {
        if(getters.cashierRobuxData.offers !== null) { 
            commit('cashier_update_robux_data', data.offer); 
        }
    },
    cashierSocketLimitedTransaction({ getters, commit }, data) {
        if(getters.cashierLimitedData.withdraw !== null) { 
            if(data.transaction.state === 'canceled') { commit('cashier_remove_limited_data_withdraw', data.transaction); }
            else if(getters.cashierLimitedData.withdraw.some((element) => element._id === data.transaction._id) === true) { commit('cashier_update_limited_data_withdraw', data.transaction); }
            else { commit('cashier_add_limited_data_withdraw', data.transaction); }
        }
    },
    cashierSocketCryptoTransaction({ getters, commit }, data) {
        if(data.transaction.state === 'completed') { 
            dispatch('notificationShow', { type: 'success', message: 'Your ' + data.transaction.data.currency + ' deposit has been credited to your balance.' });
        }
    },
    cashierGetRobuxDataSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.cashierRobuxData.loading === true) { return; }
        commit('cashier_set_robux_data_loading', true);

        getters.socketCashier.emit('getRobuxData', data, (res) => {
            if(res.success === true) {
                commit('cashier_set_robux_data', res);
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('cashier_set_robux_data_loading', false);
        });
    },
    cashierGetLimitedDataSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.cashierLimitedData.loading === true) { return; }
        commit('cashier_set_limited_data_loading', true);

        getters.socketCashier.emit('getLimitedData', data, (res) => {
            if(res.success === true) {
                commit('cashier_set_limited_data', res);
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('cashier_set_limited_data_loading', false);
        });
    },
    cashierGetCryptoDataSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.cashierCryptoData.loading === true) { return; }
        commit('cashier_set_crypto_data_loading', true);

        getters.socketCashier.emit('getCryptoData', data, (res) => {
            if(res.success === true) {
                commit('cashier_set_crypto_data', res);
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('cashier_set_crypto_data_loading', false);
        });
    },
    cashierSendRobuxDepositSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'RobuxDeposit');

        getters.socketCashier.emit('sendRobuxDeposit', data, (res) => {
            if(res.success === true) {
                commit('cashier_add_robux_data', res.offer);
                if(getters.cashierRobuxData.offers.length > 8) { commit('cashier_remove_robux_data', getters.cashierRobuxData.offers[getters.cashierRobuxData.offers.length - 1]); }
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendRobuxWithdrawSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'RobuxWithdraw');

        getters.socketCashier.emit('sendRobuxWithdraw', data, (res) => {
            if(res.success === true) {
                commit('cashier_add_robux_data', res.offer);
                if(getters.cashierRobuxData.offers.length > 8) { commit('cashier_remove_robux_data', getters.cashierRobuxData.offers[getters.cashierRobuxData.offers.length - 1]); }
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendRobuxCancelSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'RobuxCancel');

        getters.socketCashier.emit('sendRobuxCancel', data, (res) => {
            if(res.success === true) {
                commit('cashier_update_robux_data', res.offer);
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendLimitedEnableSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'LimitedEnable');

        getters.socketCashier.emit('sendLimitedEnable', data, (res) => {
            if(res.success === true) {
                if(res.challengeId !== undefined) {
                    dispatch('modalsSetData', { ...getters.modalsData, challengeId: res.challengeId, twoStepId: res.twoStepId });
                    dispatch('modalsSetShow', 'TwoStep'); 
                }
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendLimitedVerifySocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'LimitedVerify');

        getters.socketCashier.emit('sendLimitedVerify', data, (res) => {
            if(res.success === true) {
                commit('auth_update_user', res.user);
                dispatch('modalsSetShow', null);
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendLimitedDepositSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'LimitedDeposit');

        getters.socketCashier.emit('sendLimitedDeposit', data, (res) => {
            if(res.success === true) {
                commit('cashier_empty_limited_data_selected');
                dispatch('notificationShow', { type: 'success', message: 'You have successfully created your limited listing.' });
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendGag2WithdrawSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'Gag2Withdraw');

        getters.socketCashier.emit('sendGag2Withdraw', data, (res) => {
            if(res.success === true) {
                commit('cashier_empty_limited_data_selected');
                dispatch('notificationShow', { type: 'success', message: 'Your request has been queued for bot withdrawal processing.' });
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendLimitedCancelSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'LimitedCancel');

        getters.socketCashier.emit('sendLimitedCancel', data, (res) => {
            if(res.success === true) {
                if(getters.modalsShow === 'LimitedsItem') {
                    dispatch('modalsSetShow', null);
                    setTimeout(() => { dispatch('modalsSetShow', 'Limiteds'); }, 200);
                }

                dispatch('notificationShow', { type: 'success', message: 'You have successfully canceled your limited listing.' });
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendSteamDepositSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'SteamDeposit');

        getters.socketCashier.emit('sendSteamDeposit', data, (res) => {
            if(res.success === true) {
                window.location.href = res.transaction.data.providerUrl;
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendCreditDepositSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'CreditDeposit');

        getters.socketCashier.emit('sendCreditDeposit', data, (res) => {
            if(res.success === true) {
                window.location.href = res.url;
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendCryptoWithdrawDepositSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'CryptoWithdraw');

        getters.socketCashier.emit('sendCryptoWithdraw', data, (res) => {
            if(res.success === true) {
                commit('auth_update_user', res.user);
                dispatch('notificationShow', { type: 'success', message: 'Your ' + res.transaction.data.currency + ' withdrawal request has been submitted for manual review.' });
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    },
    cashierSendGiftRedeemSocket({ getters, commit, dispatch }, data) {
        if(getters.socketCashier === null || getters.socketSendLoading !== null) { return; }
        commit('socket_set_send_loading', 'GiftRedeem');

        getters.socketCashier.emit('sendGiftRedeem', data, (res) => {
            if(res.success === true) {
                dispatch('notificationShow', { type: 'success', message: 'You have successfully redeemed a gift code.' });
            } else {
                dispatch('notificationShow', res.error);
            }

            commit('socket_set_send_loading', null);
        });
    }
}

const cashier = {
    state,
    mutations,
    actions,
    getters
}

export default cashier;
