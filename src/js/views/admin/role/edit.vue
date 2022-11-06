<template>
    <div class="row row-cards">
        <div v-if="isLoading" class="col-sm-12">
            <p>Loading role information</p>
            <div class="spinner-border" role="status"></div>
        </div>
        <div v-else class="col-sm-12">
            <h1 class="mb-4">Edit Role: {{ role.name }}</h1>

            <div class="form-group mb-3">
                <label class="form-label">Name</label>
                <div>
                    <input :disabled="role.protected"
                        v-model="role.name"
                        autocomplete="off"
                        class="form-control"
                        placeholder="Role name" type="text" />
                </div>
            </div>
            <div class="form-group mb-3">
                <label class="form-label">Description</label>
                <div>
                    <textarea 
                        v-model="role.description"
                        :disabled="role.protected"
                        class="form-control"></textarea>
                    <small class="form-hint">
                        A description for the role, used for administrative purposes only.
                    </small>
                </div>
            </div>
            <div class="card ">
                <div class="card-header">Permissions</div>
                <div class="card-body">
                    <permission-list
                        :hasPermissions="permissions"
                        :permissions="allPermissions"
                        @change="permissionChanged" />
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
    name: "admin-roles",
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
            role: null,
            saving: false,
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
                query: GET_ROLE_QUERY,
                variables: {
                    id: this.roleId
                }
            })
            .then((result) => {
                this.role = result.data.role;
                this.permissions = result.data.role.permissions;
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
         * Triggered when a permission from the list has been (de)activated
         * updates the internal state of permissions for this role, these
         * changes are not persisted yet.
         * @param {*} e 
         */
        async permissionChanged(e) {
            const permission = e.target.parentElement.dataset.permission;
            const state = e.target.checked;

            // Permission was enabled
            if(state) {
                this.addPermission(permission);
            }
            // Permission was disabled
            else {
                this.removePermission(permission);
            }
        },
        /**
         * Gets the permission object for the given name
         * @param {*} permissionName 
         */
        getPermission(permissionName) {
            return this.allPermissions.find(p => p.name === permissionName);
        },
        /**
         * Checks if the role has the given permission
         * @param {*} permissionName 
         * @return boolean
         */
        hasPermission(permissionName) {
            return this.permissions.find(p => p.name === permissionName) !== undefined;
        },
        /**
         * Adds a permission to the current role
         * @param {*} permissionName 
         */
        addPermission(permissionName) {
            if(!this.hasPermission(permissionName)) {
                const p = this.getPermission(permissionName);
                if(p) {
                    this.permissions = [...this.permissions, this.getPermission(permissionName)];
                }
                else {
                    console.error("No permission found for " + permissionName);
                }
            }
        },
        /**
         * Removes a permission from the current role
         * @param {*} permissionName 
         */
        removePermission(permissionName) {
            if(this.hasPermission(permissionName)) {
                this.permissions = this.permissions.filter(i => i.name !== permissionName);
            }
            else {
                console.error("Role doesn't have the permission " + permissionName);
            }
        },
        /**
         * Persists the changes (if any) for the current role
         */
        async saveData() {
            this.saving = true;

            // Build the variables to pass to the GraphQL mutation
            let variables = {
                id: this.role.id,
                permissions: this.permissions.map(p => p.id)
            };

            // Only update the name & description if a role is not protected
            if(!this.role.protected) {
                variables['name'] = this.role.name;
                variables['description'] = this.role.description;
            }

            const { mutate: updateRoleMutation } = useMutation(UPDATE_ROLE_MUTATION, {
                fetchPolicy: 'no-cache',
                variables
            });

            updateRoleMutation()
            .then(result => {
                this.bootstrapControl.showToast("success", "Role saved");
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", "Failed to save the role, error:" + error);
            })
            .finally(() => {
                this.saving = false;
            });
        }
    }
};
</script>
