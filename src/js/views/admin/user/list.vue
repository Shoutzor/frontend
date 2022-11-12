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
                                <name-list
                                    :names="user.roles.map(r => r.name)"
                                    emptyMessage="No roles assigned" />
                            </td>
                            <td>
                                <div class="hstack gap-2">
                                    <base-button 
                                        v-if="!user.approved"
                                        class="btn-outline-primary"
                                        @click="onClick(user, 'approve')">
                                        Approve
                                    </base-button>
                                    <router-link
                                        v-if="can('admin.user.edit')"
                                        :to="{ name: 'admin-user-edit', params: { userId: user.id } }"
                                        class="btn btn-outline-primary text-decoration-none">
                                        Edit
                                    </router-link>
                                    <base-button 
                                        v-if="user.blocked"
                                        :disabled="user_self.id === user.id"
                                        class="btn-outline-danger"
                                        @click="onClick(user, 'unblock')">
                                        Unblock
                                    </base-button>
                                    <base-button 
                                        v-else
                                        :disabled="user_self.id === user.id"
                                        class="btn-outline-danger"
                                        @click="onClick(user, 'block')">
                                        Block
                                    </base-button>
                                    <base-button 
                                        v-if="can('admin.user.delete')"
                                        :disabled="user_self.id === user.id"
                                        class="btn-outline-danger"
                                        @click="onClick(user, 'delete')">
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
import { LIST_USERS_QUERY, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from "@graphql/users.js";
import BaseButton from "@components/BaseButton.vue";
import BaseAvatar from "@components/BaseAvatar.vue";
import BaseTable from "@components/BaseTable.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import NameList from "@components/NameList.vue";

export default {
    name: "admin-user-list",
    components: {
        BIconXCircle,
        BIconCheckCircle,
        BIconQuestionCircle,
        BaseAvatar,
        BaseButton,
        NameList,
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
        async onClick(user, action) {
            if(this.user_self.id === user.id) {
                this.bootstrapControl.showToast("danger", "You cannot perform this on your own account");
                return;
            }

            switch(action) {
                case "approve":
                    return this.onApprove(user);

                case "block":
                    return this.onBlock(user);

                case "unblock":
                    return this.onUnblock(user);

                case "delete":
                    return this.onDelete(user);

                default:
                    this.bootstrapControl.showToast("danger", "Unknown action requested");
                    return;
            }

            
        },
        onApprove(user) {
            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.approveUser(user.id); },
                body: `Are you sure you want to approve: <strong>${user.username}</strong>?`,
                confirmButton: 'Approve'
            });
        },
        onBlock(user) {
            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.blockUser(user.id); },
                body: `Are you sure you want to block: <strong>${user.username}</strong>?`,
                confirmButton: 'Block'
            });
        },
        onUnblock(user) {
            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.unblockUser(user.id); },
                body: `Are you sure you want to unblock: <strong>${user.username}</strong>?`,
                confirmButton: 'Unblock'
            });
        },
        onDelete(user) {
            this.modalId = this.bootstrapControl.showModal({
                onConfirm: () => { this.deleteUser(user.id); },
                body: `Are you sure you want to delete: <strong>${user.username}</strong>?`,
                confirmButton: 'Delete'
            });
        },
        async approveUser(userId) {
            this.mutateUser(UPDATE_USER_MUTATION, { id: userId, approved: true }, "User approved", "Failed to approve the user, error:");
        },
        async blockUser(userId) {
            this.mutateUser(UPDATE_USER_MUTATION, { id: userId, blocked: true }, "User blocked", "Failed to block the user, error:");
        },
        async unblockUser(userId) {
            this.mutateUser(UPDATE_USER_MUTATION, { id: userId, blocked: false }, "User unblocked", "Failed to unblock the user, error:");
        },
        async deleteUser(userId) {
            this.mutateUser(DELETE_USER_MUTATION, { id: userId }, "User deleted", "Failed to delete the user, error:");
        },
        async mutateUser(gqlMutation, gqlVariables, successMessage, errorMessage) {
            let modalProps = this.bootstrapControl.getModalProperties(this.modalId);
            modalProps.loading = true;

            const { mutate: userMutation } = useMutation(gqlMutation, {
                fetchPolicy: 'network-only',
                variables: gqlVariables,
                refetchQueries: [
                    this.getGqlQueryName(LIST_USERS_QUERY)
                ]
            });

            userMutation()
            .then(() => {
                this.bootstrapControl.showToast("success", successMessage);
            })
            .catch(error => {
                this.bootstrapControl.showToast("danger", errorMessage + error);
            })
            .finally(() => {
                this.bootstrapControl.hideModal(this.modalId);
                modalProps.loading = false;
            });
        }
    }
};
</script>
