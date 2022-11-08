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
                            <th scope="col">Status</th>
                            <th scope="col">Username</th>
                            <th scope="col">Role(s)</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </template>
                    <template #default>
                        <tr 
                            v-if="props.itemsOnPage.length > 0"
                            v-for="user in props.itemsOnPage">
                            <td class="min">
                                <base-avatar v-if="user.blocked" type="danger">
                                    <b-icon-x-circle />
                                </base-avatar>

                                <base-avatar 
                                    v-else-if="user.email_verified_at && user.approved" 
                                    type="success">
                                    <b-icon-check-circle />
                                </base-avatar>

                                <base-avatar v-else type="secondary">
                                    <b-icon-question-circle />
                                </base-avatar>
                            </td>
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
                                        v-if="user_self.id !== user.id && can('admin.user.delete')"
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
import { BIconXCircle, BIconCheckCircle, BIconQuestionCircle } from 'bootstrap-icons-vue';
import { useMutation } from "@vue/apollo-composable";
import { LIST_USERS_QUERY, DELETE_USER_MUTATION } from "@graphql/users.js";
import BaseButton from "@components/BaseButton.vue";
import BaseAvatar from "@components/BaseAvatar.vue";
import BaseTable from "@components/BaseTable.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import RoleList from "@components/RoleList.vue";

export default {
    name: "admin-users",
    components: {
        BIconXCircle,
        BIconCheckCircle,
        BIconQuestionCircle,
        BaseAvatar,
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
    computed: {
        user_self() {
            return this.auth.user;
        }
    },
    methods: {
        async onDeleteClick(user) {
            if(this.user_self.id === user.id) {
                this.bootstrapControl.showToast("danger", "You cannot delete your own account");
                return;
            }

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
