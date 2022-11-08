<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-3">Manage Roles</h1>

            <router-link
                v-if="can('admin.role.create')"
                :to="{ name: 'admin-roles-create' }"
                class="btn btn-outline-primary text-decoration-none">
                Create Role
            </router-link>

            <graphql-pagination
                :queryObj="LIST_ROLES_QUERY"
                :limit="8"
                v-slot="props"
                class="mt-2">
                <base-table
                    description="Lists all roles"
                    :hoverable="true">
                    <template #header>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </template>
                    <template #default>
                        <tr 
                            v-if="props.itemsOnPage.length > 0"
                            v-for="role in props.itemsOnPage">
                            <td>
                                {{ role.name }}
                            </td>
                            <td>
                                {{ role.description }}
                            </td>
                            <td>
                                <div class="hstack gap-2">
                                    <router-link
                                        v-if="can('admin.role.edit')"
                                        :to="{ name: 'admin-roles-edit', params: { roleId: role.id } }"
                                        class="btn btn-outline-primary text-decoration-none">
                                        Edit
                                    </router-link>
                                    <base-button 
                                        v-if="!role.protected && can('admin.role.delete')"
                                        class="btn-outline-danger"
                                        @click="onDeleteClick(role)">
                                        Delete
                                    </base-button>
                                </div>
                            </td>
                        </tr>
                        <tr v-else>
                            <td colspan="3">No roles found</td>
                        </tr>
                    </template>
                </base-table>
            </graphql-pagination>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { LIST_ROLES_QUERY, DELETE_ROLE_MUTATION } from "@graphql/roles.js";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import BaseTable from "@components/BaseTable.vue";
import BaseButton from "@components/BaseButton.vue";

export default {
    name: "admin-roles",
    components: {
        BaseButton,
        BaseTable,
        GraphqlPagination
    },
    data() {
        return {
            LIST_ROLES_QUERY,
            modalId: null
        }
    },
    methods: {
        async onDeleteClick(role) {
            // Protected roles cannot be deleted (button shouldn't show for those roles either)
            if(role.protected) {
                this.bootstrapControl.showToast("danger", "Protected roles cannot be deleted");
                return;
            }

            let escapedName = this.antiXSS(role.name);

            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.deleteRole(role.id); },
                body: `Are you sure you want to delete: <strong>${escapedName}</strong>?`,
                confirmButton: 'Delete'
            });
        },
        async deleteRole(roleId) {
            let modalProps = this.bootstrapControl.getModalProperties(this.modalId);
            modalProps.loading = true;

            const { mutate: deleteRoleMutation } = useMutation(DELETE_ROLE_MUTATION, {
                fetchPolicy: 'no-cache',
                variables: {
                    id: roleId,
                },
                refetchQueries: [
                    'list_roles_query'
                ]
            });

            deleteRoleMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", "Role deleted");
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", "Failed to delete the role, error:" + error);
            })
            .finally(() => {
                this.bootstrapControl.hideModal(this.modalId);
                modalProps.loading = false;
            });
        }
    }
};
</script>
