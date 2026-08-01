<template>
    <div class="login-roblox">
        <div v-if="step === 'enter'" class="roblox-login">
            <div class="login-element">
                <div class="element-title">Roblox Username</div>
                <div class="element-input">
                    <input v-model="loginUsername" type="text" placeholder="ENTER YOUR ROBLOX USERNAME" />
                </div>
            </div>
            <div class="roblox-info">
                Enter your Roblox username. We'll show your avatar and ask you to confirm it's you.
            </div>
            <div class="roblox-buttons">
                <button v-on:click="startVerification" class="button-action" v-bind:disabled="authSendLoginLoading === true || loginUsername === null || loginUsername.trim() === ''">
                    <div class="button-inner">
                        <transition name="fade" mode="out-in">
                            <ButtonLoading v-if="authSendLoginLoading === true" />
                            <div v-else class="inner-content">VERIFY USER</div>
                        </transition>
                    </div>
                </button>
            </div>
        </div>

        <div v-else-if="step === 'confirm'" class="roblox-confirm">
            <div class="confirm-avatar">
                <div class="confirm-avatar-image" v-if="userAvatar">
                    <img v-bind:src="userAvatar" alt="Roblox avatar" />
                </div>
                <div class="confirm-name">Is this you?</div>
                <div class="confirm-username">{{ verifiedUsername }}</div>
            </div>
            <div class="roblox-info">
                Place the code below in your Roblox profile bio, then click VERIFY.
            </div>
            <div class="roblox-code">
                <span>{{ verificationCode }}</span>
            </div>
            <div class="roblox-buttons">
                <button v-on:click="verifyBio" class="button-action" v-bind:disabled="authSendLoginLoading === true || verificationCode === null">
                    <div class="button-inner">
                        <transition name="fade" mode="out-in">
                            <ButtonLoading v-if="authSendLoginLoading === true" />
                            <div v-else class="inner-content">VERIFY BIO</div>
                        </transition>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import ButtonLoading from '@/components/ButtonLoading';

    export default {
        name: 'LoginRoblox',
        components: {
            ButtonLoading
        },
        data() {
            return {
                loginUsername: null,
                verifiedUsername: null,
                userAvatar: null,
                verificationCode: null,
                step: 'enter'
            }
        },
        methods: {
            ...mapActions([
                'modalsSetShow',
                'authSendRobloxVerifyStart',
                'authSendRobloxVerifyBio'
            ]),
            async startVerification() {
                if(this.loginUsername === null || this.loginUsername.trim() === '') {
                    return;
                }

                const data = { username: this.loginUsername.trim() };
                const res = await this.authSendRobloxVerifyStart(data);
                if(res !== undefined && res.success === true) {
                    this.verifiedUsername = res.username;
                    this.userAvatar = res.avatar;
                    this.verificationCode = res.code;
                    this.step = 'confirm';
                }
            },
            async verifyBio() {
                if(this.verificationCode === null) {
                    return;
                }

                const data = { username: this.verifiedUsername, code: this.verificationCode };
                const res = await this.authSendRobloxVerifyBio(data);
                if(res !== undefined && res.success === true) {
                    this.modalsSetShow(null);
                }
            }
        },
        computed: {
            ...mapGetters([
                'authSendLoginLoading'
            ])
        }
    }
</script>

<style scoped>
    .login-roblox {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .roblox-login,
    .roblox-confirm {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .login-element,
    .roblox-info,
    .roblox-buttons {
        width: 100%;
        margin-top: 35px;
    }

    .element-title {
        font-size: 14px;
        font-weight: 800;
        color: #bbbfd0;
    }

    .element-input {
        width: 100%;
        height: 78px;
        position: relative;
        margin-top: 20px;
        padding: 1px;
        filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
    }

    .element-input::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(180deg, #04131f 0%, #223a4e 100%);
        clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 25%, 100% 75%, calc(100% - 16px) 100%, 16px 100%, 0 75%, 0 25%);
    }

    .element-input input {
        width: 100%;
        height: 100%;
        padding: 0 25px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        background-color: #072435;
        clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 25%, 100% 75%, calc(100% - 16px) 100%, 16px 100%, 0 75%, 0 25%);
    }

    .element-input input::placeholder {
        color: #5e768e;
    }

    .roblox-info {
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        color: #627382;
    }

    .confirm-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
    }

    .confirm-avatar-image {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid rgba(0, 255, 194, 0.6);
        box-shadow: 0 0 0 2px rgba(2, 27, 40, 0.75), 0 20px 60px rgba(0, 255, 194, 0.12);
        background: linear-gradient(180deg, rgba(0, 255, 194, 0.16), rgba(0, 255, 194, 0.03));
    }

    .confirm-avatar-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .confirm-avatar img {
        display: none;
    }

    .confirm-name {
        font-size: 18px;
        font-weight: 900;
        color: #ffffff;
    }

    .confirm-username {
        font-size: 16px;
        font-weight: 700;
        color: #00ffc2;
    }

    .roblox-code {
        width: 100%;
        margin-top: 20px;
        padding: 20px;
        text-align: center;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.25em;
        color: #ffffff;
        background: #03181f;
        border: 1px solid rgba(0, 255, 194, 0.15);
        border-radius: 18px;
    }

    .roblox-buttons button {
        width: 100%;
        height: 54px;
        margin-top: 35px;
    }

    .button-action .button-inner {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        background: #1a4f63;
        clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 25%, 100% 75%, calc(100% - 11px) 100%, 11px 100%, 0 75%, 0 25%);
    }

<style scoped>
    .login-roblox {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .roblox-login {
        width: 100%;
    }

    .login-roblox .roblox-twostep,
    .login-roblox .roblox-cookie,
    .login-roblox .login-element {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .login-roblox .login-element {
        margin-top: 35px;
    }

    .login-roblox .login-element:first-child {
        margin-top: 0;
    }

    .login-roblox .twostep-title,
    .login-roblox .cookie-title,
    .login-roblox .element-title {
        font-size: 14px;
        font-weight: 800;
        color: #bbbfd0;
    }

    .login-roblox .twostep-input,
    .login-roblox .cookie-input,
    .login-roblox .element-input {
        width: 100%;
        height: 78px;
        position: relative;
        margin-top: 20px;
        padding: 1px;
        filter: drop-shadow(0px 4px 25px rgba(15, 41, 63, 0.35));
    }

    .login-roblox .twostep-input:before,
    .login-roblox .cookie-input:before,
    .login-roblox .element-input:before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: linear-gradient(180deg, #04131f 0%, #223a4e 100%);
        clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 25%, 100% 75%, calc(100% - 16px) 100%, 16px 100%, 0 75%, 0 25%);
    }

    .login-roblox .twostep-input input,
    .login-roblox .cookie-input input,
    .login-roblox .element-input input {
        width: 100%;
        height: 100%;
        padding: 0 115px 0 25px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        background-color: #072435;
        clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 25%, 100% 75%, calc(100% - 16px) 100%, 16px 100%, 0 75%, 0 25%);
    }

    .login-roblox .twostep-input input::placeholder,
    .login-roblox .cookie-input input::placeholder,
    .login-roblox .element-input input::placeholder {
        color: #5e768e;
    }

    .login-roblox .roblox-info {
        width: 100%;
        margin-top: 35px;
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        color: #49687d;
    }

    .login-roblox .roblox-info button.button-terms {
        text-decoration: underline;
        font-size: 14px;
        font-weight: 700;
        color: #db7d48;
    }

    .login-roblox .roblox-buttons {
        display: flex;
        align-items: center;
        margin-top: 35px;
    }

    .login-roblox button.button-toggle {
        width: 200px;
        height: 54px;
        position: relative;
        margin-right: 20px;
        padding: 1px;
        filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.35));
        transition: filter 0.3s ease;
        z-index: 1;
        transition: all .2s;
    }
    .login-roblox button.button-toggle:hover {
        transition-duration: .2s; 
        opacity: .8;
    }
    .login-roblox button.button-toggle:active {
        transition-duration: .2s;
        scale: .9;
    }

    .login-roblox button.button-toggle.button-active {
        filter: drop-shadow(0px 4px 25px rgba(1, 230, 169, 0.15)) 
                drop-shadow(0px 2px 25px rgba(15, 41, 63, 0.35));
    }

    .login-roblox button.button-action {
        width: 180px;
        height: 54px;
        position: relative;
        filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.35)) drop-shadow(0px 4px 25px rgba(1, 230, 169, 0.15));
        transition: all .2s;
    }
    .login-roblox button.button-action:hover {
        transition-duration: .2s; 
        opacity: .8;
    }
    .login-roblox button.button-action:active {
        transition-duration: .2s;
        scale: .9;
    }

    .login-roblox button.button-toggle::before {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #1a4f63;
        clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 25%, 100% 75%, calc(100% - 11px) 100%, 11px 100%, 0 75%, 0 25%);
        z-index: -1;
    }

    .login-roblox button.button-toggle.button-active::before {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #01e0a3 100%);
    }

    .login-roblox button.button-toggle::after {
        content: '';
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        position: absolute;
        top: 1px;
        left: 1px;
        background-color: #07243a;
        clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 25%, 100% 75%, calc(100% - 11px) 100%, 11px 100%, 0 75%, 0 25%);
        z-index: -1;
    }

    .login-roblox button.button-toggle .button-inner,
    .login-roblox button.button-action .button-inner {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 800;
        clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 25%, 100% 75%, calc(100% - 11px) 100%, 11px 100%, 0 75%, 0 25%);
    }

    .login-roblox button.button-toggle .button-inner {
        color: #bbbfd0;
        background-color: #1a4f63;
    }

    .login-roblox button.button-toggle.button-active .button-inner {
        color: #00ffc2;
        background: radial-gradient(60% 60% at 50% 50%, rgba(0, 255, 194, 0.2) 0%, rgba(0, 0, 0, 0) 100%), 
                    linear-gradient(255deg, rgba(0, 255, 194, 0.05) 0%, rgba(0, 170, 109, 0.05) 100%);
    }

    .login-roblox button.button-action .button-inner {
        color: #ffffff;
        background: linear-gradient(250deg, #00ffc2 0%, #00aa6d 100%);
    }

    @media only screen and (max-width: 430px) {

        .login-roblox .roblox-buttons {
            width: 100%;
            flex-direction: column;
        }

        .login-roblox button.button-toggle,
        .login-roblox button.button-action {
            width: 100%;
        }

        .login-roblox button.button-toggle {
            margin-bottom: 10px;
            margin-right: 0;
        }

    }
</style>