<template>
    <div class="roll-card" v-bind:class="{
        'card-high': multiplier >= rollGetMinBetMultiplier && multiplier >= 20,
        'card-mid': multiplier >= rollGetMinBetMultiplier && multiplier < 20 && multiplier >= 5,
        'card-low': multiplier >= rollGetMinBetMultiplier && multiplier < 5 && multiplier >= 2
    }">
        <div class="card-inner">
            <div class="inner-amount">
                <img src="@/assets/img/icons/coin.svg" alt="icon" />
                <div class="amount-value">
                    <span>{{rollFormatValue(rollGetPotential).split('.')[0]}}</span>.{{rollFormatValue(rollGetPotential).split('.')[1]}}
                </div>
            </div>
            <div class="inner-multiplier">{{parseFloat(multiplier).toFixed(2)}}x</div>
            <div v-if="multiplier >= rollGetMinBetMultiplier" class="inner-win">
                <div v-bind:style="winStyle()" class="win-image"></div>
                {{ rollGetItem.name }}
            </div>
            <div v-else class="inner-lose">
                <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M52 0C23.3285 0 0 23.3285 0 52C0 80.6715 23.3285 104 52 104C80.6715 104 104 80.6715 104 52C104 23.3285 80.6715 0 52 0ZM26 39C26 35.4185 28.9185 32.5 32.5 32.5C36.0815 32.5 39 35.4185 39 39C39 42.5815 36.0815 45.5 32.5 45.5C28.9185 45.5 26 42.5815 26 39ZM74.9775 79.118C74.3405 79.755 73.5085 80.067 72.6765 80.067C71.8445 80.067 71.0125 79.7485 70.3755 79.118C60.5475 69.29 43.4265 69.29 33.605 79.118C32.3375 80.3855 30.277 80.3855 29.0095 79.118C27.742 77.8505 27.742 75.79 29.0095 74.5225C35.1585 68.3865 43.316 65 52 65C60.684 65 68.8415 68.3865 74.9775 74.5225C76.245 75.79 76.245 77.8505 74.9775 79.118ZM71.5 45.5C67.9185 45.5 65 42.5815 65 39C65 35.4185 67.9185 32.5 71.5 32.5C75.0815 32.5 78 35.4185 78 39C78 42.5815 75.0815 45.5 71.5 45.5Z" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import petValues from '@/assets/pet-values.json';

    const normalizePetValue = (value) => {
        const rawTokens = Number(value.variants?.[0]?.tokens ?? value.variant_tokens?.Normal ?? 0);
        const valueFallbacks = {
            'Mega Raccoon': 5000000,
            'Carrot Seed': 100
        };
        const tokens = rawTokens > 0 ? rawTokens : (valueFallbacks[value.display_name || value.name] || 0);

        return {
            _id: value.slug || value.variants?.[0]?.id || value.name,
            name: value.display_name || value.name,
            image: value.image_url
                ? value.image_url.startsWith('http')
                    ? value.image_url
                    : 'https://growagarden.roflips.com' + value.image_url
                : '',
            amountFixed: tokens
        };
    };

    const defaultItem = { name: 'Unknown Pet', image: '' };

    const getPoolItem = (pool, index) => {
        if (!Array.isArray(pool) || pool.length === 0) {
            return defaultItem;
        }

        const safeIndex = Math.min(Math.max(index, 0), pool.length - 1);
        return pool[safeIndex] || defaultItem;
    };

    export default {
        name: 'RollCard',
        props: ['multiplier'],
        computed: {
            ...mapGetters([
                'authUser',
                'rollGame',
                'rollBets'
            ]),
            rollItems() {
                const preferredNames = [
                    'Moon Bloom Seed', 'Unicorn', 'Ice Serpent', 'Sun Bloom Seed', 'Hypno Bloom Seed',
                    'Star Fruit Seed', 'Dragon\'s Breath Seed', 'Rainbow Unicorn', 'Mega Unicorn',
                    'Rainbow Ice Serpent', 'Big Ice Serpent', 'Rainbow Big Ice Serpent', 'Raccoon',
                    'Rainbow Raccoon', 'Mega Raccoon', 'Owl', 'Rainbow Owl', 'Mega Owl', 'Butterfly',
                    'Rainbow Butterfly', 'Mega Butterfly', 'Golden Dragonfly', 'Rainbow Golden Dragonfly',
                    'Gold Seed', 'Blueberry Seed', 'Grape Seed', 'Mango Seed', 'Strawberry Seed',
                    'Apple Seed', 'Coconut Seed', 'Mushroom Seed', 'Corn Seed', 'Carrot Seed',
                    'Pineapple Seed', 'Venus Fly Trap Seed', 'Poison Ivy Seed', 'Rainbow Mega Ice Serpent',
                    'Rainbow Mega Raccoon', 'Mega Ice Serpent', 'Rainbow Mega Black Dragon', 'Black Dragon'
                ];
                const catalog = Array.isArray(petValues.items) ? petValues.items.map(normalizePetValue) : [];
                const preferred = preferredNames
                    .map(name => catalog.find(item => item.name === name))
                    .filter(Boolean);
                const remaining = catalog
                    .filter(item => !preferred.some(selected => selected._id === item._id))
                    .sort((a, b) => a.amountFixed - b.amountFixed);
                const petItems = preferred.concat(remaining).slice(0, 50).sort((a, b) => a.amountFixed - b.amountFixed);

                return {
                    1: petItems.slice(0, 10),
                    2: petItems.slice(10, 20),
                    3: petItems.slice(20, 30),
                    4: petItems.slice(30, 40),
                    5: petItems.slice(40, 50)
                };
            },
            rollGetItem() {
                const multiplier = Number(this.multiplier);
                let item = getPoolItem(this.rollItems[5], 9);

                if (multiplier <= 2.5) {
                    item = getPoolItem(this.rollItems[1], Math.round((multiplier - 1) / (1.5 / 9)));
                } else if (multiplier <= 5) {
                    item = getPoolItem(this.rollItems[2], Math.round((multiplier - 2.5) / (2.5 / 9)));
                } else if (multiplier <= 50) {
                    item = getPoolItem(this.rollItems[3], Math.round((multiplier - 5) / (45 / 9)));
                } else if (multiplier <= 100) {
                    item = getPoolItem(this.rollItems[4], Math.round((multiplier - 50) / (50 / 9)));
                } else if (multiplier <= 1000) {
                    item = getPoolItem(this.rollItems[5], Math.round((multiplier - 100) / (900 / 9)));
                }

                return item;
            },
            rollGetPotential() {
                let potential = 0;

                if (this.authUser.user !== null) {
                    for (const bet of this.rollBets.filter((element) => element.user._id === this.authUser.user._id)) {
                        if (this.multiplier >= (bet.multiplier / 100)) {
                            potential += Math.floor(bet.amount * (bet.multiplier / 100));
                        }
                    }
                }

                return potential;
            },
            rollGetMinBetMultiplier() {
                let multiplier = 0;

                if (this.authUser.user !== null) {
                    for (const bet of this.rollBets.filter((element) => element.user._id === this.authUser.user._id)) {
                        if (multiplier === 0 || bet.multiplier < multiplier) {
                            multiplier = bet.multiplier;
                        }
                    }
                }

                return multiplier / 100;
            }
        },
        methods: {
            rollFormatValue(value) {
                const amount = Number(value) || 0;
                return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
            }
            ,
            localImage(src) {
                if (!src) return '';
                try {
                    const parts = src.split('/');
                    const file = parts[parts.length - 1];
                    return 'https://growagarden.roflips.com/' + file;
                } catch (e) { return src; }
            },
            winStyle() {
                const url = this.localImage(this.rollGetItem.image || '');
                return {
                    'background-image': url ? ('url(' + url + ')') : 'none',
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'background-size': '80px auto'
                };
            }
        }
    }
</script>

<style scoped>
    .roll-card {
        width: 139px;
        height: 100%;
        position: relative;
        flex-shrink: 0;
        margin-right: 4px;
        filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.15));
    }

    .roll-card:last-of-type {
        margin-right: 0;
    }

    .roll-card::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #10283a;
        clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 10%, 100% 90%, calc(100% - 18px) 100%, 18px 100%, 0 90%, 0 10%);
    }

    .roll-card.card-high::before {
        background: linear-gradient(180deg, rgba(222, 68, 34, 0.5) 0%, rgba(222, 68, 34, 0.25) 50%, #de4422 100%);
    }

    .roll-card.card-mid::before {
        background: linear-gradient(180deg, rgba(255, 183, 3, 0.5) 0%, rgba(255, 183, 3, 0.25) 50%, #ffe603 100%);
    }

    .roll-card.card-low::before {
        background: linear-gradient(180deg, rgba(0, 255, 194, 0.5) 0%, rgba(0, 255, 194, 0.25) 50%, #00ffc2 100%);
    }

    .roll-card .card-inner {
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 1px;
        left: 1px;
        padding: 15px;
        background-color: #062137;
        clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 10%, 100% 90%, calc(100% - 18px) 100%, 18px 100%, 0 90%, 0 10%);
        z-index: 1;
    }

    .roll-card.card-high .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(222, 35, 35, 0.75) -30%, rgba(222, 68, 34, 0.75) -16%, rgba(167, 43, 35, 0.431195) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(146, 25, 25, 0.25);
    }

    .roll-card.card-mid .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 183, 3, 0.75) -30%, rgba(255, 183, 3, 0.75) -16%, rgba(255, 183, 3, 0.43) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(255, 168, 0, 0.25);
    }

    .roll-card.card-low .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(0, 255, 194, 0.75) -30%, rgba(0, 255, 194, 0.75) -16%, rgba(0, 255, 194, 0.26) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(35, 194, 99, 0.25);
    }

    .roll-card .inner-amount {
        display: flex;
        align-items: center;
    }

    .roll-card .inner-amount img {
        width: 14px;
        height: 14px;
        margin-right: 6px;
    }

    .roll-card .amount-value {
        font-size: 10px;
        font-weight: 600;
        color: #bbbfd0;
    }

    .roll-card .amount-value span {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
    }

    .roll-card .inner-multiplier {
        margin-top: 2px;
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
    }

    .roll-card .inner-win {
        height: calc(100% - 46px);
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        text-transform: uppercase;
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        white-space: normal;
        word-break: break-word;
    }

    .roll-card .win-image {
        width: 100%;
        height: 80px;
    }

    .roll-card .inner-lose {
        margin-top: 14px;
    }

    .roll-card .inner-lose svg {
        fill: #0a2a45;
    }
</style>
