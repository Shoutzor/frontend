<template>
    <div class="audio-player d-flex flex-wrap mt-auto justify-content-between container-fluid">
        <div
            class="media-info d-inline-flex flex-grow-1 flex-shrink-0 flex-basis-0 align-items-center order-1 order-md-0">
            <div class="album-image d-inline-block pe-1">
                <img class="rounded" :src="coverImage" alt="media image"/>
            </div>
            <div class="track-info d-inline-block">
                <span v-if="isLoading" class="track-title">Loading..</span>
                <template v-else-if="nowplaying">
                    <span class="track-title">{{ nowplaying.media.title }}</span>
                    <template v-if="nowplaying.media.artists.length > 0">
                        <artist-list :artists="nowplaying.media.artists" class="text-muted"/>
                    </template>
                    <template v-else>
                        <div class="text-muted artist">Unknown Artist</div>
                    </template>
                </template>
                <span v-else class="track-title">Now playing: Unavailable</span>
            </div>
        </div>
        <div
            class="media-control-container d-flex flex-fill flex-column flex-wrap align-items-center order-0 order-md-1 pt-1">
            <div class="media-controls d-flex flex-fill align-items-center justify-content-center">
                <b-icon-hand-thumbs-up 
                    v-if="isAuthenticated && votingEnabled && nowplaying" 
                    @click="onUpvoteClick"
                    class="upvote me-3" />
                <play-button 
                    @click="onPlayClick" 
                    :state="playerStatus" 
                    class="mt-1"></play-button>
                <b-icon-hand-thumbs-down 
                    v-if="isAuthenticated && votingEnabled && nowplaying"
                    @click="onDownvoteClick" 
                    class="downvote ms-3" />
            </div>

            <base-progressbar
                :pre-text="timePassed"
                :post-text="timeDuration"
                :current-value="percentagePlayed || 0"
                class="col d-flex flex-fill" />
        </div>
        <div
            class="extra-control d-inline-flex flex-md-grow-1 flex-md-shrink-0 flex-basis-0 align-items-center justify-content-end order-2">
            <div class="video-control" v-if="videoEnabled && playerStatus === PlayerState.PLAYING"
                 @click="onVideoClick">
                <b-icon-tv/>
            </div>

            <div class="volume-control btn-group dropup">
                <b-icon-volume-up data-bs-toggle="dropdown" data-bs-auto-close="outside"/>
                <div class="dropdown-menu bg-dark" v-on:click.stop>
                    <vue-slider
                        v-model="volume"
                        direction="btt"
                        v-bind:max="100"
                        v-bind:min="0"/>
                </div>
            </div>
        </div>

        <video id="mediaPlayerSource"></video>
    </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import {Dropdown} from 'bootstrap';

import {PlayerState} from "@models/PlayerState";
import BaseProgressbar from "@components/BaseProgressbar.vue";
import PlayButton from "@components/PlayButton.vue";
import ArtistList from "@components/ArtistList.vue";
import BaseSpinner from "@components/BaseSpinner.vue";

export default {
    name: 'the-mediaplayer',
    components: {
        BaseSpinner,
        BaseProgressbar,
        Dropdown,
        VueSlider,
        PlayButton,
        ArtistList
    },
    data() {
        return {
            volume: 100,
            votingEnabled: false,
            PlayerState
        }
    },
    mounted() {
        this.mediaPlayer.initialize();
    },
    computed: {
        isLoading() { return this.mediaPlayer.lastPlayedLoading; },
        isAuthenticated() { return this.auth.isAuthenticated; },
        playerStatus() { return this.mediaPlayer.playerStatus; },
        videoEnabled() { return false; },
        nowplaying() { return this.mediaPlayer.lastPlayed; },
        coverImage() { return this.mediaPlayer.lastPlayedImage; },
        timePassed() {
            let p = this.mediaPlayer.trackPosition;
            return (!p && p !== 0) ? null : this.formatTime(p);
        },
        timeDuration() {
            let d = this.mediaPlayer.lastPlayed?.media?.duration;
            return (!d && d !== 0) ? null : this.formatTime(d);
        },

        percentagePlayed() {
            let p = this.mediaPlayer.trackPosition;
            let d = this.mediaPlayer.lastPlayed?.media?.duration;

            return (!p || !d) ? 0 : Math.round((p / d) * 100);
        }
    },
    watch: {
        volume: function(val, _oldVal) {
            if(val > 0) {
                //Convert the int to a double
                val = val / 100;
            }

            this.mediaPlayer.setVolume(val);
        }
    },
    methods: {
        onPlayClick() {
            if(this.playerStatus === PlayerState.STOPPED) {
                this.mediaPlayer.play();
            } else {
                this.mediaPlayer.stop();
            }
        },
        onVideoClick() {
            // Showing the video, so hide it
            if(this.showingVideo === true) {
                this.hideVideo();
            }
            // Not showing the video yet, show it
            else {
                this.showVideo();
            }
        },
        onUpvoteClick() {
            // TODO
        },
        onDownvoteClick() {
            // TODO
        },
        showVideo() {
            document.querySelector("#mediaPlayerSource").classList.add("visible");
            document.querySelector("#video-control").classList.add("active");
            this.showingVideo = true;
            this.setHighVideoQuality();
        },
        hideVideo() {
            document.querySelector("#mediaPlayerSource").classList.remove("visible");
            document.querySelector("#video-control").classList.remove("active");
            this.showingVideo = false;
            this.setLowVideoQuality();
        },
        setLowVideoQuality() {
            this.player.updateSettings({'streaming': {'abr': {'autoSwitchBitrate': {'video': false}}}});
            this.player.setQualityFor("video", 0);
        },
        setHighVideoQuality() {
            this.player.updateSettings({'streaming': {'abr': {'autoSwitchBitrate': {'video': true}}}});
        }
    }
}
</script>

<style lang="scss">
#mediaPlayerSource {
    display: none;
    &.visible {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
    }
}

.audio-player {
    .media-info {
        .album-image > * {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
        }

        .artists {
            font-size: 0.8rem;
        }
    }

    .media-control-container {

        @include media-breakpoint-up(md) {
            max-width: 300px;
        }

        @include media-breakpoint-up(lg) {
            max-width: 500px;
        }

        @include media-breakpoint-down(md) {
            flex-basis: 100% !important;
            margin-bottom: map-get($spacers, 2);
        }

        & > div {
            width: 100%;
        }

        .upvote {
            cursor: pointer;
            width: 1.2rem;
            height: 1.2rem;
        }

        .downvote {
            cursor: pointer;
            width: 1.2rem;
            height: 1.2rem;
        }

        .progress {
            height: 0.25rem;
        }
    }

    .extra-control {

        a {
            color: inherit;
        }

        svg {
            width: 1.3rem;
            height: 1.3rem;
        }

        .video-control {
            cursor: pointer;

            &.active {
                color: $primary;
            }
        }

        .volume-control {
            cursor: pointer;

            .dropdown-menu {
                min-width: 22px;
                max-width: 22px;
                height: 140px;

                .vue-slider {
                    height: 100% !important;
                }
            }
        }
    }
}
</style>