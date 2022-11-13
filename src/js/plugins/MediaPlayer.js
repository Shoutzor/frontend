import {reactive} from "vue";
import {provideApolloClient, useQuery} from "@vue/apollo-composable";
import { LASTPLAYED_QUERY } from "@graphql/requests";
import dashjs from 'dashjs';
import {PlayerState} from "@models/PlayerState";

export class MediaPlayer {

    #initialized

    #broadcastUrl
    #echoClient
    #state

    #player

    constructor(broadcastUrl, echoClient) {
        this.#initialized = false;

        this.#broadcastUrl = broadcastUrl;
        this.#echoClient = echoClient;
        this.#state = reactive({
            lastPlayed: null,
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

    #updateLastPlayed(request) {
        this.#state.lastPlayed = request;
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
        this.#echoClient.channel('shoutzor').listen('LastPlayedUpdated', () => {
            this.#onLastPlayedUpdate();
        });

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
        const { onResult } = useQuery(LASTPLAYED_QUERY, {
            fetchPolicy: 'cache-and-network'
        });

        onResult(result => {
            this.#updateLastPlayed(result.data.requests.data[0]);
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

        app.config.globalProperties.mediaPlayer = new MediaPlayer(options.broadcastUrl, options.echoClient);
    }
}
