<template>
    <div class="login-form">
        <base-alert v-if="error" type="danger">{{ error }}</base-alert>

        <form class="auth-register-form" @submit.prevent="register">
            <formitem-input 
                v-model="username" 
                :show-label="false"
                name="username" 
                placeholder="Username" 
                autocomplete="username"
                class="mb-1" />

            <formitem-input 
                v-model="email" 
                :show-label="false"
                name="email" 
                placeholder="Email" 
                autocomplete="email"
                class="mb-1" />

            <formitem-input 
                v-model="password" 
                :show-label="false"
                type="password"
                name="password" 
                placeholder="Password"
                class="mb-1" />

            <formitem-input 
                v-model="passwordConfirm" 
                :show-label="false"
                type="password"
                name="passwordConfirm" 
                placeholder="Confirm Password" />

            <div class="btn-group mt-2">
                <base-button 
                    :disabled="loading"
                    type="submit"
                    class="btn-primary">
                    <base-spinner v-if="loading" />
                    <template v-else>Register</template>
                </base-button>

                <base-button 
                    v-if="showLoginButton"
                    :disabled="loading" 
                    type="button"
                    @click="onLoginClick"
                    class="btn btn-secondary">Login</base-button>
            </div>
        </form>
    </div>
</template>

<script>
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemInput from "@components/FormitemInput.vue";

export default {
    name: 'register-form',
    components: {
        BaseSpinner,
        BaseButton,
        BaseAlert,
        FormitemInput
    },
    props: {
        onLoginClick: {
            type: Function,
            required: false,
            default: () => {}
        },
        showLoginButton: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data() {
        return {
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            loading: false,
            error: null,
            modalId: null
        }
    },
    methods: {
        register() {
            this.loading = true;
            this.error = null;

            this.auth.register(this.username, this.email, this.password, this.passwordConfirm)
                .then((result) => {
                    if(result === true) {
                        this.$router.push({ to: '/' });
                    } else {
                        this.onLoginClick();
                    }
                })
                .catch(error => {
                    this.error = error;
                })
                .finally(() => {
                    this.loading = false;                    
                })
        }
    }
}
</script>

<style>
.login-form {
    padding: 8px;
}
</style>