import gql from "graphql-tag";

export const GET_SETTING_QUERY = gql`
    query setting_query($key: ID!) {
        setting(key: $key) {
            key
            value
            type
            name
            description
            readonly
        }
    }`;

export const ALL_SETTINGS_QUERY = gql`
    query all_settings_query {
        settings {
            key
            value
            type
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
            type
            name
            description
            readonly
        }
    }`;

export const UPDATE_SETTING_MUTATION = gql`
    mutation update_setting_mutation($key: String!, $value: JSON!) {
        updateSetting(key: $key, value: $value) {
            key
            value
        }
    }
    `;

export const SETTING_UPDATED_SUBSCRIPTION = gql`
    subscription setting_updated_subscription($key: String) {
        settingUpdated(key: $key) {
            key
            value
        }
    }`;