<template>
    <div class="limiteds">
        <div class="limiteds-items">
            <div class="items-header">
                <div class="header-title">
                    <strong>GROW A GARDEN 2</strong>
                    <span class="header-subtitle">Pet values</span>
                </div>
                <div class="header-mid">
                    <CashierFilterSearch />
                </div>
                <div class="header-filter">
                    <CashierFilterAmount />
                    <CashierFilterSort />
                </div>
            </div>
            <div v-on:scroll="cashierContentScroll" class="items-content" ref="itemsContent">
                <transition name="slide-fade" mode="out-in">
                    <router-view/>
                </transition>
            </div>
        </div>
        
        <CashierLimitedSelected />
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import CashierFilterSearch from '@/components/cashier/CashierFilterSearch';
    import CashierFilterAmount from '@/components/cashier/CashierFilterAmount';
    import CashierFilterSort from '@/components/cashier/CashierFilterSort';
    import CashierLimitedSelected from '@/components/cashier/CashierLimitedSelected';

    export default {
        name: 'Limiteds',
        metaInfo: {
            title: 'Limiteds - BloxyGAG.com'
        },
        components: {
            CashierFilterSearch,
            CashierFilterAmount,
            CashierFilterSort,
            CashierLimitedSelected
        },
        data() {
            return {
                cashierFilterMin: '',
                cashierFilterMax: ''
            }
        },
        methods: {
            ...mapActions([ 
                'cashierGetLimitedDataSocket',
                'cashierSetLimitedDataPage'
            ]),
            cashierContentScroll() {
                if (this.cashierGetRouteName === 'LimitedsDeposit') {
                    return;
                }

                const container = this.$refs.itemsContent;

                if (
                    container.scrollTop + container.clientHeight >= container.scrollHeight && 
                    this.cashierLimitedData.withdraw !== null &&
                    this.cashierLimitedData.withdraw.length > this.cashierLimitedData.page * 60
                ) { 
                    this.cashierSetLimitedDataPage(this.cashierLimitedData.page + 1);
                }
            }
        },
        computed: {
            ...mapGetters([ 
                'cashierLimitedData'
            ]),
            cashierGetRouteName() {
                return this.$route.name;
            },
            cashierHeaderTitle() {
                return 'GROW A GARDEN 2 PET VALUES';
            }
        },
        created() {
            if(this.cashierLimitedData.loading === false && new Date().getTime() - new Date(this.cashierLimitedData.loadedAt).getTime() >= 1000 * 60 * 2) {
                const data = {};
                this.cashierGetLimitedDataSocket(data);
            }
        }
    }
</script>

<style scoped>
    .limiteds {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 48px 30px 60px;
        background: linear-gradient(135deg, rgba(3, 25, 41, 0.28), rgba(0, 11, 22, 0));
    }

    .limiteds .limiteds-items {
        width: calc(100% - 280px);
        padding-right: 35px;
    }

    .limiteds .items-header {
        width: 100%;
        display: grid;
        grid-template-columns: 280px minmax(220px, auto) 409px;
        align-items: center;
        gap: 24px;
        padding: 0 0 25px;
        border-bottom: 1px solid rgba(54, 133, 170, 0.28);
    }

    .limiteds .header-title,
    .limiteds .header-mid,
    .limiteds .header-filter {
        display: flex;
        align-items: center;
    }

    .limiteds .header-title {
        grid-column: 1 / 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        line-height: 1;
    }

    .limiteds .header-kicker {
        color: #55d7b1;
        font-family: 'Open Sans', sans-serif;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.8px;
    }

    .limiteds .header-title strong {
        color: #f2fbff;
        font-size: 21px;
        font-weight: 900;
        letter-spacing: 0.2px;
    }

    .limiteds .header-subtitle {
        color: #7398b3;
        font-family: 'Open Sans', sans-serif;
        font-size: 11px;
        font-weight: 600;
    }

    .limiteds .header-mid {
        grid-column: 2 / 2;
        padding-left: 25px;
    }

    .limiteds .header-filter {
        grid-column: 3 / 3;
    }

    .limiteds .items-content {
        width: 100%;
        height: 630px;
        min-height: 600px;
        margin-top: 17px;
        overflow-x: scroll;
    }

    .limiteds .slide-fade-enter-active {
        transition: all .3s ease-out;
    }

    .limiteds .slide-fade-enter {
        opacity: 0;
    }

    @media only screen and (max-width: 1300px) {

        .limiteds {
            padding: 60px 10px;
        }

        .limiteds .items-header {
            grid-template-columns: auto 409px;
            grid-template-rows: auto auto;
            gap: 12px 20px;
        }

        .limiteds .header-title {
            grid-column: 1 / 3;
        }

        .limiteds .header-mid {
            grid-column: 1 / 1;
            grid-row: 2 / 2;
            margin-top: 10px;
            padding-left: 0;
        }

        .limiteds .header-filter {
            grid-column: 2 / 2;
            grid-row: 2 / 2;
            margin-top: 10px;
        }

    }

    @media only screen and (max-width: 1100px) {

        .limiteds .limiteds-items {
            width: 100%;
            padding-right: 0;
        }

    }

    @media only screen and (max-width: 700px) {

        .limiteds .items-header {
            grid-template-columns: auto;
            grid-template-rows: auto auto auto;
            gap: 14px;
        }

        .limiteds .header-title {
            width: 100%;
            grid-column: 1 / 1;
        }

        .limiteds .header-mid {
            width: 100%;
        }

        .limiteds .header-filter {
            width: 100%;
            grid-column: 1 / 1;
            grid-row: 3 / 3;
        }

    }

    @media only screen and (max-width: 500px) {

        .limiteds .header-filter {
            flex-direction: column;
        }

    }
</style>
