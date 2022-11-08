<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h1 class="mb-4">Manage Users</h1>

            <graphql-pagination
                :queryObj="LIST_USERS_QUERY"
                :limit="8"
                v-slot="props"
            >
                <base-table
                    description="Lists all user accounts"
                    :hoverable="true"
                    >
                    <template #header>
                        <tr>
                            <th>Username</th>
                            <th>Role(s)</th>
                            <th>Actions</th>
                        </tr>
                    </template>
                    <template #default>
                        <tr v-if="props.itemsOnPage.length > 0"
                            v-for="user in props.itemsOnPage"
                        >
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
                                    <base-button class="ms-2 btn-outline-danger">Delete</base-button>
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
import { LIST_USERS_QUERY } from "@graphql/users.js";
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
            LIST_USERS_QUERY
        };
    }
};
</script>
