import axios from 'axios';
import Echo from 'laravel-echo';
import mitt from 'mitt';
import Pusher from 'pusher-js';
import { createApp } from 'vue'
import {BootstrapIconsPlugin} from 'bootstrap-icons-vue';
import {DefaultApolloClient, provideApolloClient} from '@vue/apollo-composable'
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache, concat } from '@apollo/client/core'
import {createLighthouseSubscriptionLink} from "@thekonz/apollo-lighthouse-subscription-link";
import { createUploadLink } from 'apollo-upload-client';
import CustomFetch from '@js/plugins/ApolloUploadCustomFetch.js';
import router from "@js/router";
import App from "@js/views/App.vue";
import { MessageBagParserPlugin } from "@js/plugins/MessageBagParser.js"
import { AuthenticationPlugin } from "@js/plugins/AuthenticationManager.js";
import { SettingsPlugin } from "@js/plugins/SettingsManager.js";
import { RequestManagerPlugin } from "@js/plugins/RequestManager.js";
import { MediaPlayerPlugin } from "@js/plugins/MediaPlayer.js";
import { BootstrapControlPlugin } from "@js/plugins/BootstrapControl.js";
import {UploadManagerPlugin} from "@js/plugins/UploadManager.js";
import { DocumentNode } from 'graphql/language/ast';
import { getOperationName, Observable } from "@apollo/client/utilities";
import { antiXSS } from '@js/plugins/SanitizationPlugin';

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
        key: config.PUSHER_APP_KEY,
        wsHost: config.PUSHER_HOST,
        wsPort: config.PUSHER_PORT,
        wssPort: config.PUSHER_PORT,
        forceTLS: config.PUSHER_SCHEME === 'https',
        encrypted: true,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: config.APP_URL + '/graphql/subscriptions/auth'
    });

    // HTTP connection to the API
    httpLink = createUploadLink({
        uri: config.APP_URL + '/graphql',
        fetch: CustomFetch
    });
    
    const authMiddleware = new ApolloLink((operation, forward) => {
        // add the authorization to the headers
        operation.setContext(() => {
            const token = app?.config?.globalProperties?.auth?.token;
            return {
                headers: {
                    ...operation.getContext().headers,
                    authorization: (token) ? `Bearer ${token}` : null,
                }
            }
        });
      
        return forward(operation);
    })

      
    // Create the apollo client
    apolloClient = new ApolloClient({
        link: ApolloLink.from([
            authMiddleware,
            createLighthouseSubscriptionLink(echoClient),
            httpLink
        ]),
        cache: new InMemoryCache(),
        connectToDevTools: config.APP_DEBUG,
        defaultOptions: {
            query: {
                fetchPolicy: 'network-only',
            }
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
                return antiXSS(input);
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
            },

            /**
             * Helper function as workaround for @vue/apollo using an outdated
             * version of @apollo/client; therefor not accepting a DocumentNode
             * as `refetchQueries` parameter in `useMutation`.
             * This helper function gets the query name from the DocumentNode.
             * Once https://github.com/vuejs/apollo/issues/1427 is solved
             * this helper function is no longer needed.
             * 
             * @param query a gql DocumentNode object
             * @returns the query name
             */
            getGqlQueryName(query: DocumentNode) {
                return getOperationName(query);
            }
        }
    });

    app
    .use(MessageBagParserPlugin)
    .use(BootstrapControlPlugin)
    .use(SettingsPlugin, {
        apolloClient
    })
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
        apolloClient
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