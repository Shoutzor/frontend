<template>
    <div class="row row-cards">
        <div v-if="isLoading" class="col-sm-12">
            <p>Loading permissions</p>
            <div class="spinner-border" role="status"></div>
        </div>
        <div v-else-if="error">
            <p>An error occured</p>
            <base-button @click="getPermissions" class="btn-primary">Retry</base-button>
        </div>
        <div v-else class="col-sm-12">
            <h1 class="mb-4">Create Role</h1>

            <div class="form-group mb-3">
                <label class="form-label">Name</label>
                <div>
                    <input
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
                        v-model:hasPermissions="permissions"
                        :permissions="allPermissions" />
                </div>
            </div>
            <div class="form-footer mt-2">
                <base-button 
                    :disabled="saving" 
                    @click="createRole" 
                    class="btn-primary">
                    <base-spinner v-if="saving" :small="true"></base-spinner>
                    <template v-else>Create</template>
                </base-button>
            </div>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { LIST_PERMISSIONS_QUERY } from "@graphql/permissions.js";
import { CREATE_ROLE_MUTATION } from "@graphql/roles.js";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import PermissionList from "@components/PermissionList.vue";

export default {
    name: "admin-role-create",
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
            name: '',
            description: '',
            permissions: [],
            allPermissions: []
        }
    },
    mounted() {
        this.getPermissions();
    },
    methods: {
        async getPermissions() {
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
            })
            .finally(() => {
                this.isLoading = false;
            });
        },
        /**
         * Persists the changes (if any) for the current role
         */
        async createRole() {
            if(this.name === '') {
                this.bootstrapControl.showToast("danger", "Role name cannot be empty");
                return;
            }

            if(this.description === '') {
                this.bootstrapControl.showToast("danger", "Role description cannot be empty");
                return;
            }

            this.saving = true;

            // Build the variables to pass to the GraphQL mutation
            let variables = {
                name: this.name,
                description: this.description,
                permissions: this.permissions.map(p => p.id)
            };

            const { mutate: createRoleMutation } = useMutation(CREATE_ROLE_MUTATION, {
                fetchPolicy: 'no-cache',
                variables
            });

            createRoleMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", "Role created");
                this.$router.push({ name:'admin-role-list' });
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", `Failed to create the role, error: ${error}`);
                this.saving = false;
            });
        }
    }
};
</script>
