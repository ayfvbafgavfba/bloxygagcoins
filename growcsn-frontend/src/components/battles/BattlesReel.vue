<template>
    <div class="battles-reel">
        <div class="reel-track" :style="trackStyle">
            <div v-for="(item, index) in reel" v-bind:key="index" class="reel-element" v-bind:class="[
                'element-' + (item && item.color ? item.color : 'yellow'),
                { 'element-active': index === pos }
            ]">
                <div class="element-image">
                    <img v-bind:src="getItemImage(item)" @error="onImgError($event)" />
                </div>
                <div v-if="index === 60 && running === false && item" class="element-info">
                    <span>{{ getItemName(item) }}</span>
                    <div class="info-amount" v-if="getItemAmount(item) !== null">
                        <img src="@/assets/img/icons/coin.svg" alt="icon" />
                        <div class="amount-value">
                            {{ battlesFormatValue(getItemAmount(item) * 1) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import IconItemBlue from '@/components/icons/IconItemBlue';
    import IconItemPurple from '@/components/icons/IconItemPurple';
    import IconItemGreen from '@/components/icons/IconItemGreen';
    import IconItemRed from '@/components/icons/IconItemRed';
    import IconItemYellow from '@/components/icons/IconItemYellow';

    export default {
        name: 'BattlesReel',
        components: {
            IconItemBlue,
            IconItemPurple,
            IconItemGreen,
            IconItemRed,
            IconItemYellow
        },
        props: [
            'reel',
            'pos',
            'running',
            'trackStyle'
        ],
        methods: {
            battlesFormatValue(value) {
                const amount = Number(value) || 0;
                if (amount >= 1000000) {
                    return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                }
                if (amount >= 1000) {
                    return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
                }
                return amount.toLocaleString('en-US');
            },
            getItemName(item) {
                if (!item) { return 'Unknown'; }
                if (item.item && item.item.name) { return item.item.name; }
                if (item.name) { return item.name; }
                if (item.item_name) { return item.item_name; }
                return 'Unknown';
            },
            getItemImage(item) {
                if (!item) { return ''; }
                const src = item.item && item.item.image ? item.item.image
                    : item.item && item.item.item_image ? item.item.item_image
                    : item.image ? item.image
                    : item.item_image ? item.item_image
                    : '';
                return this.localImage(src);
            },
            getItemAmount(item) {
                if (!item) { return null; }
                if (item.item && item.item.amountFixed) { return Number(item.item.amountFixed); }
                if (item.amountFixed) { return Number(item.amountFixed); }
                if (item.item && item.item.item_value) { return Number(item.item.item_value); }
                return null;
            },
            localImage(src) {
                if (!src) return '';
                try {
                    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
                        return src;
                    }
                    const baseUrl = process.env.BASE_URL || '/';
                    return `${baseUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
                } catch (e) {
                    return src;
                }
            },
            onImgError(event) {
                try {
                    const parts = event.target.src.split('/');
                    const file = parts[parts.length - 1];
                    const baseUrl = process.env.BASE_URL || '/';
                    event.target.src = `${baseUrl.replace(/\/$/, '')}/img/items/${file}`;
                } catch (e) {}
            }
        }
    }
</script>

<style scoped>
    .battles-reel {
        width: 100%;
        height: 100%;
        min-height: 274px;
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(2, 14, 26, 0.55);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
    }

    .battles-reel::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 8px;
        right: 8px;
        height: 118px;
        transform: translateY(-50%);
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        pointer-events: none;
    }

    .battles-reel .reel-track {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s ease;
    }

    .battles-reel .reel-element {
        width: 100%;
        height: 105px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 12px;
        opacity: 0.25;
        transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .battles-reel .reel-element:last-child {
        margin-bottom: 0;
    }

    .battles-reel .reel-element.element-active {
        opacity: 1;
    }

    .battles-reel .element-image {
        width: 105px;
        height: 105px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .battles-reel .reel-element.element-active .element-image {
        transform: scale(1.08);
    }

    .battles-game .element-image svg {
        flex-shrink: 0;
    }

    .battles-reel .element-image img {
        image-rendering: pixelated;
        width: 55px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: transform 0.3s ease;
    }

    .battles-reel .reel-element.element-active .element-image img {
        transform: translate(-50%, -50%) scale(1.2);
    }

    .battles-reel .element-info {
        max-width: calc(100% - 115px);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-left: 10px;
    }

    .battles-reel .element-info span {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        color: #5e768e;
    }

    .battles-reel .info-amount {
        display: flex;
        align-items: center;
        margin-top: 3px;
    }

    .battles-reel .info-amount img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }

    .battles-reel .amount-value {
        font-size: 11px;
        font-weight: 600;
        color: #bbbfd0;
    }

    .battles-reel .amount-value span {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
    }
</style>