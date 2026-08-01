<template>
    <div class="admin-allowed-pets">
        <div class="section-title">PET ACCESS CONTROL</div>
        <div class="debug-panel">
            <div class="debug-row"><strong>Whitelist:</strong> <span>{{ JSON.stringify(generalSettings?.limited?.allowedPets || []) }}</span></div>
            <div class="debug-row"><strong>Counts:</strong> <span>{{ JSON.stringify(generalSettings?.limited?.allowedPetCounts || {}) }}</span></div>
        </div>
        <div class="pets-search">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7204 9.43396H10.0429L9.80274 9.2024C10.6432 8.2247 11.1492 6.9554 11.1492 5.57461C11.1492 2.49571 8.65352 0 5.57461 0C2.49571 0 0 2.49571 0 5.57461C0 8.65352 2.49571 11.1492 5.57461 11.1492C6.9554 11.1492 8.2247 10.6432 9.2024 9.80274L9.43396 10.0429V10.7204L13.7221 15L15 13.7221L10.7204 9.43396ZM5.57461 9.43396C3.43911 9.43396 1.71527 7.71012 1.71527 5.57461C1.71527 3.43911 3.43911 1.71527 5.57461 1.71527C7.71012 1.71527 9.43396 3.43911 9.43396 5.57461C9.43396 7.71012 7.71012 9.43396 5.57461 9.43396Z" />
            </svg>
            <input v-model="search" type="search" placeholder="Search pets..." aria-label="Search pets" />
        </div>
        <div class="pets-list">
            <div v-if="loading" class="loading">Loading...</div>
            <div v-else>
                <div v-if="filteredItems.length === 0" class="empty-list">
                    No pets configured. Only admins can add pets.
                    <div class="empty-action"><button class="show-all-btn" @click="showAll = true">Show all pets</button></div>
                </div>
                <div v-else>
                    <div v-for="item in filteredItems" :key="item._id" class="pet-row">
                        <div class="pet-left">
                            <img :src="localImage(item.image)" v-if="item.image" @error="onImageError" />
                        </div>
                        <div class="pet-center">
                            <div class="pet-name">{{ item.name }}</div>
                            <div class="pet-meta">Value: {{ formatValue(item.amountFixed) }}</div>
                        </div>
                        <div class="pet-right">
                            <div class="count-controls">
                                <button class="count-btn" @click="decrement(item._id)">-</button>
                                <div class="count-display">{{ getCount(item._id) }}</div>
                                <button class="count-btn" @click="increment(item._id)">+</button>
                            </div>
                            <label class="switch">
                                <input type="checkbox" :checked="isAllowed(item._id)" @change="toggle(item._id, $event.target.checked)" />
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import placeholder from '@/assets/img/anon.png';

export default {
    name: 'AdminAllowedPets',
    data() {
        return {
            items: [],
            loading: true,
            counts: {},
            showAll: false,
            search: ''
        }
    },
    computed: {
        ...mapGetters(['adminBoxList', 'generalSettings']),
        filteredItems() {
            const allowed = Array.isArray(this.generalSettings?.limited?.allowedPets) ? this.generalSettings.limited.allowedPets.slice() : [];
            if(allowed.length === 0 && this.showAll === false) {
                return [];
            }

            const source = this.showAll === true ? this.items : this.items.filter(i => allowed.includes(i._id));
            const search = this.search.trim().toLowerCase();

            return search === '' ? source : source.filter(item => item.name.toLowerCase().includes(search));
        }
    },
    methods: {
        ...mapActions(['adminGetBoxListSocket', 'adminSendSettingValueSocket', 'notificationShow']),
        async load() {
            this.loading = true;
            const data = { page: 1, search: '' };
            await this.adminGetBoxListSocket(data);
            this.items = (this.adminBoxList.items || []).slice();
            this.counts = Object.assign({}, this.generalSettings?.limited?.allowedPetCounts || {});
            this.loading = false;
        },
        localImage(src) {
            if(!src) return placeholder;
            try {
                const parts = src.split('/');
                const file = parts[parts.length - 1];
                return 'https://growagarden.roflips.com/' + file;
            } catch (e) { return src; }
        },
        onImageError(event) {
            if (event.target.dataset.fallback === 'true') {
                event.target.src = placeholder;
                return;
            }

            event.target.dataset.fallback = 'true';
            const file = event.target.src.split('/').pop().split('?')[0];
            event.target.src = '/img/items/' + file + '?v=2';
        },
        formatValue(v) {
            const amount = Number(v) || 0;
            if (amount >= 1000000) {
                return (amount / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
            }
            if (amount >= 1000) {
                return (amount / 1000).toFixed(2).replace(/\.?0+$/, '') + 'K';
            }
            return amount.toLocaleString();
        },
        isAllowed(id) {
            return Array.isArray(this.generalSettings?.limited?.allowedPets) && this.generalSettings.limited.allowedPets.includes(id);
        },
        async toggle(id, checked) {
            try {
                const current = Array.isArray(this.generalSettings?.limited?.allowedPets) ? this.generalSettings.limited.allowedPets.slice() : [];
                if(checked) {
                    if(!current.includes(id)) current.push(id);
                } else {
                    const idx = current.indexOf(id);
                    if(idx !== -1) current.splice(idx, 1);
                }

                await this.adminSendSettingValueSocket({ setting: 'limited.allowedPets', value: current });
                this.notificationShow({ type: 'success', message: 'Updated allowed pets.' });
            } catch (err) {
                this.notificationShow({ type: 'error', message: err.message });
            }
        },
        getCount(id) {
            if(this.counts && this.counts[id] !== undefined) return Number(this.counts[id]);
            if(this.generalSettings && this.generalSettings.limited && this.generalSettings.limited.allowedPetCounts) {
                return Number(this.generalSettings.limited.allowedPetCounts[id] || 0);
            }
            return 0;
        },
        async setCount(id, newCount) {
            try {
                const current = Object.assign({}, this.generalSettings?.limited?.allowedPetCounts || {});
                if(newCount <= 0) {
                    delete current[id];
                } else {
                    current[id] = Number(newCount);
                }

                // Optimistically update local counts for immediate UI feedback
                this.$set(this.counts, id, current[id] || 0);

                await this.adminSendSettingValueSocket({ setting: 'limited.allowedPetCounts', value: current });
                this.notificationShow({ type: 'success', message: 'Updated allowed pet count.' });
            } catch (err) {
                this.notificationShow({ type: 'error', message: err.message });
            }
        },
        increment(id) {
            const cur = this.getCount(id);
            this.setCount(id, cur + 1);
        },
        decrement(id) {
            const cur = this.getCount(id);
            if(cur <= 0) return;
            this.setCount(id, cur - 1);
        },
    },
    created() {
        this.load();
    }

    ,
    watch: {
        generalSettings: {
            handler(v) {
                this.counts = Object.assign({}, v?.limited?.allowedPetCounts || {});
            },
            deep: true
        }
    }
}
</script>

<style scoped>
.admin-allowed-pets { margin-top: 16px; }
.section-title { color: #55d7b1; font-family: 'Open Sans', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 1.6px; }
.pets-list { max-height: 560px; overflow: auto; margin-top: 14px; padding-right: 8px; }
.pet-row { display:flex; align-items:center; min-height:112px; padding:14px 16px; border:1px solid rgba(51, 116, 145, 0.28); border-radius:10px; background: linear-gradient(135deg, rgba(7, 37, 56, 0.88), rgba(3, 23, 38, 0.88)); margin-bottom:10px; transition: border-color .2s, transform .2s, background .2s; }
.pet-row:hover { border-color: rgba(85, 215, 177, 0.5); background: linear-gradient(135deg, rgba(9, 47, 67, 0.96), rgba(3, 27, 43, 0.96)); transform: translateY(-1px); }
.pet-left { flex: 0 0 84px; }
.pet-left img { width:84px; height:84px; border-radius:9px; object-fit:contain; background: radial-gradient(circle at 35% 25%, rgba(54, 130, 184, 0.45), rgba(8, 36, 57, 0.8)); }
.pet-center { flex:1; padding-left:18px; min-width: 0; }
.pet-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:800; color:#e5f6fb; font-size:17px; }
.pet-meta { font-family:'Open Sans', sans-serif; font-size:12px; color:#8eafc3; margin-top:7px; }
.pet-right { width:220px; display:flex; justify-content:flex-end; align-items:center; gap:14px; }
.count-controls { display:flex; align-items:center; margin-right:8px; }
.count-btn, .show-all-btn { border:1px solid rgba(68, 145, 181, 0.25); background:#0c3351; color:#d8f4fa; cursor:pointer; font-weight:800; transition: background .2s, border-color .2s, transform .2s; }
.count-btn { width:36px; height:36px; border-radius:8px; font-size:18px; }
.count-btn:hover, .show-all-btn:hover { background:#145176; border-color:rgba(85, 215, 177, 0.65); transform:translateY(-1px); }
.count-display { width:42px; text-align:center; color:#dff8f8; font-weight:800; margin:0 6px; font-size:15px; }
.show-all-btn { min-width:140px; min-height:38px; padding:0 16px; border-radius:8px; font-family:'Open Sans', sans-serif; font-size:12px; }
/* simple toggle */
.switch { position: relative; display: inline-block; width:56px; height:30px; flex:0 0 auto; }
.switch input { opacity:0; width:0; height:0; }
.slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#ccc; transition:.2s; border-radius:30px; }
.slider:before { position:absolute; content:''; height:22px; width:22px; left:4px; bottom:4px; background:white; transition:.2s; border-radius:50%; }
.switch input:checked + .slider { background: #00cfa1; }
.switch input:checked + .slider:before { transform: translateX(28px); }

@media (max-width: 720px) {
    .modal-admin-allowed-pets { padding: 12px 12px; }
    .pets-list { max-height: 70vh; }
    .pet-left img { width:64px; height:64px; }
    .pet-name { font-size:16px; }
    .pet-right { width: auto; gap:8px; }
    .count-btn { width:34px; height:34px; font-size:16px; }
    .count-display { width:38px; font-size:15px; }
    .switch { width:46px; height:26px; }
    .slider:before { height:20px; width:20px; left:3px; bottom:3px; }
}

@media (max-width: 420px) {
    .pet-row { flex-direction: row; }
    .pet-right { display:flex; gap:8px; }
    .pet-center { padding-left:12px; }
}

.empty-list { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:190px; padding:28px 20px; text-align:center; color:#b9d4df; background:linear-gradient(145deg, rgba(5, 31, 48, 0.7), rgba(3, 20, 34, 0.45)); border:1px dashed rgba(73, 139, 165, 0.35); border-radius:10px; font-family:'Open Sans', sans-serif; font-size:13px; }
.empty-action { margin-top:18px; }
.debug-panel { display:grid; gap:7px; margin:10px 0 0; padding:11px 13px; font-family:'Open Sans', sans-serif; font-size:11px; color:#9ebdca; background:rgba(2, 20, 33, 0.38); border:1px solid rgba(48, 107, 136, 0.2); border-radius:8px; }
.debug-panel .debug-row { display:flex; gap:8px; min-width:0; line-height:1.4; }
.debug-panel strong { flex:0 0 auto; color:#8fe0c8; font-weight:800; }
.debug-panel span { overflow-wrap:anywhere; }
.pets-search { position:relative; margin-top:12px; }
.pets-search input { width:100%; height:42px; padding:0 14px 0 40px; border:1px solid rgba(51, 116, 145, 0.35); border-radius:8px; outline:none; background:#06243a; color:#e5f6fb; font-family:'Open Sans', sans-serif; font-size:12px; transition:border-color .2s, box-shadow .2s; }
.pets-search input::placeholder { color:#668ba3; }
.pets-search input:focus { border-color:#55d7b1; box-shadow:0 0 0 3px rgba(85, 215, 177, 0.1); }
.pets-search svg { position:absolute; top:50%; left:14px; z-index:1; transform:translateY(-50%); fill:#6f9bb4; pointer-events:none; }
</style>
