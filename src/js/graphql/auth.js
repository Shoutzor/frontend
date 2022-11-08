 import gql from "graphql-tag";

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

export const GUEST_PERMISSIONS_QUERY = gql`
    query guest_permissions_query {
        role(name: "guest") {
            permissions {
                name
            }
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
                allPermissions {
                    name
                }
            }
        }
    }`;
