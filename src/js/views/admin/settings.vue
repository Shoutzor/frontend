<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-4">Shoutzor Settings</h1>
            
            <base-spinner v-if="loading" />
            <template v-else-if="error">
                <p>An error occured while loading the settings</p>
                <base-button @click="getData" class="btn-primary">Retry</base-button>
            </template>
            <form v-else action="#" method="post">
                <formitem-checkbox 
                    v-for="setting in settings"
                    :key="setting.key"
                    :id="setting.key"
                    :name="setting.name"
                    :description="setting.description"
                    :isSwitch="true"
                    :checked="setting.value === 'true'"
                    @change="updateSetting"
                    />
            </form>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { ALL_NON_READONLY_SETTINGS_QUERY, UPDATE_SETTING_MUTATION } from "@graphql/settings.js";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemCheckbox from '@components/FormitemCheckbox.vue';

export default {
    name: "admin-settings",
    components: {
        BaseButton,
        BaseSpinner,
        FormitemCheckbox
    },
    data() {
        return {
            settings: [],
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
                this.settings = result.data.settings;
                console.dir(this.settings);
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the settings, error:" + error);
            })
            .finally(() => {
                this.loading = false;
            });
        },
        async updateSetting(e) {
            console.log(e);
            let setting = e.target;
            console.log("called", setting.id, setting.checked);

            const { mutate: updateSettingMutation } = useMutation(UPDATE_SETTING_MUTATION, {
                fetchPolicy: 'no-cache',
                variables: {
                    key: setting.id,
                    value: setting.checked ? 'true' : 'false'
                }
            });

            updateSettingMutation()
            .then(result => {
                this.bootstrapControl.showToast("success", "Setting saved");
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", "Failed to save the setting, error:" + error);
            });
        }
    }
};
</script>
