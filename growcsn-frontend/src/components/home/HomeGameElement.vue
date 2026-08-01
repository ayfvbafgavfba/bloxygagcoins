<template>
    <router-link 
        v-bind:to="'/' + homeGetLink"
        class="home-game-element"
        v-bind:style="{ 'height': homeHeight + 'px' }"
        ref="gameLink"
    >
        <img v-bind:src="homeImage" />
    </router-link>
</template>

<script>
    export default {
        name: 'HomePlaceholderElement',
        props: [
            'game'
        ],
        data() {
            return {
                homeHeight: 170
            }
        },
        computed: {
            homeImage() {
                try {
                    return require('@/assets/img/games/backup/' + this.game + '.png');
                } catch (e) {
                    try {
                        return require('@/assets/img/games/backup/' + this.game + '.webp');
                    } catch (error) {
                        return require('@/assets/img/games/backup/placeholder.webp');
                    }
                }
            },
            homeGetLink() {
                let link = this.game;

                if(link === 'cases') { link = 'unbox'; }

                return link;
            }
        },
        methods: {
            homeSetHeight() {
                const ref = this.$refs.gameLink;
                const element = ref && ref.$el ? ref.$el : ref;
                if (!element) { return; }
                this.homeHeight = Number(element.getBoundingClientRect().width * 0.574324).toFixed(4);
            }
        },
        mounted() {
            window.addEventListener('resize', this.homeSetHeight);
            this.homeSetHeight();
        },
        destroyed() { 
            window.removeEventListener('resize', this.homeSetHeight); 
        }
    }
</script>

<style scoped>
    a.home-game-element {
        height: 150px;
        width: calc(25% - 18px);
        margin-top: 25px;
        margin-right: 24px;
        transition: transform 0.3s ease;
    }

    a.home-game-element:hover {
        transform: scale(1.03);
    }

    a.home-game-element:nth-child(1),
    a.home-game-element:nth-child(2),
    a.home-game-element:nth-child(3),
    a.home-game-element:nth-child(4) {
        margin-top: 0;
    }

    a.home-game-element:nth-child(4n) {
        margin-right: 0;
    }

    a.home-game-element img {
        width: 100%;
        height: 100%;
    }

    @media only screen and (max-width: 1050px) {

        a.home-game-element {
            width: calc(25% - 11.25px);
            margin-right: 15px;
        }

    }

    @media only screen and (max-width: 800px) {

        a.home-game-element {
            width: calc(50% - 7.5px);
            margin-top: 15px;
        }

        a.home-game-element:nth-child(3),
        a.home-game-element:nth-child(4) {
            margin-top: 15px;
        }

        a.home-game-element:nth-child(2n) {
            margin-right: 0;
        }
    }

    @media only screen and (max-width: 450px) {

        a.home-game-element {
            height: 95px;
        }

    }
</style>