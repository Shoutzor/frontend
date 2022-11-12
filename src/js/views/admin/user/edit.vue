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
            <h1 class="mb-4">Edit User: {{ username }}</h1>
 
            <div class="card mb-3">
                <div class="card-header"><strong>User Details</strong></div>
                <div class="card-body">
                    <div class="form-group mb-3">
                        <label class="form-label">Username</label>
                        <div>
                            <base-input
                                v-model="username"
                                type="text"
                                name="username"
                                placeholder="Username"
                                autocomplete="off" />
                        </div>
                    </div>

                    <div class="form-group mb-3">
                        <label class="form-label">Email</label>
                        <div>
                            <base-input
                                v-model="email"
                                type="email"
                                name="email"
                                placeholder="Email"
                                autocomplete="off" />
                        </div>
                    </div>

                    <formitem-checkbox
                        :disabled="true"
                        :checked="!!email_verified_at"
                        id="email_verified"
                        name="email_verified"
                        description="Shows if the user has verified their email"
                        />

                    <formitem-checkbox 
                        :disabled="true"
                        :isSwitch="false"
                        :checked="approved"
                        id="approved"
                        name="approved"
                        description="Shows If the user is approved"
                        />

                    <formitem-checkbox 
                        :isSwitch="true"
                        v-model:checked="blocked"
                        id="blocked"
                        name="blocked"
                        description="If the user is blocked"
                        />
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header"><strong>User Roles</strong></div>
                <div class="card-body">
                    <role-list
                        v-model:hasRoles="roles"
                        :roles="allRoles" />
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header"><strong>User-specific Permissions</strong></div>
                <div class="card-body">
                    <permission-list
                        v-model:hasPermissions="permissions"
                        :permissions="allPermissions" />
                </div>
            </div>

            <div class="form-footer">
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
import { GET_USER_QUERY, UPDATE_USER_MUTATION } from "@graphql/users.js";
import { LIST_ROLES_QUERY } from "@graphql/roles.js";
import BaseButton from "@components/BaseButton.vue";
import BaseInput from "@components/BaseInput.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import FormitemCheckbox from "@components/FormitemCheckbox.vue";
import PermissionList from "@components/PermissionList.vue";
import RoleList from "@components/RoleList.vue";

export default {
    name: "admin-user-edit",
    components: {
        BaseButton,
        BaseInput,
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
            saving: false,
            username: null,
            email: null,
            email_verified_at: null,
            approved: false,
            blocked: false,
            permissions: [],
            roles: [],
            allPermissions: [],
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

            // Next fetch all the roles
            await this.apollo.query({
                fetchPolicy: 'network-only',
                nextFetchPolicy: 'cache-first',
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
                fetchPolicy: 'network-only',
                query: GET_USER_QUERY,
                variables: {
                    id: this.userId
                }
            })
            .then((result) => {
                const user = result.data.user;
                console.dir(user);
                this.username = user.username;
                this.email = user.email;
                this.email_verified_at = user.email_verified_at;
                this.approved = user.approved;
                this.blocked = user.blocked;
                this.permissions = user.permissions;
                this.roles = user.roles;
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
         * Persists the changes (if any) for the current user
         */
        async saveData() {
            // Build the variables to pass to the GraphQL mutation
            let variables = {
                id:             this.userId,
                username:       this.username,
                email:          this.email,
                blocked:        this.blocked,
                permissions:    this.permissions.map(p => p.id),
                roles:          this.roles.map(r => r.id)
            };

            this.saving = true;

            const { mutate: updateUserMutation } = useMutation(UPDATE_USER_MUTATION, {
                fetchPolicy: 'network-only',
                variables
            });

            updateUserMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", `User "${this.username}" saved`);
                this.$router.push({ name:'admin-user-list' });
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", `Failed to save the user "${this.username}", error: ${error}`);
                this.saving = false;
            });
        }
    }
};
</script>
