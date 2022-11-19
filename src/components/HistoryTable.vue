<template>
    <graphql-pagination
        :queryObj="HISTORY_QUERY"
        :refreshObj="REQUESTPLAYED_SUBSCRIPTION"
        :limit="8"
        :hideControlsForSinglePage="false"
        v-slot="props"
        ref="pagination">
        <base-table
            :hoverable="true"
            class="table-vcenter text-nowrap"
            description="Lists the media files that have been played previously">
            <template #header>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">Media</th>
                    <th scope="col">Requested by</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Time played</th>
                </tr>
            </template>
            <template #default v-slot>
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
                        <td colspan="4">Something went wrong while attempting to fetch the history</td>
                    </tr>
                </template>

                <template v-else-if="props.itemsOnPage.length > 0">
                    <tr v-for="request in props.itemsOnPage" :key="request.id">
                        <td class="text-center mediatype-column">
                            <media-icon :is_video="request.media.is_video" />
                        </td>
                        <td>
                            <div>{{ request.media.title }}</div>
                            <artist-list :artists="request.media.artists" class="small text-muted"></artist-list>
                        </td>
                        <td>
                            <div v-if="request.requested_by">{{ request.requested_by.username }}</div>
                            <div v-else>AutoDJ</div>
                        </td>
                        <td>
                            <beautified-time :seconds="request.media.duration"></beautified-time>
                        </td>
                        <td>
                            <div>{{ request.played_at }}</div>
                        </td>
                    </tr>
                </template>

                <template v-else>
                    <tr>
                        <td colspan="4">No media played yet</td>
                    </tr>
                </template>
            </template>
        </base-table>
    </graphql-pagination>
</template>

<script>
import {HISTORY_QUERY, REQUESTPLAYED_SUBSCRIPTION} from "@graphql/requests";
import ArtistList from "@components/ArtistList.vue";
import BaseTable from "@components/BaseTable.vue";
import BeautifiedTime from "@components/BeautifiedTime.vue";
import GraphqlPagination from "@components/GraphqlPagination.vue";
import MediaIcon from "@components/MediaIcon.vue";
import UserList from "@components/UserList.vue";

export default {
    name: 'history-table',
    components: {
        ArtistList,
        BaseTable,
        BeautifiedTime,
        GraphqlPagination,
        MediaIcon,
        UserList
    },
    data() {
        return {
            HISTORY_QUERY,
            REQUESTPLAYED_SUBSCRIPTION
        }
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

        .avatar.mediatype {
            font-size: 24px !important;
        }
    }
}
</style>
