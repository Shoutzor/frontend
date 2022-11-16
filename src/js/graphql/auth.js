 import gql from "graphql-tag";

export const REGISTER_MUTATION = gql`
    mutation register_mutation($input: RegisterInput!) {
        register(input: $input) {
            token
            status
        }
    }`;

export const VERIFY_EMAIL_MUTATION = gql`
    mutation verify_email_mutation($input: VerifyEmailInput!) {
        verifyEmail(input: $input) {
            status
        }
    }`;

export const RESEND_VERIFY_EMAIL_MUTATION = gql`
    mutation resend_verify_email_mutation($input: ResendEmailVerificationInput!) {
        resendEmailVerification(input: $input) {
            status
        }
    }`;

export const FORGOT_PASSWORD_MUTATION = gql`
    mutation forgot_password_mutation($input: ForgotPasswordInput!) {
        forgotPassword(input: $input) {
            status
            message
        }
    }`;

export const RESET_PASSWORD_MUTATION = gql`
    mutation reset_password_mutation($input: ResetPasswordInput!) {
        resetPassword(input: $input) {
            status
            message
        }
    }`;

export const LOGIN_MUTATION = gql`
    mutation login_mutation($input: LoginInput!) {
        login(input: $input) {
            token
        }
    }`;

export const LOGOUT_MUTATION = gql`
    mutation logout_mutation {
        logout {
            status
            message
        }
    }`;

export const WHOAMI_MUTATION = gql`
    mutation whoami_mutation {
        whoami {
            user {
                id
                username
                email
                is_admin
                permissions {
                    name
                }
                roles {
                    id
                    name
                    permissions {
                        id
                        name
                    }
                }
            }
        }
    }`;
