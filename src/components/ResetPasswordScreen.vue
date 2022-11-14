<template>
    <div class="w-100 h-100 d-flex flex-grow-1 align-items-center justify-content-center">
        <load-screen v-if="loading" message="Verifying email, please wait"/>

        <div class="d-block" v-else>
            <shoutzor-logo alt="Shoutz0r logo" class="logo" />

            <div class="card mt-3">
                <div class="card-header">
                    <strong>Reset Password</strong>
                </div>
                <div class="card-body">
                    <base-alert
                        v-if="result"
                        :type="success ? 'success' : 'danger'">
                    {{ result }}
                    </base-alert>

                    <a v-if="success" href="/" class="btn btn-outline-primary text-decoration-none">
                        Login
                    </a>

                    <form v-else class="auth-reset-password-form" @submit.prevent="resetPassword">
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

                        <base-button 
                            :disabled="loading"
                            type="submit"
                            class="btn-primary mt-2">
                            <base-spinner v-if="loading" />
                            <template v-else>Save password</template>
                        </base-button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { RESET_PASSWORD_MUTATION } from "@graphql/auth.js";
import ShoutzorLogo from "@static/images/shoutzor-logo.svg?component";
import LoadScreen from "@components/LoadScreen.vue";
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import FormitemInput from "@components/FormitemInput.vue";

export default {
    name: 'reset-password-screen',
    components: {
        ShoutzorLogo,
        LoadScreen,
        BaseButton,
        BaseAlert,
        FormitemInput
    },
    data() {
        return {
            loading: false,
            success: false,
            result: '',
            password: '',
            passwordConfirm: ''
        };
    },
    props: {
        email: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    },
    mounted() {  
    },
    methods: {
        resetPassword() {
            this.loading = true;

            const { mutate: resetPasswordMutate } = useMutation(RESET_PASSWORD_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            // Verifies the email
            // `status` will respond with VERIFIED on success
            resetPasswordMutate({
                input: {
                    email: this.email,
                    token: this.token,
                    password: this.password,
                    password_confirmation: this.passwordConfirm
                },
            }).then(result => {
                const status = result?.data?.resetPassword?.status;
                if(status === 'PASSWORD_RESET') {
                    this.success = true;
                    this.result = 'Your password has been reset';
                }
                else {
                    this.success = false;
                    this.result = 'An error occured while resetting your password; received an unknown response from the server';
                }
            }).catch(error => {
                this.success = false;
                this.result = 'Failed to reset your password: make sure the URL is correct, or request a new password reset email.';
            }).finally(() => {
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