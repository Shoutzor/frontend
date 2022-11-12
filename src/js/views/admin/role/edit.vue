<template>
    <div class="row row-cards">
        <div v-if="isLoading" class="col-sm-12">
            <p>Loading role information</p>
            <div class="spinner-border" role="status"></div>
        </div>
        <div v-else-if="error">
            <p>An error occured</p>
            <base-button @click="getData" class="btn-primary">Retry</base-button>
        </div>
        <div v-else class="col-sm-12">
            <h1 class="mb-4">Edit Role: {{ name }}</h1>

            <div class="form-group mb-3">
                <label class="form-label">Name</label>
                <div>
                    <input :disabled="protected"
                        v-model="name"
                        autocomplete="off"
                        class="form-control"
                        placeholder="Role name" type="text" />
                </div>
            </div>
            <div class="form-group mb-3">
                <label class="form-label">Description</label>
                <div>
                    <textarea 
                        v-model="description"
                        :disabled="protected"
                        class="form-control"></textarea>
                    <small class="form-hint">
                        A description for the role, used for administrative purposes only.
                    </small>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Permissions</div>
                <div class="card-body">
                    <permission-list
                        v-model:hasPermissions="permissions"
                        :permissions="allPermissions" />
                </div>
            </div>
            <div class="form-footer mt-2">
                <base-button 
                    :disabled="saving" 
                    @click="saveData" 
                    class="btn-primary">
                    <base-spinner v-if="saving" :small="true"></base-spinner>
                    <template v-else>Save</template>
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { LIST_PERMISSIONS_QUERY } from "@graphql/permissions.js";
import { GET_ROLE_QUERY, UPDATE_ROLE_MUTATION } from "@graphql/roles.js";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import PermissionList from "@components/PermissionList.vue";

export default {
    name: "admin-role-edit",
    components: {
        BaseButton,
        BaseSpinner,
        PermissionList
    },
    props: {
        roleId: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            isLoading: true,
            error: false,
            saving: false,
            protected: false,
            name: '',
            description: '',
            permissions: [],
            allPermissions: []
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        async getData() {
            this.isLoading = true;
            this.error = false;

            // First fetch all the permissions
            await this.apollo.query({
                fetchPolicy: 'network-only',
                nextFetchPolicy: 'cache-first',
                query: LIST_PERMISSIONS_QUERY
            })
            .then((result) => {
                this.allPermissions = result.data.permissions;
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the permissions, error:" + error);
            });

            // Next fetch the role data
            await this.apollo.query({
                fetchPolicy: 'network-only',
                query: GET_ROLE_QUERY,
                variables: {
                    id: this.roleId
                }
            })
            .then((result) => {
                const role = result.data.role;
                this.protected = role.protected;
                this.name = role.name;
                this.description = role.description;
                this.permissions = role.permissions;
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the role, error:" + error);
            })
            .finally(() => {
                this.isLoading = false;
            });
        },
        /**
         * Persists the changes (if any) for the current role
         */
        async saveData() {
            this.saving = true;

            // Build the variables to pass to the GraphQL mutation
            let variables = {
                id: this.roleId,
                permissions: this.permissions.map(p => p.id)
            };

            // Only update the name & description if a role is not protected
            if(!this.protected) {
                variables['name'] = this.name;
                variables['description'] = this.description;
            }

            const { mutate: updateRoleMutation } = useMutation(UPDATE_ROLE_MUTATION, {
                fetchPolicy: 'network-only',
                variables
            });

            updateRoleMutation()
            .then(result => {
                this.bootstrapControl.showToast("success", `Role "${this.name}" saved`);
                this.$router.push({ name:'admin-role-list' });
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", `Failed to save the role "${this.name}", error: ${error}`);
                this.saving = false;
            });
        }
    }
};
</script>
