<template>
    <div class="w-100 h-100 d-flex flex-grow-1 align-items-center justify-content-center">
        <load-screen v-if="loading" message="Verifying email, please wait"/>

        <div class="d-block" v-else>
            <shoutzor-logo alt="Shoutz0r logo" class="logo" />

            <div class="card mt-3">
                <div class="card-header">
                    <strong>Email verification result</strong>
                </div>
                <div class="card-body">
                    <base-alert
                        :type="success ? 'success' : 'danger'">
                    {{ result }}
                    </base-alert>

                    <a v-if="success" href="/" class="btn btn-outline-primary text-decoration-none">
                        Login
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { VERIFY_EMAIL_MUTATION } from "@graphql/auth.js";
import ShoutzorLogo from "@static/images/shoutzor-logo.svg?component";
import LoadScreen from "@components/LoadScreen.vue";
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";

export default {
    name: 'verify-email-screen',
    components: {
        ShoutzorLogo,
        LoadScreen,
        BaseButton,
        BaseAlert,
    },
    data() {
        return {
            loading: true,
            success: false,
            result: ''
        };
    },
    props: {
        id: {
            type: String,
            required: true
        },
        hash: {
            type: String,
            required: true
        },
        exp: {
            type: String,
            required: true
        },
        sig: {
            type: String,
            required: true
        }
    },
    mounted() {
        const { mutate: verifyEmailMutate } = useMutation(VERIFY_EMAIL_MUTATION, {
            fetchPolicy: 'no-cache'
        });

        // Verifies the email
        // `status` will respond with VERIFIED on success
        verifyEmailMutate({
            input: {
                id: this.id,
                hash: this.hash,
                expires: parseInt(this.exp, 10),
                signature: this.sig
            },
        }).then(result => {
            const status = result?.data?.verifyEmail?.status;
            if(status === 'VERIFIED') {
                this.success = true;
                this.result = 'Your email has been verified successfully';
            }
            else {
                this.success = false;
                this.result = 'Failed to verify your email: make sure the URL is correct, or request a new verification email.';
            }
        }).catch(error => {
            this.success = false;
            this.result = 'Failed to verify your email: make sure the URL is correct, or request a new verification email.';
        }).finally(() => {
            this.loading = false;
        });
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