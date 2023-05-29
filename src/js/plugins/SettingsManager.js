import { reactive } from "vue";
import { useSubscription } from "@vue/apollo-composable";

import {
    ALL_SETTINGS_QUERY,
    SETTING_UPDATED_SUBSCRIPTION
} from "@graphql/settings";

export class SettingsManager {

    #apolloClient
    #initializedPromise
    #state;

    constructor(apolloClient) {
        this.#apolloClient = apolloClient;

        this.#state = reactive({
            settings: {},
            isInitialized: false
        });
    }

    /*
        Getters
     */

    get isInitialized() {
        return this.#state.isInitialized;
    }

    get isInitializedPromise() {
        return this.#initializedPromise;
    }

    get emailVerificationEnabled() {
        return this.getSettingValue('user_must_verify_email');
    }

    getSetting(key) {
        if(!key in this.#state.settings) {
            return null;
        }

        return this.#state.settings[key];
    }

    getSettingValue(key) {
        return this.getCastedSettingValue(this.getSetting(key).value);
    }

    getCastedSettingValue(value) {
        return JSON.parse(value).data;
    }

    createSettingValue(input) {
        return JSON.stringify({
            data: input
        });
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            const promise = this.#apolloClient.query({
                fetchPolicy: 'network-only',
                query: ALL_SETTINGS_QUERY
            });
            
            promise.then((result) => {
                let settings = {};
                result.data.settings.forEach(setting => {
                    settings[setting.key] = setting;
                });

                this.#state.settings = settings;
                this.#state.isInitialized = true;
                this.#listenToSettingChanges();
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });

            return promise;
        });
    }

    /**
     * Listens for changes and updates the changed setting's value accordingly
     */
    #listenToSettingChanges() {
        useSubscription(SETTING_UPDATED_SUBSCRIPTION).onResult(({ data }) => {
            const updatedSetting = data.settingUpdated;
            let newSetting = Object.assign({}, this.#state.settings[updatedSetting.key]);
            newSetting.value = updatedSetting.value;
            this.#state.settings[updatedSetting.key] = newSetting;
        });
    }
}

export const SettingsPlugin = {
    install: (app, options) => {
        const settings = new SettingsManager(options.apolloClient)
        app.config.globalProperties.settings = settings;
    }
}
