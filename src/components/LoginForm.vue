<template>
    <div class="login-form">
        <base-alert v-if="error" type="danger">{{ error }}</base-alert>

        <form class="auth-login-form mb-0" @submit.prevent="login">
            <base-input 
                v-model="username" 
                name="username" 
                placeholder="Username" 
                autocomplete="username" />
                
            <base-input 
                v-model="password" 
                name="password" 
                placeholder="Password" 
                autocomplete="current-password"
                class="mt-1" />

            <div class="btn-group mt-2">
                <base-button 
                    :disabled="loading" 
                    class="btn-primary">
                    <base-spinner v-if="loading" />
                    <template v-else>Login</template>
                </base-button>

                <base-button 
                    :disabled="loading" 
                    @click="openRegisterPopup"
                    class="btn btn-secondary">Register</base-button>
            </div>
        </form>
    </div>
</template>

<script>
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import BaseInput from "@components/BaseInput.vue";
import BaseSpinner from "@components/BaseSpinner.vue";

export default {
    name: 'login-form',
    components: {
        BaseSpinner,
        BaseButton,
        BaseInput,
        BaseAlert
    },
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            error: null
        }
    },
    methods: {
        login() {
            this.loading = true;
            this.error = null;

            this.auth.login(this.username, this.password)
                .catch(error => {
                    this.error = error;
                })
                .finally(() => {
                    this.loading = false;
                    this.$router.push({ to:'/' });
                })
        },
        openRegisterPopup() {

        }
    }
}
</script>

<style>
.login-form {
    padding: 8px;
}
</style>