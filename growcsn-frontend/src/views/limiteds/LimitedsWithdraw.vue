<template>
    <div class="limiteds-withdraw">
        <transition name="fade" mode="out-in">
            <div v-if="cashierGetItems.length === 0" class="withdraw-empty" key="empty">No pets found.</div>
            <div v-else class="withdraw-list" key="data">
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
        name: 'LimitedsWithdraw',
        components: {
            PetValueItem
        },
        computed: {
            ...mapGetters([
                'cashierFilterSearch',
                'cashierFilterAmountMin',
                'cashierFilterAmountMax',
                'cashierFilterSort', 
                'cashierLimitedData',
                'generalSettings'
            ]),
            cashierGetItems() {
                if (!petValues || !Array.isArray(petValues.items)) {
                    return [];
                }

                const items = petValues.items.map((value) => {
                    const amount = value.variants && value.variants.length > 0
                        ? Number(value.variants[0].tokens || 0)
                        : Number(value.variant_tokens?.Normal || 0);

                    const image = value.image_url
                        ? value.image_url.startsWith('http')
                            ? value.image_url
                            : 'https://values.roflips.com' + (value.image_url.startsWith('/') ? '' : '/') + value.image_url
                        : '';

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

                // Only show items if admin has explicitly added allowedPets entries.
                if(!(this.generalSettings && Array.isArray(this.generalSettings.limited?.allowedPets) && this.generalSettings.limited.allowedPets.length > 0)) {
                    return [];
                }

                const allowed = this.generalSettings.limited.allowedPets;
                // pet unique id is `uniqueId` in this view
                filtered = filtered.filter((item) => allowed.includes(item.uniqueId));

                // attach admin-provided counts from settings (allowedPetCounts)
                const counts = (this.generalSettings.limited && this.generalSettings.limited.allowedPetCounts) || {};
                filtered = filtered.map((it) => ({ ...it, available: Number(counts[it.uniqueId] || 0) }));

                // Remove items with zero available stock so they don't appear in withdraw list
                filtered = filtered.filter((it) => Number(it.available) > 0);

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
    .limiteds-withdraw {
        width: 100%;
    }

    .limiteds-withdraw .withdraw-loading {
        width: 100%;
        height: 600px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .limiteds-withdraw .withdraw-loading.fade-leave-active {
        transition: opacity 0.5s;
    }

    .limiteds-withdraw .withdraw-loading.fade-leave-to {
        opacity: 0;
    }

    .limiteds-withdraw .withdraw-list {
        width: 100%;
    }

    .limiteds-withdraw .data-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 10px;
        padding: 2px 0;
        max-height: 720px;
        overflow: auto;
    }

    .limiteds-withdraw .withdraw-empty {
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

    .limiteds-withdraw .withdraw-list.fade-enter-active,
    .limiteds-withdraw .withdraw-empty.fade-enter-active {
        transition: opacity 0.5s;
    }

    .limiteds-withdraw .withdraw-list.fade-enter-from,
    .limiteds-withdraw .withdraw-empty.fade-enter-from {
        opacity: 0;
    }
</style>