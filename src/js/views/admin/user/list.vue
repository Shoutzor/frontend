<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-4">Manage Users</h1>

            <graphql-pagination
                :queryObj="LIST_USERS_QUERY"
                :limit="8"
                v-slot="props">
                <base-table
                    description="Lists all user accounts"
                    :hoverable="true">
                    <template #header>
                        <tr>
                            <th>Username</th>
                            <th>Role(s)</th>
                            <th>Actions</th>
                        </tr>
                    </template>
                    <template #default>
                        <tr 
                            v-if="props.itemsOnPage.length > 0"
                            v-for="user in props.itemsOnPage">
                            <td>
                                {{ user.username }}
                            </td>
                            <td>
                                <role-list
                                    :roles="user.roles"
                                    emptyMessage="No roles assigned" />
                            </td>
                            <td>
                                <div class="hstack gap-2">
                                    <base-button class="btn-outline-primary">Edit</base-button>
                                    <base-button 
                                        v-if="can('admin.user.delete')"
                                        class="btn-outline-danger"
                                        @click="onDeleteClick(user)">
                                        Delete
                                    </base-button>
                                </div>
                            </td>
                        </tr>
                        <tr v-else>
                            <td colspan="3">No users found</td>
                        </tr>
                    </template>
                </base-table>
            </graphql-pagination>
        </div>
    </div>
</template>

<script>
import { useMutation } from "@vue/apollo-composable";
import { LIST_USERS_QUERY, DELETE_USER_MUTATION } from "@graphql/users.js";
import BaseButton from "@components/BaseButton.vue";
import BaseTable from "@components/BaseTable.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import RoleList from "@components/RoleList.vue";

export default {
    name: "admin-users",
    components: {
        BaseButton,
        RoleList,
        BaseTable,
        GraphqlPagination
    },
    data() {
        return {
            LIST_USERS_QUERY,
            modalId: null
        };
    },
    methods: {
        async onDeleteClick(user) {
            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.deleteUser(user.id); },
                body: `Are you sure you want to delete: <strong>${user.username}</strong>?`,
                confirmButton: 'Delete'
            });
        },
        async deleteUser(userId) {
            let modalProps = this.bootstrapControl.getModalProperties(this.modalId);
            modalProps.loading = true;

            const { mutate: deleteUserMutation } = useMutation(DELETE_USER_MUTATION, {
                fetchPolicy: 'no-cache',
                variables: {
                    id: userId,
                },
                refetchQueries: [
                    'list_users_query'
                ]
            });

            deleteUserMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", "User deleted");
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", "Failed to delete the user, error:" + error);
            })
            .finally(() => {
                this.bootstrapControl.hideModal(this.modalId);
                modalProps.loading = false;
            });
        }
    }
};
</script>
