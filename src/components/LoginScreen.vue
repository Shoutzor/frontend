<template>
    <div class="h-100 w-100 d-flex flex-grow-1 align-items-center text-center">
        <div class="py-6 mx-auto">
            <div class="text-center mb-4">
                <shoutzor-logo class="logo" />
            </div>
            <div class="card card-md">
                <div class="card-body">
                    <template v-if="isAuthenticated">
                        <div class="text-center">
                            <base-alert 
                                type="danger" 
                                class="mb-2">
                                You are not authorized to access the website
                            </base-alert>

                            <base-button 
                                :disabled="loading" 
                                class="mt-2" 
                                @click="logout">
                                Logout
                            </base-button>
                        </div>
                    </template>
                    <template v-else>
                        <h2 class="mb-3 text-center">Login to your account</h2>
                        <login-form />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ShoutzorLogo from "@static/images/shoutzor-logo.svg?component";
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import LoginForm from "@components/LoginForm.vue";

export default {
    name: 'login-screen',
    components: {
        ShoutzorLogo,
        BaseButton,
        BaseAlert,
        LoginForm
    },
    data() {
        return {
            loading: false
        };
    },
    computed: {
        isAuthenticated() {
            return this.auth.isAuthenticated;
        }
    },
    methods: {
        logout() {
            this.loading = true;

            this.auth.logout()
                .finally(() => {
                    this.loading = false;
                });
        }
    }
}
</script>

<style lang="scss" scoped>
.logo {
    max-height: 6rem;
    width: auto;
    fill: $white;
}
</style>