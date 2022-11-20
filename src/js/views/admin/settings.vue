<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-4">Shoutzor Settings</h1>
            
            <base-spinner v-if="loading" />
            <template v-else-if="error">
                <p>An error occured while loading the settings</p>
                <base-button @click="getData" class="btn-primary">Retry</base-button>
            </template>
            <form 
                v-else
                v-for="[group, settings] in organizedSettings" :key="group">
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>{{ group }}</strong>
                    </div>
                    <div class="card-body">
                        <template v-for="setting in settings" :key="setting.name">
                            <formitem-checkbox 
                                v-if="setting.type === 'boolean'"
                                :key="setting.key"
                                :id="setting.key"
                                :name="setting.name"
                                :description="setting.description"
                                :isSwitch="true"
                                :checked="getSettingValue(setting.value)"
                                class="mb-3"
                                @change="saveCheckboxData"
                                />

                            <formitem-input
                                v-else-if="setting.type === 'string'"
                                :id="setting.key"
                                :name="setting.name"
                                :description="setting.description"
                                :modelValue="getSettingValue(setting.value)"
                                class="mb-3"
                                @input="saveStringData"
                                />

                            <formitem-input
                                v-else-if="setting.type === 'int' || setting.type === 'integer'"
                                :id="setting.key"
                                :name="setting.name"
                                :description="setting.description"
                                :modelValue="getSettingValue(setting.value)"
                                type="number"
                                class="mb-3"
                                @change="saveInputData"
                                />

                            <formitem-list
                                v-else-if="setting.type === 'array'"
                                :name="setting.name"
                                :description="setting.description"
                                :modelValue="getSettingValue(setting.value)"
                                :ref="setting.key"
                                @save="saveArrayData(setting.key, $event)"
                                class="mb-3"
                                />

                            <base-alert 
                                v-else
                                class="m-3"
                                type="danger">
                                Unknown data type <strong>{{ setting.type }}</strong> for setting with key <strong>{{ setting.key }}</strong>. Please report this bug.
                            </base-alert>
                        </template>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { groupBy } from "@js/helpers/ArrayHelper.js";
import { useMutation } from "@vue/apollo-composable";
import { ALL_NON_READONLY_SETTINGS_QUERY, UPDATE_SETTING_MUTATION } from "@graphql/settings.js";
import BaseAlert from "@components/BaseAlert.vue";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemCheckbox from '@components/FormitemCheckbox.vue';
import FormitemInput from '@components/FormitemInput.vue';
import FormitemList from '@components/FormitemList.vue';

export default {
    name: "admin-settings",
    components: {
        BaseAlert,
        BaseButton,
        BaseSpinner,
        FormitemCheckbox,
        FormitemInput,
        FormitemList
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
    computed: {
        // Groups and orders the settings according to their group & order properties
        organizedSettings() {
            // First group the items
            let organizedItems = groupBy(this.settingItems, s => s.group);

            // Next sort each group by order
            organizedItems.forEach(group => {
                group.sort((a,b) => a.order - b.order);
            })

            return organizedItems;
        }
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
        async saveStringData(e) {
            const setting = e.target;
            this.updateSetting(setting.id, setting.value);
        },
        async saveArrayData(key, value) {
            this.updateSetting(key, value).then(() => {
                this.getData();
            });
        },
        async saveInputData(e) {
            const setting = e.target;
            this.updateSetting(setting.id, parseInt(setting.value));
        },
        updateSetting(key, value) {
            return new Promise((resolve, reject) => {
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

                    resolve(true);
                })
                .catch(error => {
                    this.bootstrapControl.showToast("danger", "Failed to save the setting, error:" + error);
                    reject(false);
                });
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
