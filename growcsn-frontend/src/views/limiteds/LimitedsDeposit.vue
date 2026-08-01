<template>
    <div class="limiteds-deposit">
        <transition name="fade" mode="out-in">
            <div v-if="cashierGetItems.length === 0" class="deposit-empty" key="empty">No pets found.</div>
            <div v-else class="deposit-list" key="data">
                <div class="data-list">
                    <PetValueItem v-for="item in cashierGetItems" :key="item.uniqueId" :item="item" />
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import PetValueItem from '@/components/cashier/PetValueItem';
    import petValues from '@/assets/pet-values.json';

    export default {
        name: 'LimitedsDeposit',
        components: {
            PetValueItem
        },
        computed: {
            ...mapGetters([
                'cashierFilterSearch',
                'cashierFilterAmountMin',
                'cashierFilterAmountMax',
                'cashierFilterSort', 
                'cashierLimitedData'
            ]),
            cashierGetItems() {
                if (!petValues || !Array.isArray(petValues.items)) {
                    return [];
                }

                const items = petValues.items.map((value) => {
                    const amount = value.variants && value.variants.length > 0
                        ? Number(value.variants[0].tokens || 0)
                        : Number(value.variant_tokens?.Normal || 0);

                    const image = (() => {
                        if (!value.image_url) return '';
                        const raw = String(value.image_url).trim();
                        if (!raw) return '';
                        if (/^https?:\/\//i.test(raw)) {
                            const file = raw.split('/').pop().split('?')[0];
                            return file ? `/${file}` : '';
                        }
                        return raw.startsWith('/') ? raw : `/${raw}`;
                    })();

                    return {
                        uniqueId: value.slug || (value.variants && value.variants.length > 0 ? value.variants[0].id : value.name),
                        name: value.display_name || value.name,
                        amount: amount,
                        image: image,
                        category: value.category || null,
                        rarity: value.rarity || null,
                        variant: value.variants && value.variants.length > 0 ? value.variants[0].variant : 'Normal'
                    };
                });

                let filtered = items.filter((item) => item.name.toLowerCase().includes(this.cashierFilterSearch.toLowerCase().trim()));

                if (this.cashierFilterSort === 'Highest') {
                    filtered.sort((a, b) => b.amount - a.amount);
                } else {
                    filtered.sort((a, b) => a.amount - b.amount);
                }

                if (this.cashierFilterAmountMin.trim() !== '' && isNaN(this.cashierFilterAmountMin) !== true) {
                    filtered = filtered.filter((item) => item.amount >= Math.floor(this.cashierFilterAmountMin * 1000));
                }

                if (this.cashierFilterAmountMax.trim() !== '' && isNaN(this.cashierFilterAmountMax) !== true) {
                    filtered = filtered.filter((item) => item.amount <= Math.floor(this.cashierFilterAmountMax * 1000));
                }

                return filtered;
            }
        }
    }
</script>

<style scoped>
    .limiteds-deposit {
        width: 100%;
    }

    .limiteds-deposit .deposit-loading {
        width: 100%;
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .limiteds-deposit .deposit-loading.fade-leave-active {
        transition: opacity 0.5s;
    }

    .limiteds-deposit .deposit-loading.fade-leave-to {
        opacity: 0;
    }

    .limiteds-deposit .deposit-list {
        width: 100%;
    }

    .limiteds-deposit .data-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 10px;
        align-items: stretch;
    }

    .limiteds-deposit .deposit-empty {
        width: 100%;
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        font-size: 12px;
        font-weight: 600;
        color: #5e768e;
    }

    .limiteds-deposit .deposit-list.fade-enter-active,
    .limiteds-deposit .deposit-empty.fade-enter-active {
        transition: opacity 0.5s;
    }

    .limiteds-deposit .deposit-list.fade-enter-from,
    .limiteds-deposit .deposit-empty.fade-enter-from {
        opacity: 0;
    }
</style>