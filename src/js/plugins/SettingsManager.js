import axios from 'axios';
import {reactive, triggerRef} from "vue";

import {
    ALL_SETTINGS_QUERY
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

        this.#initializedPromise = this.#initialize();
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
        return this.#processValue(this.getSetting('user_must_verify_email').value);
    }

    #processValue(input) {
        if(input === 'true') {
            return true;
        }
        else if(input === 'false') {
            return false;
        }

        return input;
    }
    
    getSetting(key) {
        if(!key in this.#state.settings) {
            return null;
        }

        return this.#state.settings[key];
    }

    async #initialize() {
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
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });

            return promise;
        });
    }

}

export const SettingsPlugin = {
    install: (app, options) => {
        const settings = new SettingsManager(options.apolloClient)
        app.config.globalProperties.settings = settings;
    }
}
