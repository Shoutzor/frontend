import axios from 'axios';
import Echo from 'laravel-echo';
import mitt from 'mitt';
import Pusher from 'pusher-js';
import { createApp } from 'vue'
import {BootstrapIconsPlugin} from 'bootstrap-icons-vue';
import {DefaultApolloClient, provideApolloClient} from '@vue/apollo-composable'
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client/core'
import {createLighthouseSubscriptionLink} from "@thekonz/apollo-lighthouse-subscription-link";
import router from "@js/router";
import App from "@js/views/App.vue";
import { AuthenticationPlugin } from "@js/plugins/AuthenticationManager.js";
import { RequestManagerPlugin } from "@js/plugins/RequestManager.js";
import { MediaPlayerPlugin } from "@js/plugins/MediaPlayer.js";
import { BootstrapControlPlugin } from "@js/plugins/BootstrapControl.js";
import {UploadManagerPlugin} from "@js/plugins/UploadManager.js";

// Predefine instances
let emitter;
let echoClient : Echo;
let httpLink : HttpLink;
let apolloClient : ApolloClient<any>;

// Create the Vue App instance
const app = createApp(App);

// First, fetch the local config containing only the API_URL
fetch('/config.json')
.then(res => res.json())
.then(config => {
    // The UploadManager still uses Axios. Ideally this also should be replaced by GraphQL later on
    // Currently not the case because I haven't figured out how to track upload progress.
    axios.defaults.baseURL = config.APP_URL + '/api';
    axios.defaults.headers.common['Accept'] = 'application/json';

    emitter = mitt();
    (<any>window).Pusher = Pusher;

    echoClient = new Echo({
        broadcaster: 'pusher',
        key: config.MIX_PUSHER_APP_KEY,
        wsHost: config.MIX_PUSHER_SOCKET_HOST,
        wsPort: config.MIX_PUSHER_PORT,
        wssPort: config.MIX_PUSHER_PORT,
        forceTLS: config.MIX_PUSHER_SCHEME === 'https',
        encrypted: true,
        disableStats: true,
        enabledTransports: [config.MIX_PUSHER_SCHEME],
        authEndpoint: '/graphql/subscriptions/auth'
    });

    // HTTP connection to the API
    httpLink = new HttpLink({
        // You should use an absolute URL here
        uri: config.APP_URL + '/graphql',
        headers: {}
    });

    // Create the apollo client
    apolloClient = new ApolloClient({
        link: ApolloLink.from([
            createLighthouseSubscriptionLink(echoClient),
            httpLink
        ]),
        cache: new InMemoryCache(),
        connectToDevTools: config.APP_DEBUG,
        defaultOptions: {
            query: {
                fetchPolicy: 'cache-first',
            },
        }
    });

    app.provide(DefaultApolloClient, apolloClient);
    provideApolloClient(apolloClient);

    app.config.globalProperties.apollo = apolloClient;
    app.config.globalProperties.echo = echoClient;
    app.config.globalProperties.emitter = emitter;

    app.mixin({
        methods: {
            /**
             * ensures no html can be embedded in a string
             * @param input
             * @returns 
             */
            antiXSS(input : String) {
                return String(input)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            },

            /**
             * Formats the time in seconds to a readable format
             * @param seconds 
             * @returns 
             */
            formatTime(seconds: string) {
                const sec_num = parseInt(seconds, 10); // don't forget the second param
                const h = Math.floor(sec_num / 3600);
                const m = Math.floor((sec_num - (h * 3600)) / 60);
                const s = sec_num - (h * 3600) - (m * 60);
    
                let hrs = "";
                let mins = "";
                let secs = "";
    
                //If hours eq 0, hide it
                if (h > 0) {
                    if (h < 10) {
                        hrs = "0" + h + ":";
                    } else {
                        hrs = h + ":";
                    }
                }
    
                // Check if minutes and seconds are less then 10
                // if so, prepend a 0
                mins = (m < 10) ? "0" + m : "" + m;
                secs = (s < 10) ? "0" + s : "" + s;

                return hrs + mins + ':' + secs;
            }
        }
    });

    app
    .use(BootstrapControlPlugin)
    .use(AuthenticationPlugin, {
        tokenName: 'token',
        echoClient,
        httpClient: httpLink,
        apolloClient
    })
    .use(router(app.config.globalProperties.auth))
    .use(MediaPlayerPlugin, {
        broadcastUrl: config.BROADCAST_URL,
        apolloClient,
        echoClient
    })
    .use(UploadManagerPlugin, {
        echoClient
    })
    .use(RequestManagerPlugin)
    .use(BootstrapIconsPlugin)
    .mount('#shoutzor');
})
.catch(error => {
    console.error("An error occured while initializing", error);

    (<any>document).querySelector("#shoutzor .load-screen .center-block").innerHTML = '\
    <div class="alert alert-danger" role="alert">' +
        'An error occured while initializing; try reloading or contact an administrator.<br />'+
        '<strong>Error: </strong>'+error+
        (error?.stack ? '<br /><br /><strong>Stacktrace:</strong><br /><pre>' + error.stack + '</pre>' : '' ) + 
    '</div>';
});