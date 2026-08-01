<template>
    <div class="admin-settings">
        <div class="settings-section">
            <div class="section-title">General</div>
            <AdminSettingsToggle name="Maintenance" setting="general.maintenance.enabled" />
            <AdminSettingsToggle name="Rain" setting="general.rain.enabled" />
            <AdminSettingsToggle name="Leaderboard" setting="general.leaderboard.enabled" />
            <AdminSettingsToggle name="Tip" setting="general.tip.enabled" />
            <AdminSettingsToggle name="Affiliate Redeem" setting="general.affiliate.enabled" />
            <AdminSettingsSelect name="Reward Multiplier" setting="general.reward.multiplier" />
        </div>
        <div class="settings-section">
            <div class="section-title">Chat</div>
            <AdminSettingsToggle name="Enabled" setting="chat.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Games</div>
            <AdminSettingsToggle name="Crash" setting="games.crash.enabled" />
            <AdminSettingsToggle name="Roll" setting="games.roll.enabled" />
            <AdminSettingsToggle name="Blackjack" setting="games.blackjack.enabled" />
            <AdminSettingsToggle name="Dice Duels" setting="games.duels.enabled" />
            <AdminSettingsToggle name="Mines" setting="games.mines.enabled" />
            <AdminSettingsToggle name="Towers" setting="games.towers.enabled" />
            <AdminSettingsToggle name="Unbox" setting="games.unbox.enabled" />
            <AdminSettingsToggle name="Battles" setting="games.battles.enabled" />
            <AdminSettingsToggle name="Upgrader" setting="games.upgrader.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Robux</div>
            <AdminSettingsToggle name="Deposit" setting="robux.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="robux.withdraw.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Limited</div>
            <AdminSettingsToggle name="Deposit" setting="limited.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="limited.withdraw.enabled" />
            <div class="admin-settings-toggle">
                <div class="toggle-name">Open</div>
                <button 
                    v-on:click="openAllowedPets" 
                    class="button-active"
                ></button>
            </div>
        </div>
        <div class="settings-section">
            <div class="section-title">Steam</div>
            <AdminSettingsToggle name="Deposit" setting="steam.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="steam.withdraw.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Crypto</div>
            <AdminSettingsToggle name="Deposit" setting="crypto.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="crypto.withdraw.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Gift</div>
            <AdminSettingsToggle name="Deposit" setting="gift.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="gift.withdraw.enabled" />
        </div>
        <div class="settings-section">
            <div class="section-title">Credit</div>
            <AdminSettingsToggle name="Deposit" setting="credit.deposit.enabled" />
            <AdminSettingsToggle name="Withdraw" setting="credit.withdraw.enabled" />
        </div>
    </div>
</template>

<script>
    import AdminSettingsToggle from '@/components/admin/AdminSettingsToggle';
    import AdminSettingsSelect from '@/components/admin/AdminSettingsSelect';
    import AdminAllowedPets from '@/components/admin/AdminAllowedPets';

    export default {
        name: 'AdminSettings',
        components: {
            AdminSettingsToggle,
            AdminSettingsSelect,
            // allowed pets management
            AdminAllowedPets
        }
        ,
        methods: {
            openAllowedPets() {
                this.$store.dispatch('modalsSetShow', 'AdminAllowedPets');
            }
        }
    }
</script>

<style scoped>
    .admin-settings {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, auto);
        gap: 10px;
    }

    .admin-settings .settings-section {
        width: 100%;
        padding: 15px 10px;
        border-radius: 5px;
        background: rgba(19, 66, 88, 0.25);
    }

    .admin-settings .settings-section:nth-child(1) {
        grid-column: 1 / 1;
        grid-row: 1 / 3;
    }

    .admin-settings .settings-section:nth-child(2) {
        grid-column: 1 / 1;
        grid-row: 3 / 3;
    }

    .admin-settings .settings-section:nth-child(3) {
        grid-column: 2 / 2;
        grid-row: 1 / 4;
    }

    .admin-settings .section-title {
        padding-left: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #8bacc8;
    }

    @media only screen and (max-width: 1100px) {

        .admin-settings {
            grid-template-columns: repeat(3, 1fr);
        }

    }

    @media only screen and (max-width: 850px) {

        .admin-settings {
            grid-template-columns: repeat(2, 1fr);
        }

    }

    @media only screen and (max-width: 500px) {

        .admin-settings {
            grid-template-columns: repeat(1, 1fr);
        }

        .admin-settings .settings-section:nth-child(3) {
            grid-column: 1 / 1;
            grid-row: 4 / 4;
        }

    }
</style>

<style scoped>
/* replicate toggle styles so the OPEN control appears identical */
.admin-settings-toggle {
    width: 100%;
    height: 47px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding: 0 10px;
    border-radius: 5px;
    background-color: rgba(19, 66, 88, 0.3);
}
.admin-settings-toggle .toggle-name {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
    color: #bbbfd0;
}
.admin-settings-toggle button {
    width: 45px;
    height: 15px;
    position: relative;
    filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
}
.admin-settings-toggle button::before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: #072435;
    clip-path: polygon(4px 0, calc(100% - 4px) 0, 100% 25%, 100% 75%, calc(100% - 4px) 100%, 4px 100%, 0 75%, 0 25%);
}
.admin-settings-toggle button::after {
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
.admin-settings-toggle button.button-active::after {
    transform: translate(20px, 0);
    background: linear-gradient(255deg, #00ffc2 0%, #00aa6d 100%);
}
</style>