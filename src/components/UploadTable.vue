<template>
    <graphql-pagination
                :queryObj="GET_UPLOADS_QUERY"
                :queryVars="queryVars"
                :refreshObj="UPLOAD_UPDATED_SUBSCRIPTION"
                :limit="8"
                v-slot="props"
                class="mt-2"
                ref="pagination">
        <base-table
            v-if="!props.isLoading && !props.error"
            class="upload-manager card-table"
            description="Lists all uploaded files and their processing status">
            <template #header>
                <tr>
                    <th scope="col">File</th>
                    <th scope="col">Status</th>
                </tr>
            </template>
            <template v-slot>
                <template v-if="props.itemsOnPage.length > 0">
                    <tr v-for="upload in props.itemsOnPage">
                        <td class="min" style="min-width: 400px;">
                            {{ upload.original_filename }}
                        </td>
                        <td>
                            <upload-status-badge :status="upload.status" />
                        </td>
                    </tr>
                </template>
                <tr v-else>
                    <td colspan="2">There are no uploads awaiting processing (completed uploads are not shown here)</td>
                </tr>
            </template>
        </base-table>
    </graphql-pagination>
</template>

<script>
import { useSubscription } from "@vue/apollo-composable";
import { GET_UPLOADS_QUERY, UPLOAD_CREATED_SUBSCRIPTION, UPLOAD_UPDATED_SUBSCRIPTION, UPLOAD_DELETED_SUBSCRIPTION } from "@graphql/uploads";
import BaseTable from "@components/BaseTable.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import UploadStatusBadge from "@components/UploadStatusBadge.vue";

export default {
    name: "upload-table",
    components: {
        BaseTable,
        GraphqlPagination,
        UploadStatusBadge
    },
    data() {
        return {
            GET_UPLOADS_QUERY,
            UPLOAD_UPDATED_SUBSCRIPTION,
            queryVars: {
                orderBy: [{
                    column: "STATUS",
                    order: "DESC"
                }, {
                    column: "UPLOADED_AT",
                    order: "ASC"
                }],
                where: {
                    column: "UPLOADED_BY",
                    operator: "EQ",
                    value: this.auth.user.id
                }
            }
        }
    },
    mounted() {
        useSubscription(UPLOAD_CREATED_SUBSCRIPTION).onResult(() => {
            this.$refs.pagination.refresh();
        })

        useSubscription(UPLOAD_DELETED_SUBSCRIPTION).onResult(() => {
            this.$refs.pagination.refresh();
        })
    }
}
</script>
