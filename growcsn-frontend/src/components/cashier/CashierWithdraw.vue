<template>
    <div class="cashier-withdraw">
        <div class="withdraw-section">
            <div class="section-title">Grow A Garden 2</div>

            <CashierElement v-on:click.native="modalGag2Button()" type="gag2" method="gag2" v-bind:enabled="true" />

        </div>

        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import CashierElement from '@/components/cashier/CashierElement';

    export default {
        name: 'CashierWithdraw',
        components: {
            CashierElement
        },
        methods: {
            ...mapActions([
                'modalsSetShow', 
                'modalsSetData'
            ]),
            modalGag2Button() {
                this.modalsSetShow(null);
                this.modalsSetData({ typeCashier: 'withdraw' });

                this.$router.push({ name: 'LimitedsWithdraw' });
            }
        }
    }
</script>

<style scoped>
    .cashier-withdraw {
        width: 100%;
    }

    .cashier-withdraw .withdraw-section {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 25px;
    }

    .cashier-withdraw .withdraw-section:last-child {
        padding-bottom: 0;
        border-bottom: none;
    }

    .cashier-withdraw .section-title {
        width: 100%;
        font-size: 14px;
        font-weight: 700;
        color: #5191b1;
    }

    @media only screen and (max-width: 800px) {

        .cashier-withdraw .section-content {
            justify-content: flex-start;
        }

    }
</style>
