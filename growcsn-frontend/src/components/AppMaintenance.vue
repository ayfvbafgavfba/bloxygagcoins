<template>
    <div class="app-maintenance">
        <img src="@/assets/img/logo.webp" />
        <div class="maintenance-text">
            <span class="gradient-green">UNDER MAINTENANCE</span>
            Oops! We’re currently under maintenance and are working towards getting you back as soon as possible. Follow our socials to stay updated!
        </div>
        <div class="maintenance-socials">
            <a href="https://discord.gg/tgCMsajme" target="_blank">
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.28263 13.9361C10.4971 15.9711 14.9346 16.3675 19.9632 13.2C19.9264 13.2553 18.9316 14.7289 16.3158 15.4842C16.8685 16.2395 17.6237 17.1052 17.6237 17.1052C19.3001 17.1052 20.9396 16.6263 22.3579 15.7052C23.4632 14.9684 24.0895 13.6973 23.9605 12.371C23.7395 10.1052 23.2053 7.8947 22.3764 5.77632C21.3264 3.01318 18.8027 1.09737 15.8737 0.821036C15.6158 0.802607 15.4316 0.802607 15.3211 0.802607L15.0264 1.09732C18.3975 2.05522 20.0738 3.54732 20.1106 3.60261C14.9343 0.986794 8.81851 0.949989 3.60531 3.49208C3.60531 3.49208 5.26322 1.85261 8.92898 0.986794L8.70793 0.765747C8.32107 0.765747 7.95264 0.802606 7.56584 0.857841C4.85793 1.31836 2.59217 3.17889 1.61584 5.73941C0.768452 7.94993 0.215835 10.271 0.0132177 12.6289C-0.0973057 13.8815 0.492171 15.1157 1.52374 15.8342C2.88688 16.7368 4.50793 17.2157 6.14741 17.2157C6.14741 17.2157 6.81055 16.3499 7.47374 15.5763C4.98688 14.8394 3.97374 13.3657 3.95531 13.3105L4.42333 13.5494C4.70311 13.6924 4.98994 13.8219 5.28263 13.9361ZM8.17374 12.3342C6.97636 12.2973 6.03688 11.2842 6.07374 10.0684C6.1106 8.92627 7.03165 8.00522 8.17374 7.96836C9.37112 8.00522 10.3106 9.01836 10.2737 10.2342C10.2185 11.3763 9.31583 12.2974 8.17374 12.3342ZM15.6895 12.3342C14.4921 12.2973 13.5526 11.2842 13.5895 10.0684C13.6264 8.92627 14.5474 8.00522 15.6895 7.96836C16.8869 8.00522 17.8264 9.01836 17.7895 10.2342C17.7527 11.3763 16.8316 12.2974 15.6895 12.3342Z" />
                </svg>
            </a>
        </div>
        <div class="maintenance-bottom">
            <img src="@/assets/img/maintenance-1.png" />
            <img src="@/assets/img/maintenance-2.png" />
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppMaintenance'
    }
</script>

<style scoped>
    .app-maintenance {
        width: 100%;
        padding: 75px 250px 25px 175px;
        /* font-family: 'Rubik'; */
    }

    .app-maintenance img {
        width: 200px;
    }

    .app-maintenance .maintenance-text {
        width: 750px;
        display: flex;
        flex-direction: column;
        margin-top: 90px;
        font-size: 18px;
        font-weight: 300;
        color: #bbbfd0;
    }

    .app-maintenance .maintenance-text span {
        margin-bottom: 25px;
        font-size: 64px;
        font-weight: 900;
    }

    .app-maintenance .maintenance-socials {
        width: 750px;
        display: flex;
        align-items: center;
        margin-top: 30px;
        padding-top: 30px;
        border-top: 1px solid rgba(24, 72, 109, 0.5);
    }

    .app-maintenance .maintenance-socials a {
        width: 52px;
        height: 37px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 15px;
        background-color: #133552;
        clip-path: polygon(5px 0, calc(100% - 5px) 0, 100% 25%, 100% 75%, calc(100% - 5px) 100%, 5px 100%, 0 75%, 0 25%);
    }

    .app-maintenance .maintenance-socials a:last-of-type {
        margin-right: 0;
    }

    .app-maintenance .maintenance-socials a svg {
        fill: #2e71a8;
        transition: fill 0.3s ease;
    }

    .app-maintenance .maintenance-socials a:hover svg {
        fill: #ffffff;
    }

    .app-maintenance .maintenance-bottom {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 50px;
    }

    .app-maintenance .maintenance-bottom img:nth-child(1) {
        width: 550px;
    }

    .app-maintenance .maintenance-bottom img:nth-child(2) {
        width: 390px;
    }

    @media only screen and (max-width: 1600px) {

        .app-maintenance {
            width: 100%;
            padding: 75px 100px 25px 100px;
            /* font-family: 'Rubik'; */
        }

    }

    @media only screen and (max-width: 1400px) {

        .app-maintenance .maintenance-bottom img:nth-child(2) {
            display: none;
        }

    }

    @media only screen and (max-width: 950px) {

        .app-maintenance {
            padding: 75px 50px 25px 50px;
        }

        .app-maintenance .maintenance-text {
            width: 100%;
        }

        .app-maintenance .maintenance-text span {
            font-size: 50px;
        }

        .app-maintenance .maintenance-socials {
            width: 100%;
        }

        .app-maintenance .maintenance-bottom img:nth-child(1) {
            width: 400px;
        }

    }

    @media only screen and (max-width: 700px) {

        .app-maintenance {
            padding: 50px 50px 25px 50px;
        }

        .app-maintenance .maintenance-text {
            font-size: 16px;
        }

        .app-maintenance .maintenance-text span {
            font-size: 38px;
        }

    }

    @media only screen and (max-width: 550px) {

        .app-maintenance {
            padding: 50px 25px 25px 25px;
        }

        .app-maintenance img {
            width: 180px;
        }

        .app-maintenance .maintenance-text {
            font-size: 15px;
        }

        .app-maintenance .maintenance-text span {
            font-size: 34px;
        }

        .app-maintenance .maintenance-bottom img:nth-child(1) {
            width: 100%;
        }

    }

    @media only screen and (max-width: 450px) {

        .app-maintenance img {
            width: 150px;
        }

        .app-maintenance .maintenance-text {
            font-size: 13px;
        }

        .app-maintenance .maintenance-text span {
            margin-bottom: 15px;
            font-size: 28px;
        }

    }
</style>
