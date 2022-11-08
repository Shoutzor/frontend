import gql from 'graphql-tag';

export const LIST_PERMISSIONS_QUERY = gql`
    query list_permissions_query {
        permissions {
            id
            name
            description
        }
    }`;
