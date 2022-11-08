import gql from "graphql-tag";

export const SETTING_QUERY = gql`
    query setting_query($id: ID!) {
        album(id: $id) {
            id,
            image,
            title,
            summary
        }
    }`;

export const ALL_SETTINGS_QUERY = gql`
    query all_settings_query {
        settings {
            key
            value
            name
            description
            readonly
        }
    }`;

export const ALL_NON_READONLY_SETTINGS_QUERY = gql`
    query all_non_readonly_settings_query {
        settings(readonly: false) {
            key
            value
            name
            description
            readonly
        }
    }`;

export const UPDATE_SETTING_MUTATION = gql`
    mutation update_setting_mutation($key: String!, $value: String!) {
        updateSetting(key: $key, value: $value) {
            key
            value
        }
    }
    `;