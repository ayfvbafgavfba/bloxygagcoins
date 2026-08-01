<template>
    <div class="roll-game-win" v-bind:class="{
        'win-high': multiplier / 100 >= 20,
        'win-mid': multiplier / 100 < 20 && multiplier / 100 >= 5,
        'win-low': multiplier / 100 < 5 && multiplier / 100 >= 2
    }">
        <div class="win-box">
            <div class="box-inner">
                <div class="inner-card">
                    <div class="card-inner">
                        <div class="inner-amount">
                            <img src="@/assets/img/icons/coin.svg" alt="icon" />
                            <div class="amount-value">
                                <span>{{rollFormatValue(winAmount).split('.')[0]}}</span>.{{rollFormatValue(winAmount).split('.')[1]}}
                            </div>
                        </div>
                        <div class="inner-multiplier">{{parseFloat(multiplier / 100).toFixed(2)}}x</div>
                        <div class="inner-win">
                            <div v-bind:style="winStyle()" class="win-image"></div>
                            {{ rollGetItem.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <span class="text-green-gradient">YOUR BALANCE HAS BEEN CREDITED!</span>
    </div>
</template>

<script>
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
        name: 'RollGameWin',
        props: [
            'winAmount',
            'multiplier'
        ],
        computed: {
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
                const multiplier = Number(this.multiplier) / 100;
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
            }
        },
        methods: {
            rollFormatValue(value) {
                return parseFloat(Math.floor(value / 10) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
                    'background-size': '110px auto'
                };
            }
        }
    }
</script>

<style scoped>
    .roll-game-win {
        width: 330px;
        height: 400px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
        padding: 15px 15px 20px 15px;
        border-radius: 15px;
        background: #001424;
        border: 1px solid rgba(59, 126, 183, 0.5);
        box-shadow: 0px 4px 50px rgba(0, 0, 0, 0.5), inset 0px 0px 25px rgba(0, 0, 0, 0.35);
    }

    .roll-game-win span {
        font-size: 14px;
        font-weight: 800;
    }

    .roll-game-win .win-box {
        width: 100%;
        height: 325px;
        padding: 1px;
        border-radius: 8px;
        background: #10283a;
    }

    .roll-game-win.win-high .win-box {
        background: linear-gradient(180deg, rgba(222, 68, 34, 0.5) 0%, rgba(222, 68, 34, 0.25) 50%, #de4422 100%);
    }

    .roll-game-win.win-mid .win-box {
        background: linear-gradient(180deg, rgba(255, 183, 3, 0.5) 0%, rgba(255, 183, 3, 0.25) 50%, #ffe603 100%);
    }

    .roll-game-win.win-low .win-box {
        background: linear-gradient(180deg, rgba(0, 255, 194, 0.5) 0%, rgba(0, 255, 194, 0.25) 50%, #00ffc2 100%);
    }

    .roll-game-win .box-inner {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background-color: #062137;
    }

    .roll-game-win.win-high .box-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(222, 35, 35, 0.75) -30%, rgba(222, 68, 34, 0.75) -16%, rgba(167, 43, 35, 0.431195) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(146, 25, 25, 0.25);
    }

    .roll-game-win.win-mid .box-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 183, 3, 0.75) -30%, rgba(255, 183, 3, 0.75) -16%, rgba(255, 183, 3, 0.43) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(255, 168, 0, 0.25);
    }

    .roll-game-win.win-low .box-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(0, 255, 194, 0.75) -30%, rgba(0, 255, 194, 0.75) -16%, rgba(0, 255, 194, 0.26) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(35, 194, 99, 0.25);
    }

    .roll-game-win .inner-card {
        width: 195px;
        height: 275px;
        position: relative;
        flex-shrink: 0;
        margin-right: 4px;
        filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.15));
    }

    .roll-game-win .inner-card::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #10283a;
        clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 10%, 100% 90%, calc(100% - 18px) 100%, 18px 100%, 0 90%, 0 10%);
    }

    .roll-game-win.win-high .inner-card::before {
        background: linear-gradient(180deg, rgba(222, 68, 34, 0.5) 0%, rgba(222, 68, 34, 0.25) 50%, #de4422 100%);
    }

    .roll-game-win.win-mid .inner-card::before {
        background: linear-gradient(180deg, rgba(255, 183, 3, 0.5) 0%, rgba(255, 183, 3, 0.25) 50%, #ffe603 100%);
    }

    .roll-game-win.win-low .inner-card::before {
        background: linear-gradient(180deg, rgba(0, 255, 194, 0.5) 0%, rgba(0, 255, 194, 0.25) 50%, #00ffc2 100%);
    }

    .roll-game-win .card-inner {
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

    .roll-game-win.win-high .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(222, 35, 35, 0.75) -30%, rgba(222, 68, 34, 0.75) -16%, rgba(167, 43, 35, 0.431195) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(146, 25, 25, 0.25);
    }

    .roll-game-win.win-mid .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 183, 3, 0.75) -30%, rgba(255, 183, 3, 0.75) -16%, rgba(255, 183, 3, 0.43) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(255, 168, 0, 0.25);
    }

    .roll-game-win.win-low .card-inner {
        background: radial-gradient(230% 105% at 50% 15%, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.46) 30%, rgba(0, 0, 0, 0.42) 65%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(0, 255, 194, 0.75) -30%, rgba(0, 255, 194, 0.75) -16%, rgba(0, 255, 194, 0.26) 30%, rgba(0, 0, 0, 0) 100%), #062137;
        box-shadow: inset 0px 0px 75px rgba(35, 194, 99, 0.25);
    }

    .roll-game-win .inner-amount {
        display: flex;
        align-items: center;
    }

    .roll-game-win .inner-amount img {
        width: 16px;
        height: 16px;
        margin-right: 6px;
    }

    .roll-game-win .amount-value {
        font-size: 12px;
        font-weight: 600;
        color: #bbbfd0;
    }

    .roll-game-win .amount-value span {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
    }

    .roll-game-win .inner-multiplier {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
    }

    .roll-game-win .inner-win {
        height: calc(100% - 57px);
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
        text-transform: uppercase;
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        white-space: normal;
        word-break: break-word;
    }

    .roll-game-win .win-image {
        width: 100%;
        height: 110px;
    }
</style>
