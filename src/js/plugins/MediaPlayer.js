import {reactive} from "vue";
import {provideApolloClient, useQuery, useSubscription } from "@vue/apollo-composable";
import { LASTPLAYED_QUERY, REQUESTPLAYED_SUBSCRIPTION } from "@graphql/requests";
import dashjs from 'dashjs';
import {PlayerState} from "@models/PlayerState";

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

    get lastPlayedLoading() {
        return this.#state.lastPlayedLoading;
    }

    #updateLastPlayed(request) {
        this.#state.lastPlayed = request;

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

        this.#player = dashjs.MediaPlayer().create();
        this.#player.initialize(document.querySelector("#mediaPlayerSource"), null, false);

        // Start listening for events
        this.#listenForEvents();

        // Fetch initial data
        this.#onLastPlayedUpdate();

        this.#initialized = true;
    }

    #listenForEvents() {
        //DashJS Player: Loading
        this.#player.on(dashjs.MediaPlayer.events["STREAM_INITIALIZING"], () => this.#updatePlayerState(PlayerState.LOADING));
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_WAITING"], () => this.#updatePlayerState(PlayerState.LOADING));
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_STALLED"], () => this.#updatePlayerState(PlayerState.LOADING));

        //DashJS Player: Playing
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_PLAYING"], () => this.#updatePlayerState(PlayerState.PLAYING));

        //DashJS Player: Stopped
        this.#player.on(dashjs.MediaPlayer.events["ERROR"], () => this.#updatePlayerState(PlayerState.STOPPED));
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_ERROR"], () => this.#updatePlayerState(PlayerState.STOPPED));
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], () => this.#updatePlayerState(PlayerState.STOPPED));
        this.#player.on(dashjs.MediaPlayer.events["PLAYBACK_PAUSED"], () => this.#updatePlayerState(PlayerState.STOPPED));
    }

    #onLastPlayedUpdate() {
        const { loading, refetch, onResult } = useQuery(LASTPLAYED_QUERY, {
            fetchPolicy: 'cache-and-network'
        });

        this.#state.lastPlayedLoading = loading;

        onResult(result => {
            this.#updateLastPlayed(result.data.requests.data[0]);
        });

        // Refetch when a request has been played
        useSubscription(REQUESTPLAYED_SUBSCRIPTION).onResult(() => {
            console.log("request played called");
            refetch();
        });
    }

    play() {
        this.#player.attachSource(this.#broadcastUrl);
        this.#player.play();
    }

    stop() {
        this.#player.pause();
        this.#player.attachSource(null);

        //TODO figure out why this is needed. Event should work on its own.
        this.#updatePlayerState(PlayerState.STOPPED);
    }

    setVolume(volume) {
        this.#player.setVolume(volume);
    }
}

export const MediaPlayerPlugin = {
    install: (app, options) => {
        provideApolloClient(options.apolloClient);

        app.config.globalProperties.mediaPlayer = new MediaPlayer(options.broadcastUrl);
    }
}
