import gql from 'graphql-tag';

export const LIST_ROLES_QUERY = gql`
    query list_roles_query($page: Int, $limit: Int) {
        roles(page: $page, first: $limit) {
            paginatorInfo{
                lastPage
                total
            }
            data {
                id
                name
                description
                protected
            }
        }
    }`;

export const GET_ROLE_QUERY = gql`
    query get_role_query($id: ID) {
        role(id: $id) {
            id
            name
            description
            protected
            permissions {
                id
                name
                description
            }
        }
    }`;

export const CREATE_ROLE_MUTATION = gql`
    mutation create_role_mutation($name: String!, $description: String!, $permissions: [ID!]!) {
        createRole(
            name: $name
            description: $description
            permissions: {
                sync: $permissions
            }
        ){
            id
        }
    }`;

export const UPDATE_ROLE_MUTATION = gql`
    mutation update_role_mutation($id: ID!, $name: String, $description: String, $permissions: [ID!]!) {
        updateRole(
            id: $id
            name: $name
            description: $description
            permissions: {
                sync: $permissions
            }
        ){
            id
        }
    }`;

export const DELETE_ROLE_MUTATION = gql`
    mutation delete_role_mutation($id: ID!) {
        deleteRole(
            id: $id
        ){
            id
        }
    }`;