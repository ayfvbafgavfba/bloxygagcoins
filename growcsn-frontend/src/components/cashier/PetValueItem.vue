<template>
    <div class="pet-value-item-vertical" @click.stop="toggleSelect">
        <div class="pet-value-inner-vertical" :class="{ selected: isSelected }">
            <div class="pet-value-left">
                <div class="pet-value-image">
                    <img v-if="item.image" :src="localImage(item.image)" :alt="item.name" @error="onImageError" />
                    <div v-else class="pet-value-image-placeholder"></div>
                </div>
            </div>
            <div class="pet-value-right">
                <div class="pet-value-name">{{ item.name }}</div>
                <div class="pet-value-meta">
                    <span class="pet-value-rarity">{{ item.rarity || 'Unknown' }}</span>
                    <span class="pet-value-amount">{{ formatValue(item.amount) }}</span>
                    <span v-if="item.available !== undefined" class="pet-value-available">x{{ item.available }}</span>
                </div>
                <div class="pet-value-controls" v-if="isSelected">
                    <button class="control" @click.stop="decrement">−</button>
                    <span class="count">{{ count }}</span>
                    <button class="control" @click.stop="increment">+</button>
                </div>
                <div v-else class="pet-available" v-if="item.available !== undefined">
                    <span class="available-text">x{{ Number(item.available) || 0 }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import placeholder from '@/assets/img/anon.png';
import { mapState } from 'vuex';

export default {
    name: 'PetValueItem',
    props: ['item'],
    computed: {
        ...mapState({ cashierLimitedData: state => state.cashier.cashierLimitedData }),
        selectedEntry() {
            return this.cashierLimitedData.selected.find(s => s.uniqueId === this.item.uniqueId);
        },
        isSelected() {
            return !!this.selectedEntry;
        },
        count() {
            return this.selectedEntry ? (this.selectedEntry.count || 1) : 0;
        }
    },
    methods: {
        formatValue(amount) {
            const value = Number(amount) || 0;
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (value >= 1000) {
                return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            }
            return value.toLocaleString('en-US');
        },
        onImageError(event) {
            try {
                const image = event.target;
                const current = image.src || '';
                const file = current.split('/').pop().split('?')[0];

                if (image.dataset.remoteFallback !== 'true') {
                    image.dataset.remoteFallback = 'true';
                    if (current.includes('values.roflips.com')) {
                        image.src = 'https://growagarden.roflips.com/' + file;
                    } else {
                        image.src = 'https://values.roflips.com/' + (file.startsWith('/') ? file.slice(1) : file);
                    }
                    return;
                }

                image.src = placeholder;
            } catch (e) { }
        },
        localImage(src) {
            if (!src) return placeholder;
            try {
                if (/^https?:\/\//i.test(src)) {
                    return src;
                }
                const cleaned = src.startsWith('/') ? src.slice(1) : src;
                return `https://values.roflips.com/${cleaned}`;
            } catch (e) {
                return src;
            }
        },
        toggleSelect() {
            if(this.isSelected) {
                this.$store.commit('cashier_decrement_limited_data_selected', this.item);
            } else {
                this.$store.commit('cashier_increment_limited_data_selected', this.item);
            }
        },
        increment() {
            this.$store.commit('cashier_increment_limited_data_selected', this.item);
        },
        decrement() {
            this.$store.commit('cashier_decrement_limited_data_selected', this.item);
        }
    }
}
</script>

<style scoped>
.pet-value-item-vertical {
    width: 100%;
    height: 100%;
}
.pet-value-inner-vertical {
    display: flex;
    gap: 12px;
    height: 100%;
    min-height: 118px;
    padding: 13px;
    border-radius: 10px;
    align-items: center;
    background: linear-gradient(145deg, rgba(8, 34, 51, 0.96), rgba(3, 19, 31, 0.96));
    border: 1px solid rgba(46, 112, 143, 0.32);
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
}
.pet-value-inner-vertical:hover {
    transform: translateY(-2px);
    border-color: rgba(85, 215, 177, 0.6);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}
.pet-value-inner-vertical.selected {
    border-color: #55d7b1;
    box-shadow: 0 0 0 2px rgba(85, 215, 177, 0.16), 0 10px 24px rgba(0, 0, 0, 0.2);
}
.pet-value-left { flex: 0 0 92px; }
.pet-value-right { flex: 1 1 auto; display:flex; flex-direction:column; }
.pet-value-image { width:92px; height:92px; border-radius:9px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 35% 25%, rgba(54, 130, 184, 0.5), rgba(8, 36, 57, 0.8)); }
.pet-value-image img { width:100%; height:100%; object-fit:contain; }
.pet-value-name { font-weight:800; color:#e4f5fb; margin-bottom:7px; line-height:1.2; }
.pet-value-meta { display:flex; flex-wrap:wrap; gap:7px; color:#7e9db5; font-size:11px; align-items:center; font-family:'Open Sans', sans-serif; }
.pet-value-rarity { text-transform:uppercase; letter-spacing:.5px; }
.pet-value-amount { color:#8bffca; font-weight:700; }
.pet-value-available { margin-left:8px; color:#8bffca; font-weight:800; }
.pet-value-controls { margin-top:8px; display:inline-flex; align-items:center; gap:8px; }
.control { background:transparent; border:1px solid rgba(255,255,255,0.06); color:#fff; padding:4px 8px; border-radius:6px; cursor:pointer; }
.count { min-width:28px; text-align:center; color:#fff; font-weight:700; }
.pet-available { margin-top:8px; color:#8bffca; font-weight:700; }
.available-text { background: rgba(0,0,0,0.15); padding:4px 8px; border-radius:6px; }
</style>
.pet-value-rarity {
