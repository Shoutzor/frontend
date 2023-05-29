import {reactive} from "vue";
import {provideApolloClient, useQuery, useSubscription } from "@vue/apollo-composable";
import { LASTPLAYED_QUERY, REQUESTPLAYED_SUBSCRIPTION } from "@graphql/requests";
import IcecastMetadataPlayer from "icecast-metadata-player";
import {PlayerState} from "@models/PlayerState";
import {defaultMediaImage} from "../config";

export class MediaPlayer {

    #initialized

    #broadcastUrl
    #state
    #positionUpdater

    #player

    constructor(broadcastUrl) {
        this.#initialized = false;

        this.#broadcastUrl = broadcastUrl;
        this.#positionUpdater = null;
        this.#state = reactive({
            lastPlayed: null,
            lastPlayedLoading: true,
            lastPlayedImage: defaultMediaImage,
            playerStatus: PlayerState.STOPPED,
            trackPosition: 0
        });
    }

    get playerStatus() {
        return this.#state.playerStatus;
    }

    #updatePlayerState(state) {
        this.#state.playerStatus = state;
    }

    get lastPlayed() {
        return this.#state.lastPlayed;
    }

    get lastPlayedImage() {
        return this.#state.lastPlayedImage;
    }

    get lastPlayedLoading() {
        return this.#state.lastPlayedLoading;
    }

    #updateLastPlayed(request) {
        this.#state.lastPlayed = request;
        this.#state.lastPlayedImage = this.#getLastPlayedImage();

        if(this.#positionUpdater) {
            clearInterval(this.#positionUpdater);
            this.#updateTrackPosition(0);
        }

        if(this.#state.lastPlayed?.played_at) {
            // Laravel (the backend) is configured to set all timestamp strings to UTC format
            let played_at = Date.parse(this.#state.lastPlayed.played_at + ' UTC') / 1000;
            let duration = this.#state.lastPlayed.media.duration;

            this.#positionUpdater = setInterval(() => {
                let current = new Date().getTime() / 1000;
                let position = current - played_at;

                if(position > duration) {
                    position = duration;
                }

                this.#updateTrackPosition(position);
            }, 1000);
        }
    }

    #getLastPlayedImage() {
        if(this.lastPlayed?.media?.image) {
            return this.lastPlayed?.media?.image;
        }
        
        if(this.lastPlayed?.media?.albums) {
            let result = null;
            this.lastPlayed?.media?.albums.forEach((a) => {
                if(a.image) {
                    result = a.image;
                }
            });

            if(result !== null) {
                return '/images/albums/' + result;
            }
        }

        return defaultMediaImage;
    }

    get trackPosition() {
        return this.#state.trackPosition;
    }

    #updateTrackPosition(seconds) {
        this.#state.trackPosition = seconds;
    }

    initialize() {
        if(this.#initialized) {
            return;
        }

        this.#player = new IcecastMetadataPlayer(this.#broadcastUrl, {
            retryTimeout: 0,
            metadataTypes: [],
            onLoad: () => {
                this.#updatePlayerState(PlayerState.LOADING);
            },
            onPlay: () => {
                this.#updatePlayerState(PlayerState.PLAYING);
            },
            onStop: () => {
                this.#updatePlayerState(PlayerState.STOPPED);
            }
        });

        // Fetch initial data
        this.#onLastPlayedUpdate();

        this.#initialized = true;
    }

    #onLastPlayedUpdate() {
        const { loading, refetch, onResult } = useQuery(LASTPLAYED_QUERY, {
            fetchPolicy: 'cache-and-network'
        });

        this.#state.lastPlayedLoading = loading;

        onResult(result => {
            // There's currently a bug where partial results are returned.
            if(result.partial) {
                return;
            }

            this.#updateLastPlayed(result.data.requests.data[0]);
        });

        // Refetch when a request has been played
        useSubscription(REQUESTPLAYED_SUBSCRIPTION).onResult(() => {
            refetch();
        });
    }

    play() {
        this.#player.play();
    }

    stop() {
        this.#player.stop();
    }

    setVolume(volume) {
        this.#player.audioElement.volume = volume;
    }
}

export const MediaPlayerPlugin = {
    install: (app, options) => {
        provideApolloClient(options.apolloClient);

        app.config.globalProperties.mediaPlayer = new MediaPlayer(options.broadcastUrl);
    }
}
