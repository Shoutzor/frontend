import { gql } from 'graphql-tag';

export const GET_USER_QUERY = gql`
    query get_user_query($id: ID) {
        user(id: $id) {
            id
            email
            username
            email_verified_at
            approved
            blocked
            permissions {
                id
                name
                description
            }
            roles {
                id
                name
            }
        }
    }`;

export const LIST_USERS_QUERY = gql`
    query list_users_query($page: Int, $limit: Int) {
        users(page: $page, first: $limit) {
            paginatorInfo{
                lastPage
                total
            }
            data {
                id
                username
                created_at
                email_verified_at
                approved
                blocked
                roles {
                    id
                    name
                }
                is_admin
            }
        }
    }`;

export const UPDATE_USER_MUTATION = gql`
    mutation update_user_mutation(
        $id: ID!,
        $username: String,
        $email: String,
        $approved: Boolean,
        $blocked: Boolean,
        $permissions: [ID!],
        $roles: [ID!]
    ) {
        updateUser(
            id: $id
            username: $username
            email: $email
            approved: $approved
            blocked: $blocked
            permissions: {
                sync: $permissions
            },
            roles: {
                sync: $roles
            }
        ){
            id
        }
    }`;

export const DELETE_USER_MUTATION = gql`
    mutation delete_user_mutation($id: ID!) {
        deleteUser(
            id: $id
        ){
            id
        }
    }`;