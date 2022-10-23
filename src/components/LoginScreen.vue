<template>
    <div class="wrapper">
        <div class="container container-tight py-6">
            <div class="text-center mb-4">
                <img svg-inline src="@static/images/shoutzor-logo.svg" class="logo">
            </div>
            <div class="card card-md">
                <div class="card-body">
                    <h2 class="mb-3 text-center">Login to your account</h2>

                    <template v-if="isAuthenticated">
                        <div class="text-center">
                            <base-alert type="danger" class="mb-2">You are not authorized to access the website
                            </base-alert>
                            <base-button class="mt-2" @click="$emit('logout')">Logout</base-button>
                        </div>
                    </template>

                    <login-form v-else></login-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import LoginForm from "@components/LoginForm.vue";

export default {
    name: 'login-screen',

    components: {
        BaseButton,
        BaseAlert,
        LoginForm
    },
    computed: {
        isAuthenticated() {
            return this.auth.isAuthenticated;
        }
    }
}
</script>

<style lang="scss">
.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .container {
        flex: none;
        height: initial;

        .logo {
            max-height: 6rem;
            fill: $white;
        }
    }
}
</style>