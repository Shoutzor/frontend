<template>
    <information-header :image="coverImage" class="nowplaying">
        <template v-if="isLoading">
            <p class="placeholder placeholder-wave placeholder-lg col-8"></p>
            <span class="placeholder placeholder-wave placeholder-sm col-5"></span>
        </template>
        <template v-else-if="request">
            <h3>{{ request.media.title }}</h3>
            <artist-list :artists="request.media.artists"></artist-list>

            <div class="d-flex align-items-center mt-auto">
                <div class="requested-by pl-3">
                    <small class="text-muted me-1">Requested by</small>
                    <template v-if="request.requested_by">{{ request.requested_by.username }}</template>
                    <template v-else>AutoDJ</template>
                </div>
            </div>
        </template>
        <template v-else>
            <h3>Information Unavailable</h3>
            <span>Failed to load information</span>
        </template>
    </information-header>
</template>

<script>
import ArtistList from "@components/ArtistList.vue";
import UserList from "@components/UserList.vue";

import InformationHeader from "@components/InformationHeader.vue";

export default {
    name: "now-playing",
    components: {
        InformationHeader,
        ArtistList,
        UserList
    },
    computed: {
        request() { 
            return this.mediaPlayer.lastPlayed; 
        },
        coverImage() {
            return this.mediaPlayer.lastPlayedImage;
        },
        isLoading() {
            return this.mediaPlayer.lastPlayedLoading;
        }
    }
}
</script>

<style lang="scss">
.nowplaying .item-content {
    .artists {
        font-size: 1rem;
        margin-bottom: 0.2rem;
    }

    .requested-by {
        border-left: 1px solid $white;
        padding-left: 5px;

        .text-muted {
            color: $secondary !important;
        }
    }

    .downvote {
        margin: 0 10px;
    }
}
</style>