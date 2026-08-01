<template>
    <div class="avatar-image">
        <img :src="avatarImageSrc" @error="avatarImageError()" alt="avatar" />
    </div>
</template>

<script>
    export default {
        name: 'AvatarImage',
        props: ['image'],
        data() {
            return {
                avatarImage: null,
                serverUrl: process.env.VUE_APP_BACKEND_URL,
            }
        },
        computed: {
            avatarImageSrc() {
                if(this.avatarImage !== null) {
                    return this.avatarImage;
                }
                return this.getAvatarSrc(this.image);
            }
        },
        methods: {
            avatarImageError() {
                this.avatarImage = "/public/img/avatar/1.webp";
            },
            getAvatarSrc(image) {
                if(image === undefined || image === null || image === '') {
                    return "/public/img/avatar/1.webp";
                }

                if(typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
                    return image;
                }

                return this.serverUrl + image;
            }
        },
        created() {
            this.avatarImage = this.getAvatarSrc(this.image);
        }
    }
</script>

<style scoped>
    .avatar-image {
        overflow: hidden;
        width: 100%;
        height: 100%; 
        border-radius: 100%;
    }

    .avatar-image img {
        width: 100% !important;
        height: 100% !important;
    }
</style>
