<template>
    <div class="cashier-deposit">

        <div class="deposit-section bot-deposit-section" v-if="botAccounts.length > 0 || botAccountsLoading">
            <div class="bot-deposit-header">
                <div>
                    <div class="section-title">Bot Deposits</div>
                    <div class="bot-deposit-description">Send item requests to a bot account and it will auto-deposit them into the site.</div>
                </div>
                <button class="bot-refresh" v-on:click="loadBotAccounts" :disabled="botAccountsLoading">
                    {{ botAccountsLoading ? 'Refreshing…' : 'Refresh' }}
                </button>
            </div>
            <div class="bot-account-list">
                <div v-if="botAccountsLoading" class="bot-account-loading">Loading bot deposit accounts...</div>
                <div v-else>
                    <div v-for="account in botAccounts" :key="account._id" class="bot-account-card">
                        <div class="bot-account-card-main">
                            <div class="bot-account-avatar"></div>
                            <div class="bot-account-copy-wrapper">
                                <div class="bot-account-username">{{ account.username }}</div>
                                <div class="bot-account-text">Mail your item(s) to <strong>{{ account.username }}</strong> and the bot will deposit them to the site.</div>
                            </div>
                        </div>
                        <div class="bot-account-footer">
                            <div class="bot-account-status" :class="{ online: account.online === true, offline: account.online !== true }">
                                <span class="status-dot"></span>
                                <span>{{ account.online === true ? 'Online' : 'Offline' }}</span>
                            </div>
                            <button class="bot-account-copy" v-on:click="copyBotName(account.username)">Copy username</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="deposit-section">
            
            <div class="section-gift">
                <div class="gift-title">Redeem Bonus Code</div>
                <div class="gift-input">
                    <input v-model="modalGiftCode" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" />
                    <button v-on:click="modalRedeemButton()" class="button-redeem" v-bind:disabled="socketSendLoading !== null">
                        <div class="button-inner">REDEEM</div>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { mapGetters, mapActions } from 'vuex';
    import CashierElement from '@/components/cashier/CashierElement';

    export default {
        name: 'CashierDeposit',
        components: {
            CashierElement
        },
        data() {
            return {
                modalGiftCode: null,
                botAccounts: [],
                botAccountsLoading: false,
                botStatusTimer: null
            }
        },
        methods: {
            ...mapActions([
                'notificationShow',
                'modalsSetShow', 
                'modalsSetData'
            ]),
            modalRobuxButton() {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit' });

                setTimeout(() => { this.modalsSetShow('Robux'); }, 200);
            },
            modalLimitedsButton() {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit' });

                this.$router.push({ name: 'LimitedsDeposit' });
            },
            modalSteamButton(game) {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit', provider: 'skinify', game: game });

                setTimeout(() => { this.modalsSetShow('Proceed'); }, 200);
            },
            modalCreditButton() {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit' });

                setTimeout(() => { this.modalsSetShow('Credit'); }, 200);
            },
            modalCryptoButton(currency) {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit', currency: currency });

                setTimeout(() => { this.modalsSetShow('Crypto'); }, 200);
            },
            modalGiftButton(provider) {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'deposit', provider: provider });

                setTimeout(() => { this.modalsSetShow('Gift'); }, 200);
            },
            async loadBotAccounts() {
                this.botAccountsLoading = true;

                try {
                    const res = await axios.get('/bot/gag/accounts');
                    if(res.data.success === true) {
                        this.botAccounts = res.data.accounts;
                    } else {
                        this.notificationShow(res.data.error);
                    }
                } catch(err) {
                    this.notificationShow({ type: 'error', message: 'Unable to load bot accounts.' });
                    this.botAccounts = [];
                }

                this.botAccountsLoading = false;
            },
            copyBotName(name) {
                if(navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    navigator.clipboard.writeText(name).then(() => {
                        this.notificationShow({ type: 'success', message: 'Bot account copied to clipboard.' });
                    }).catch(() => {
                        this.notificationShow({ type: 'error', message: 'Unable to copy bot account.' });
                    });
                }
            }
        },
        computed: {
            ...mapGetters([
                'generalSettings',
                'socketSendLoading'
            ])
        },
        mounted() {
            this.loadBotAccounts();
            this.botStatusTimer = setInterval(() => {
                this.loadBotAccounts();
            }, 15000);
        },
        beforeDestroy() {
            if(this.botStatusTimer !== null) {
                clearInterval(this.botStatusTimer);
            }
        }
    }
</script>

<style scoped>
    .cashier-deposit {
        width: 100%;
    }

    .cashier-deposit .deposit-section {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 25px;
    }

    .cashier-deposit .section-title {
        width: 100%;
        font-size: 14px;
        font-weight: 700;
        color: #5191b1;
    }

    .cashier-deposit .section-gift {
        width: calc(50% - 18px);
        margin-left: 12px;
    }

    .cashier-deposit .gift-title {
        font-size: 13px;
        font-weight: 400;
        color: #5191b1;
    }

    .cashier-deposit .gift-input {
        width: 100%;
        height: 64px;
        position: relative;
        margin-top: 7px;
    }

    .cashier-deposit .gift-input input {
        width: 100%;
        height: 100%;
        padding: 0 115px 0 20px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 400;
        color: #ffffff;
        background: #072131;
        border: 1px dashed #123651;
    }

    .cashier-deposit .gift-input input::placeholder {
        color: #bbbfd0;
    }

    .cashier-deposit button.button-redeem {
        width: 95px;
        height: 36px;
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translate(0, -50%);
        transition: all .2s;
    }

    .button-redeem:hover {
        transition-duration: .2s; 
        opacity: .8;
    }
    .button-redeem:active {
        transition-duration: .2s;
        scale: .9;
    }

    .cashier-deposit button.button-redeem .button-inner {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 13px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
        clip-path: polygon(5px 0, calc(100% - 5px) 0, 100% 25%, 100% 75%, calc(100% - 5px) 100%, 5px 100%, 0 75%, 0 25%);
    }

    @media only screen and (max-width: 840px) {

        .cashier-deposit .section-gift {
            width: calc(33.33% - 8px);
            margin-left: 0;
        }

    }

    .cashier-deposit .bot-deposit-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 25px;
    }

    .cashier-deposit .bot-account-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 18px;
    }

    .cashier-deposit .bot-account-card {
        width: 100%;
        padding: 20px;
        border-radius: 16px;
        background: #071719;
        border: 1px solid rgba(4, 30, 42, 0.8);
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .cashier-deposit .bot-deposit-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 16px;
    }

    .cashier-deposit .bot-deposit-description {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.5;
        color: #8cb3cb;
        max-width: 520px;
    }

    .cashier-deposit .bot-refresh {
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid rgba(0, 255, 194, 0.25);
        background: rgba(0, 255, 194, 0.05);
        color: #c3fff0;
        font-size: 12px;
        font-weight: 700;
        transition: all .2s ease;
    }

    .cashier-deposit .bot-refresh:hover {
        background: rgba(0, 255, 194, 0.1);
    }

    .cashier-deposit .bot-account-card {
        width: 100%;
        padding: 22px;
        border-radius: 20px;
        background: linear-gradient(180deg, rgba(4, 22, 33, 0.95) 0%, rgba(7, 23, 25, 0.95) 100%);
        border: 1px solid rgba(0, 255, 194, 0.1);
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .cashier-deposit .bot-account-card-main {
        display: flex;
        gap: 16px;
        align-items: center;
    }

    .cashier-deposit .bot-account-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(180deg, #0a4a63 0%, #063849 100%);
        border: 1px solid rgba(0, 255, 194, 0.16);
        box-shadow: inset 0 0 6px rgba(0, 255, 194, 0.12);
        flex-shrink: 0;
    }

    .cashier-deposit .bot-account-copy-wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .cashier-deposit .bot-account-username {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
    }

    .cashier-deposit .bot-account-text {
        font-size: 13px;
        font-weight: 400;
        color: #b6d0e5;
        max-width: 640px;
    }

    .cashier-deposit .bot-account-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .cashier-deposit .bot-account-copy {
        padding: 12px 18px;
        border-radius: 999px;
        border: 1px solid rgba(0, 255, 194, 0.17);
        background: linear-gradient(180deg, rgba(0, 255, 194, 0.08), rgba(0, 255, 194, 0.02));
        color: #d6ffef;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        transition: transform .2s ease, background .2s ease;
    }

    .cashier-deposit .bot-account-copy:hover {
        transform: translateY(-1px);
        background: rgba(0, 255, 194, 0.12);
    }

    .cashier-deposit .bot-account-copy:hover {
        background: rgba(0, 255, 194, 0.08);
    }

    .cashier-deposit .bot-account-status {
        width: fit-content;
        padding: 9px 14px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        background: rgba(16, 59, 53, 0.22);
        letter-spacing: 0.01em;
    }

    .cashier-deposit .bot-account-status.online {
        background: rgba(0, 255, 194, 0.14);
        color: #b8ffd8;
    }

    .cashier-deposit .bot-account-status.offline {
        background: rgba(255, 73, 115, 0.14);
        color: #ffb3cb;
    }

    .cashier-deposit .bot-account-status .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        background: #ff6b87;
        box-shadow: 0 0 12px rgba(255, 107, 135, 0.35);
    }

    .cashier-deposit .bot-account-status.online .status-dot {
        background: #73ffcc;
        box-shadow: 0 0 14px rgba(115, 255, 204, 0.38);
    }

    @media only screen and (max-width: 840px) {
        .cashier-deposit .bot-deposit-header {
            flex-direction: column;
            align-items: stretch;
        }

        .cashier-deposit .bot-account-footer {
            flex-direction: column;
            align-items: stretch;
        }

        .cashier-deposit .bot-account-copy {
            width: 100%;
        }

        .cashier-deposit .bot-account-card {
            padding: 18px;
        }

        .cashier-deposit .section-gift {
            width: 100%;
            margin-top: 12px;
            margin-left: 0;
        }
    }
</style>
