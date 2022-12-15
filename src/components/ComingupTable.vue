<template>
    <graphql-pagination
        :queryObj="COMINGUP_QUERY"
        :refreshObj="REQUESTADDED_SUBSCRIPTION"
        :limit="8"
        :hideControlsForSinglePage="true"
        v-slot="props"
        ref="pagination">
        <base-table description="Lists the media files that will be played next">
            <template #header>
                <tr>
                    <th scope="col" class="text-center"></th>
                    <th scope="col">Media</th>
                    <th scope="col">Requested by</th>
                    <th scope="col">Duration</th>
                </tr>
            </template>

            <template #default>
                <template v-if="props.isLoading">
                    <tr class="placeholder-glow">
                        <td class="text-center mediatype-column">
                            <span class="avatar mediatype placeholder"></span>
                        </td>
                        <td class="w-75">
                            <div><span class="placeholder col-7"></span></div>
                            <span class="placeholder placeholder-xs col-4"></span>
                        </td>
                        <td>
                            <span class="placeholder col-10"></span>
                        </td>
                        <td>
                            <span class="placeholder col-10"></span>
                        </td>
                    </tr>
                </template>

                <template v-else-if="props.error">
                    <tr>
                        <td colspan="4">Something went wrong while attempting to fetch the queue</td>
                    </tr>
                </template>

                <template v-else-if="props.itemsOnPage.length > 0">
                    <tr 
                        v-for="request in props.itemsOnPage" 
                        :key="request.id">
                        <td class="text-center mediatype-column">
                            <media-icon :is_video="request.media.is_video" />
                        </td>
                        <td>
                            <div>{{ request.media.title }}</div>
                            <artist-list :artists="request.media.artists" class="small text-muted"></artist-list>
                        </td>
                        <td>
                            <div v-if="request.requested_by !== null">{{ request.requested_by.username }}</div>
                            <div v-else>AutoDJ</div>
                        </td>
                        <td>
                            <beautified-time :seconds="request.media.duration"></beautified-time>
                        </td>
                    </tr>
                </template>

                <template v-else>
                    <tr>
                        <td colspan="4">No songs in queue</td>
                    </tr>
                </template>
            </template>
        </base-table>
    </graphql-pagination>
</template>

<script>
import { useSubscription } from "@vue/apollo-composable";
import {COMINGUP_QUERY, REQUESTADDED_SUBSCRIPTION, REQUESTPLAYED_SUBSCRIPTION} from "@graphql/requests";
import ArtistList from "@components/ArtistList.vue";
import BaseTable from "@components/BaseTable.vue";
import BeautifiedTime from "@components/BeautifiedTime.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import MediaIcon from "@components/MediaIcon.vue";

export default {
    name: "comingup-table",
    components: {
        ArtistList,
        BaseTable,
        BeautifiedTime,
        GraphqlPagination,
        MediaIcon
    },
    data() {
        return {
            COMINGUP_QUERY,
            REQUESTADDED_SUBSCRIPTION
        };
    },
    mounted() {
        useSubscription(REQUESTPLAYED_SUBSCRIPTION).onResult(() => {
            this.$refs.pagination.refresh();
        })
    }
}
</script>

<style lang="scss" scoped>
.table {
    thead td {
        border-bottom: 1px solid rgb(226, 227, 227);
    }

    .mediatype-column {
        width: 50px;
    }
}
</style>
