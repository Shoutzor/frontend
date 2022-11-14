<template>
    <div v-if="!hasLoaded" class="w-100 h-100 d-flex flex-grow-1 align-items-center justify-content-center">
        <load-screen message="Loading, please wait"/>
    </div>

    <verify-email-screen 
        v-else-if="verifyEmail"
        :id="verifyEmailOpts.id" 
        :hash="verifyEmailOpts.hash"
        :exp="verifyEmailOpts.exp"
        :sig="verifyEmailOpts.sig" />

    <reset-password-screen 
        v-else-if="resetPassword"
        :email="resetPasswordOpts.email" 
        :token="resetPasswordOpts.token" />

    <shoutzor v-else-if="can('website.access')" />
    <login-screen v-else />

    <div class="position-relative bottom-0 order-3">
        <the-modalmanager />
        <the-toastmanager />
    </div>
</template>

<script>
import LoadScreen from "@components/LoadScreen.vue";
import Shoutzor from "@js/views/Shoutzor.vue";
import LoginScreen from "@components/LoginScreen.vue";
import VerifyEmailScreen from "@components/VerifyEmailScreen.vue";
import ResetPasswordScreen from "@components/ResetPasswordScreen.vue";
import TheModalmanager from "@components/TheModalmanager.vue";
import TheToastmanager from "@components/TheToastmanager.vue";

export default {
    name: "App",
    components: {
        TheModalmanager,
        TheToastmanager,
        LoadScreen,
        LoginScreen,
        VerifyEmailScreen,
        ResetPasswordScreen,
        Shoutzor
    },
    data() {
        return {
            hasLoaded: false,
            verifyEmail: false,
            verifyEmailOpts: {
                id: null,
                hash: null,
                exp: null,
                sig: null
            },
            resetPassword: false,
            resetPasswordOpts: {
                email: null,
                token: null
            }
        };
    },
    /**
     * Checks if the URL contains the parameters to verify a user's email
     * will also set the options to pass along to the verification process component
     */
    created() {
        let urlParams = new URLSearchParams(window.location.search);

        if(this?.$route?.path === '/') {
            if(urlParams.get('action') === 'verify-email') {
                this.verifyEmailOpts = {
                    id: urlParams.get('id'),
                    hash: urlParams.get('hash'),
                    exp: urlParams.get('exp'),
                    sig: urlParams.get('sig')
                };

                this.verifyEmail = true;
            } 
            else if(urlParams.get('action') === 'reset-password') {
                this.resetPasswordOpts = {
                    email: urlParams.get('email'),
                    token: urlParams.get('token')
                };
                this.resetPassword = true;
            }
        }
    },
    mounted() {
        Promise.allSettled([
            this.auth.isInitializedPromise,
            this.settings.isInitializedPromise
        ]).then(() => {
            this.hasLoaded = true;
        });
    }
}
</script>
