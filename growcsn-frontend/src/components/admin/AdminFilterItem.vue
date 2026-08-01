<template>
    <div class="admin-filter-item" v-bind:class="{ 'item-open': adminDropdown === true }">
        <input v-model="adminSearch" v-on:focus="adminToggleDropdown()" type="text" placeholder="Add item..." />
        <div class="item-menu">
                <div class="menu-inner">
                <button v-for="(item, index) in adminGetItems" v-bind:key="index" v-on:click="adminSetButton(item)">
                    <img v-bind:src="localImage(item.image)" @error="onImgError($event)" />
                    <span>{{ item.name }}</span>
                    ({{ adminFormatValue(item.amountFixed) }})
                </button>
            </div>
        </div>
    </div>
  </template>

  <script>
    import { mapGetters } from 'vuex';
    import petValues from '@/assets/pet-values.json';

    export default {
        name: 'AdminFilterItem',
        data() {
            return {
                adminDropdown: false,
                adminSearch: ''
            }
        },
        computed: {
            ...mapGetters([
                'adminBoxList'
            ]),
            adminGetItems() {
                let items = [];
                const petItems = Array.isArray(petValues.items)
                    ? petValues.items.map((value) => ({
                        _id: value.slug || (value.variants && value.variants.length > 0 ? value.variants[0].id : value.name),
                        name: value.display_name || value.name,
                        image: value.image_url
                            ? value.image_url.startsWith('http')
                                ? value.image_url
                                : 'https://values.roflips.com' + (value.image_url.startsWith('/') ? '' : '/') + value.image_url
                            : '',
                        amountFixed: value.variants && value.variants.length > 0 ? Number(value.variants[0].tokens || 0) : Number(value.variant_tokens?.Normal || 0)
                    }))
                    : [];

                if(petItems.length > 0) {
                    items = petItems.filter((element) => element.name.toLowerCase().includes(this.adminSearch.toLowerCase().trim()) === true);
                }

                items.sort((a, b) => { return b.amountFixed - a.amountFixed; });
                return items;
            }
        },
        methods: {
            adminFormatValue(value) {
                return parseFloat(Math.floor(value / 10) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            adminToggleDropdown() {
                this.adminDropdown = !this.adminDropdown;
            },
            adminSetButton(item) {
                this.adminToggleDropdown();
                this.$emit('add-item', item);
            },
            localImage(src) {
                if (!src) return '';
                try {
                    const parts = src.split('/');
                    const file = parts[parts.length - 1];
                    // try public root first (copied files), then /img/items
                    return '/' + file;
                } catch (e) { return src; }
            },
            onImgError(event) {
                try {
                    const parts = event.target.src.split('/');
                    const file = parts[parts.length - 1];
                    event.target.src = '/img/items/' + file;
                } catch (e) { }
            }
        },
        created() {
            let self = this;
            document.addEventListener('click', function(event) {
                if(!self.$el.contains(event.target) && self.adminDropdown == true) {
                    self.adminToggleDropdown();
                }
            });
        }
    }
  </script>
  
  <style scoped>
    .admin-filter-item {
        width: 100%;
        position: relative;
        margin-top: 8px;
        z-index: 11;
    }

    .admin-filter-item input {
        width: 100%;
        height: 47px;
        padding: 0 20px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        background: rgba(19, 66, 88, 0.25);
    }

    .admin-filter-item input::placeholder {
        color: #49687d;
    }

    .admin-filter-item .item-menu {
        width: 100%;
        height: 0;
        position: absolute;
        top: 52px;
        left: 0;
        overflow: hidden;
        transition: height 0.2s ease;
    }
  
    .admin-filter-item.item-open .item-menu {
        height: 194px;
    }
  
    .admin-filter-item .menu-inner {
        width: 100%;
        height: 100%;
        padding: 3px;
        border-radius: 5px;
        overflow-x: scroll;
        background: #022038;
    }
  
    .admin-filter-item .menu-inner button {
        width: 100%;
        height: 47px;
        display: flex;
        align-items: center;
        padding: 0 14px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        transition: 0.3s ease;
    }
  
    .admin-filter-item .menu-inner button:hover {
        background: rgba(19, 66, 88, 0.15);
    }

    .admin-filter-item .menu-inner button img {
        width: 35px;
        height: 35px;
        margin-right: 10px;
    }

    .admin-filter-item .menu-inner button span {
        flex: 1;
        overflow: visible;
        white-space: normal;
        color: #8bacc8;
        word-break: break-word;
    }
  </style>