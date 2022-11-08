import gql from 'graphql-tag';

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

export const DELETE_USER_MUTATION = gql`
    mutation delete_user_mutation($id: ID!) {
        deleteUser(
            id: $id
        ){
            id
        }
    }`;