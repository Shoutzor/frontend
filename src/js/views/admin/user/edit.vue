<template>
    <div class="row row-cards">
        <div v-if="isLoading" class="col-sm-12">
            <p>Loading user information</p>
            <div class="spinner-border" role="status"></div>
        </div>
        <div v-else-if="error">
            <p>An error occured</p>
            <base-button @click="getData" class="btn-primary">Retry</base-button>
        </div>
        <div v-else class="col-sm-12">
            <h1 class="mb-4">Edit User: {{ user.name }}</h1>

            <div class="form-group mb-3">
                <label class="form-label">Username</label>
                <div>
                    <input
                        v-model="user.username"
                        autocomplete="off"
                        class="form-control"
                        placeholder="Username" type="text" />
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="form-label">Email</label>
                <div>
                    <input
                        v-model="user.email"
                        autocomplete="off"
                        class="form-control"
                        placeholder="Email" type="text" />
                </div>
            </div>

            <formitem-checkbox
                :disabled="true"
                :checked="!!user.email_verified_at"
                id="email_verified"
                name="email_verified"
                description="Shows if the user has verified their email"
                />

            <formitem-checkbox 
                :isSwitch="true"
                :checked="user.approved"
                id="approved"
                name="approved"
                description="If the user is approved"
                />

            <formitem-checkbox 
                :isSwitch="true"
                :checked="user.blocked"
                id="blocked"
                name="blocked"
                description="If the user is blocked"
                />

            <div class="card">
                <div class="card-header">User Roles</div>
                <div class="card-body">
                    <role-list
                        :hasRoles="roles"
                        :roles="allRoles"
                        @change="roleChanged" />
                </div>
            </div>
            <div class="card">
                <div class="card-header">User-specific Permissions</div>
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
import { GET_USER_QUERY } from "@graphql/users.js";
import { LIST_ROLES_QUERY, UPDATE_ROLE_MUTATION } from "@graphql/roles.js";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemCheckbox from "@components/FormitemCheckbox.vue";
import PermissionList from "@components/PermissionList.vue";
import RoleList from "@components/RoleList.vue";

export default {
    name: "admin-user-edit",
    components: {
        BaseButton,
        BaseSpinner,
        FormitemCheckbox,
        PermissionList,
        RoleList
    },
    props: {
        userId: {
            type: String,
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
            allPermissions: [],
            roles: [],
            allRoles: []
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

            // Next fetch all the roles
            await this.apollo.query({
                query: LIST_ROLES_QUERY
            })
            .then((result) => {
                this.allRoles = result.data.roles.data;
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the roles, error:" + error);
            });

            // Finally fetch the user data
            await this.apollo.query({
                query: GET_USER_QUERY,
                variables: {
                    id: this.userId
                }
            })
            .then((result) => {
                this.user = result.data.user;
                this.permissions = result.data.user.permissions;
                this.roles = result.data.user.roles;
            })
            .catch((error) => {
                this.error = true;
                this.bootstrapControl.showToast("danger", "Could not load the user, error:" + error);
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
            const permission = e.target.dataset.name;
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
         * Triggered when a permission from the list has been (de)activated
         * updates the internal state of permissions for this role, these
         * changes are not persisted yet.
         * @param {*} e 
         */
        async permissionChanged(e) {
            const permission = e.target.dataset.name;
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
                console.error("User doesn't have the permission " + permissionName);
            }
        },
        /**
         * Persists the changes (if any) for the current role
         */
        async saveData() {
            this.saving = true;

            // Build the variables to pass to the GraphQL mutation
            let variables = {
                id: this.user.id,
                permissions: this.permissions.map(p => p.id)
            };

            // Only update the name & description if a role is not protected
            if(!this.user.protected) {
                variables['name'] = this.user.name;
                variables['description'] = this.user.description;
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
