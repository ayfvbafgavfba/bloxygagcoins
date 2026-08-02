<template>
    <div class="admin-user-settings" v-if="adminUser">
        <div class="settings-element element-toggle">
            <div class="element-name">RAIN LOCK</div>
            <button v-on:click="adminValueButton('limits.blockRain', !adminUser.limits.blockRain)" v-bind:class="{ 
                'button-active': adminUser.limits.blockRain === true 
            }" v-bind:disabled="socketSendLoading !== null"></button>
        </div>
        <div class="settings-element element-toggle">
            <div class="element-name">TIP LOCK</div>
            <button v-on:click="adminValueButton('limits.blockTip', !adminUser.limits.blockTip)" v-bind:class="{ 
                'button-active': adminUser.limits.blockTip === true 
            }" v-bind:disabled="socketSendLoading !== null"></button>
        </div>
        <div v-if="adminUser.limits.blockTip === true" class="settings-element element-sub element-number">
            <div class="element-name">SET TIP LIMIT</div>
            <div class="element-input">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <input v-model="adminLimitTip" type="text" />
                <button v-on:click="adminValueButton('limits.limitTip', Math.floor(adminLimitTip * 1000))" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-toggle">
            <div class="element-name">SPONSORSHIP LOCK</div>
            <button v-on:click="adminValueButton('limits.blockSponsor', !adminUser.limits.blockSponsor)" v-bind:class="{ 
                'button-active': adminUser.limits.blockSponsor === true 
            }" v-bind:disabled="socketSendLoading !== null"></button>
        </div>
        <div class="settings-element element-toggle">
            <div class="element-name">LEADERBOARD LOCK</div>
            <button v-on:click="adminValueButton('limits.blockLeaderboard', !adminUser.limits.blockLeaderboard)" v-bind:class="{ 
                'button-active': adminUser.limits.blockLeaderboard === true 
            }" v-bind:disabled="socketSendLoading !== null"></button>
        </div>
        <div class="settings-element element-button">
            <div class="element-name">CLEAR LEADERBOARD</div>
            <button v-on:click="adminValueButton('leaderboard.points', 0)">
                <div class="button-inner">CLEAR</div>
            </button>
        </div>
        <div class="settings-element element-toggle">
            <div class="element-name">BOT ACCOUNT</div>
            <button v-on:click="adminValueButton('bot', !adminUser.bot)" v-bind:class="{ 
                'button-active': adminUser.bot === true 
            }" v-bind:disabled="socketSendLoading !== null"></button>
        </div>
        <div class="settings-element element-select">
            <div class="element-name">SET RANK</div>
            <div class="element-input">
                <select v-model="adminRank">
                    <option value="user">USER</option>
                    <option value="partner">PARTNER</option>
                    <option value="mod">MOD</option>
                    <option value="admin">ADMIN</option>
                </select>
                <button v-on:click="adminValueButton('rank', adminRank)" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-number">
            <div class="element-name">SET BALANCE</div>
            <div class="element-input">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <input v-model="adminBalance" type="text" />
                <button v-on:click="adminBalanceButton()" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-number">
            <div class="element-name">SET VAULT</div>
            <div class="element-input">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <input v-model="adminVault" type="text" />
                <button v-on:click="adminValueButton('vault.amount', Math.floor(adminVault * 1000))" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-number">
            <div class="element-name">SET DEPOSIT</div>
            <div class="element-input">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <input v-model="adminDeposit" type="text" />
                <button v-on:click="adminValueButton('stats.deposit', Math.floor(adminDeposit * 1000))" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-number">
            <div class="element-name">SET WITHDRAW</div>
            <div class="element-input">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <input v-model="adminWithdraw" type="text" />
                <button v-on:click="adminValueButton('stats.withdraw', Math.floor(adminWithdraw * 1000))" v-bind:disabled="socketSendLoading !== null">
                    <div class="button-inner">UPDATE</div>
                </button>
            </div>
        </div>
        <div class="settings-element element-button">
            <div class="element-name">MUTE USER</div>
            <button v-on:click="adminMuteButton()" class="button-red">
                <div class="button-inner">MUTE</div>
            </button>
        </div>
        <div class="settings-element element-button">
            <div class="element-name">BAN USER</div>
            <button v-on:click="adminBanButton()" class="button-red">
                <div class="button-inner">BAN</div>
            </button>
        </div>
        <div class="settings-element element-button">
            <div class="element-name">UNBAN USER</div>
            <button v-on:click="adminUnbanButton()" class="button-red">
                <div class="button-inner">UNBAN</div>
            </button>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: 'AdminUserSettings',
        data() {
            return {
                adminLimitTip: null,
                adminRank: null,
                adminBalance: null,
                adminVault: null,
                adminDeposit: null,
                adminWithdraw: null
            }
        },
        methods: {
            ...mapActions([
                'notificationShow',
                'modalsSetShow',
                'adminSendUserValueSocket',
                'adminSendUserBalanceSocket', 
                'adminSendUserUnbanSocket',
                'generalSetUserInfoData'
            ]),
            adminValueButton(setting, value) {
                if(setting === 'limits.limitTip' && (isNaN(value) === true || value < 0)) {
                    this.notificationShow({type: 'error', message: 'Your entered tip limit is invalid.'});
                    return;
                }

                const data = { userId: this.modalsData.user._id, setting: setting, value: value };
                this.adminSendUserValueSocket(data);
            },
            adminBalanceButton() {
                const balance = Math.floor(this.adminBalance * 1000);

                if(balance === null || isNaN(balance) === true || balance < 0) {
                    this.notificationShow({type: 'error', message: 'Your entered user balance is invalid.'});
                    return;
                }

                const data = { userId: this.modalsData.user._id, balance: balance };
                this.adminSendUserBalanceSocket(data);
            },
            adminMuteButton() {
                this.modalsSetShow(null);
                this.generalSetUserInfoData(this.modalsData.user);

                setTimeout(() => { this.modalsSetShow('Mute'); }, 300);
            },
            adminBanButton() {
                this.modalsSetShow(null);
                this.generalSetUserInfoData(this.modalsData.user);

                setTimeout(() => { this.modalsSetShow('Ban'); }, 300);
            },
            adminUnbanButton() {
                const data = { userId: this.modalsData.user._id };
                this.adminSendUserUnbanSocket(data);
            }
        },
        computed: {
            ...mapGetters([
                'socketSendLoading',  
                'modalsData'
            ]),
            adminUser() {
                return {
                    limits: {
                        blockRain: false,
                        blockTip: false,
                        blockSponsor: false,
                        blockLeaderboard: false,
                        limitTip: 0
                    },
                    bot: false,
                    rank: 'user',
                    balance: 0,
                    vault: { amount: 0 },
                    stats: { deposit: 0, withdraw: 0 },
                    ...((this.modalsData && this.modalsData.user) || {})
                };
            }
        },
        watch: {
            modalsData: {
                handler(data) {
                    this.adminLimitTip = (Math.floor(this.adminUser.limits.limitTip / 10) / 100).toFixed(2);
                    this.adminRank = this.adminUser.rank;
                    this.adminBalance = (Math.floor(this.adminUser.balance / 10) / 100).toFixed(2);
                    this.adminVault = (Math.floor(this.adminUser.vault.amount / 10) / 100).toFixed(2);
                    this.adminDeposit = (Math.floor(this.adminUser.stats.deposit / 10) / 100).toFixed(2);
                    this.adminWithdraw = (Math.floor(this.adminUser.stats.withdraw / 10) / 100).toFixed(2);
                },
                deep: true
            }
        },
        created() {
            this.adminLimitTip = (Math.floor(this.adminUser.limits.limitTip / 10) / 100).toFixed(2);
            this.adminRank = this.adminUser.rank;
            this.adminBalance = (Math.floor(this.adminUser.balance / 10) / 100).toFixed(2);
            this.adminVault = (Math.floor(this.adminUser.vault.amount / 10) / 100).toFixed(2);
            this.adminDeposit = (Math.floor(this.adminUser.stats.deposit / 10) / 100).toFixed(2);
            this.adminWithdraw = (Math.floor(this.adminUser.stats.withdraw / 10) / 100).toFixed(2);
        }
    }
</script>

<style scoped>
    .admin-user-settings {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .admin-user-settings .settings-element {
        width: 100%;
        height: 47px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding: 0 20px;
        border-radius: 5px;
        background: rgba(19, 66, 88, 0.3);
    }

    .admin-user-settings .settings-element:first-of-type {
        margin-top: 0;
    }

    .admin-user-settings .element-name {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        color: #bbbfd0;
    }

    .admin-user-settings .settings-element.element-toggle button {
        width: 45px;
        height: 15px;
        position: relative;
        filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
    }

    .admin-user-settings .settings-element.element-toggle button:disabled {
        cursor: not-allowed;
    }

    .admin-user-settings .settings-element.element-toggle button::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #072435;
        clip-path: polygon(4px 0, calc(100% - 4px) 0, 100% 25%, 100% 75%, calc(100% - 4px) 100%, 4px 100%, 0 75%, 0 25%);
    }

    .admin-user-settings .settings-element.element-toggle button::after {
        content: '';
        width: 25px;
        height: 19px;
        position: absolute;
        top: -2px;
        left: 0;
        background: #1c5064;
        clip-path: polygon(3px 0, calc(100% - 3px) 0, 100% 25%, 100% 75%, calc(100% - 3px) 100%, 3px 100%, 0 75%, 0 25%);
        transition: all 0.3s ease;
    }

    .admin-user-settings .settings-element.element-toggle button.button-active::after {
        transform: translate(20px, 0);
        background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
    }

    .admin-user-settings .settings-element.element-text .element-input,
    .admin-user-settings .settings-element.element-number .element-input {
        position: relative;
        display: flex;
        align-items: center;
    }

    .admin-user-settings .settings-element.element-number .element-input img {
        width: 15px;
        height: 15px;
        position: absolute;
        top: 9px;
        left: 15px;
    }

    .admin-user-settings .settings-element.element-text .element-input input,
    .admin-user-settings .settings-element.element-number .element-input input,
    .admin-user-settings .settings-element.element-select .element-input select {
        width: 220px;
        height: 33px;
        margin-right: 20px;
        padding: 0 15px;
        border-radius: 5px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        background: rgba(10, 36, 52, 0.5);
    }

    .admin-user-settings .settings-element.element-number .element-input input {
        padding: 0 15px 0 37px;
    }

    .admin-user-settings .settings-element.element-button button,
    .admin-user-settings .settings-element.element-text .element-input button,
    .admin-user-settings .settings-element.element-number .element-input button,
    .admin-user-settings .settings-element.element-select .element-input button {
        width: 60px;
        height: 30px;
        filter: drop-shadow(0px 4px 25px rgba(1, 236, 174, 0.15)) drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
    }

    .admin-user-settings .settings-element.element-button button .button-inner,
    .admin-user-settings .settings-element.element-text .element-input button .button-inner,
    .admin-user-settings .settings-element.element-number .element-input button .button-inner,
    .admin-user-settings .settings-element.element-select .element-input button .button-inner {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
        clip-path: polygon(4px 0, calc(100% - 4px) 0, 100% 25%, 100% 75%, calc(100% - 4px) 100%, 4px 100%, 0 75%, 0 25%);
    }

   .admin-user-settings .settings-element.element-button button.button-red .button-inner {
       background: #f55046;
   }

   @media only screen and (max-width: 793px) {

        .admin-user-settings {
            padding: 0 20px;
        }

    }
</style>
