<template>
    <div class="login-form">
        <base-alert v-if="errors" type="danger">
            <template v-for="error in errors">{{ error }}<br /></template>
        </base-alert>

        <form class="auth-login-form" @submit.prevent="login">
            <base-input 
                v-model="username" 
                name="username" 
                placeholder="Username" 
                autocomplete="username" />
                
            <base-input 
                v-model="password" 
                type="password"
                name="password" 
                placeholder="Password" 
                autocomplete="current-password"
                class="mt-1" />

            <div class="btn-group mt-2">
                <base-button 
                    :disabled="loading"
                    type="submit"
                    class="btn-primary">
                    <base-spinner v-if="loading" />
                    <template v-else>Login</template>
                </base-button>

                <base-button 
                    :disabled="loading" 
                    type="button"
                    @click="onRegisterClick"
                    class="btn btn-secondary">Register</base-button>
            </div>
        </form>

        <a href="#" @click="forgotPassword" class="link-secondary small mt-3 d-block">Forgot password?</a>
        <a v-if="settings.emailVerificationEnabled" href="#" @click="newVerifyEmail" class="link-secondary lh-1 mt-2 small d-block">Need a new verification email?</a>
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
    props: {
        onRegisterClick: {
            type: Function,
            required: false,
            default: () => {}
        }
    },
    data() {
        return {
            username: '',
            password: '',
            loading: false,
            errors: null,
            modalId: null
        }
    },
    methods: {
        login() {
            if(this.username === '') {
                this.errors = ['Please enter your username'];
                return;
            }

            if(this.password === '') {
                this.errors = ['Please enter your password'];
                return;
            }

            this.loading = true;
            this.errors = null;

            this.auth.login(this.username, this.password)
                .catch(error => {
                    const p = this.parseMessageBag(error.graphQLErrors);

                    if(p.hasValidationErrors) {
                        this.errors = p.getValidationErrorsList();
                    }
                    else {
                        this.errors = [error];
                    }
                })
                .finally(() => {
                    this.loading = false;
                    this.$router.push({ to:'/' });
                });
        },
        forgotPassword() {
            if(this.username === '') {
                this.error = 'Please enter your username';
                return;
            }

            this.loading = true;
            this.errors = null;

            this.auth.forgotPassword(this.username)
                .catch(error => {
                    const p = this.parseMessageBag(error.graphQLErrors);

                    if(p.hasValidationErrors) {
                        this.errors = p.getValidationErrorsList();
                    }
                    else {
                        this.errors = [error];
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        newVerifyEmail() {
            if(this.username === '') {
                this.error = 'Please enter your username';
                return;
            }

            this.loading = true;
            this.errors = null;

            this.auth.resendEmailVerification(this.username)
                .catch(error => {
                    const p = this.parseMessageBag(error.graphQLErrors);

                    if(p.hasValidationErrors) {
                        this.errors = p.getValidationErrorsList();
                    }
                    else {
                        this.errors = [error];
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
}
</script>

<style>
.login-form {
    padding: 8px;
}
</style>