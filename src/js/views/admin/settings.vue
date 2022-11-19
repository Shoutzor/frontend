<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-4">Shoutzor Settings</h1>
            
            <base-spinner v-if="loading" />
            <template v-else-if="error">
                <p>An error occured while loading the settings</p>
                <base-button @click="getData" class="btn-primary">Retry</base-button>
            </template>
            <form v-else>
                <template v-for="setting in settingItems">
                    <formitem-checkbox 
                        v-if="setting.type === 'boolean'"
                        :key="setting.key"
                        :id="setting.key"
                        :name="setting.name"
                        :description="setting.description"
                        :isSwitch="true"
                        :checked="getSettingValue(setting.value)"
                        @change="saveCheckboxData"
                        />

                    <base-alert 
                        v-else
                        type="danger">
                        Unknown data type {{ setting.type }} for setting with key {{ setting.key }}<br />
                        Please report this bug.
                    </base-alert>
                </template>
                
            </form>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { ALL_NON_READONLY_SETTINGS_QUERY, UPDATE_SETTING_MUTATION } from "@graphql/settings.js";
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemCheckbox from '@components/FormitemCheckbox.vue';

export default {
    name: "admin-settings",
    components: {
        BaseAlert,
        BaseButton,
        BaseSpinner,
        FormitemCheckbox
    },
    data() {
        return {
            settingItems: [],
            loading: true,
            error: false
        };
    },
    mounted() {
        this.getData();
    },
    methods: {
        async getData() {
            this.loading = true;
            this.error = false;

            // First fetch all the permissions
            await this.apollo.query({
                query: ALL_NON_READONLY_SETTINGS_QUERY
            })
            .then((result) => {
                this.settingItems = result.data.settings;
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the settings, error:" + error);
            })
            .finally(() => {
                this.loading = false;
            });
        },
        async saveCheckboxData(e) {
            const setting = e.target;
            this.updateSetting(setting.id, setting.checked);
        },
        updateSetting(key, value) {
            const { mutate: updateSettingMutation } = useMutation(UPDATE_SETTING_MUTATION, {
                fetchPolicy: 'no-cache',
                variables: {
                    key: key,
                    value: this.createSettingValue(value)
                }
            });

            updateSettingMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", "Setting saved");
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", "Failed to save the setting, error:" + error);
            });
        },
        getSettingValue(value) {
            return this.settings.getCastedSettingValue(value);
        },
        createSettingValue(input) {
            return this.settings.createSettingValue(input);
        }
    }
};
</script>
