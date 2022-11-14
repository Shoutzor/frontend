import axios from 'axios';
import {reactive} from "vue";
import {useMutation} from "@vue/apollo-composable";

import {
    REGISTER_MUTATION,
    FORGOT_PASSWORD_MUTATION,
    RESEND_VERIFY_EMAIL_MUTATION,
    LOGIN_MUTATION, 
    LOGOUT_MUTATION, 
    WHOAMI_MUTATION, 
    GUEST_PERMISSIONS_QUERY
} from "@graphql/auth";
import { BIconReplyAll } from 'bootstrap-icons-vue';

export class AuthenticationManager {
    #app

    #initializedPromise

    #echoClient
    #httpClient
    #apolloClient

    #tokenName;
    #token;
    #guestPermissions;
    #state;

    constructor(app, tokenName, echoClient, httpClient, apolloClient) {
        this.#app = app;
        this.#tokenName = tokenName;
        this.#echoClient = echoClient;
        this.#httpClient = httpClient;
        this.#apolloClient = apolloClient;

        this.#token = null;
        this.#guestPermissions = [];

        this.#state = reactive({
            isInitialized: false,
            user: null,
            permissions: []
        });

        this.#initializedPromise = this.#initialize();
    }

    /*
        Getters
     */

    get isInitialized() {
        return this.#state.isInitialized;
    }

    get isInitializedPromise() {
        return this.#initializedPromise;
    }

    get isAuthenticated() {
        return this.#state.user !== null;
    }

    get token() {
        return this.#token;
    }

    get user() {
        return this.#state.user;
    }

    /*
        Setters
     */

    #setUser(user) {
        this.#state.user = user;
    }

    // Sets the new permissions that the user has; the can() method uses these to determine its output
    #setPermissions(permissions) {
        this.#state.permissions = permissions;
    }

    // Sets the token to be used by the frontend
    #setToken(token) {
        this.#token = token;
        localStorage.setItem(this.#tokenName, token);

        axios.defaults.headers.common.Authorization = 'Bearer ' + token;
        this.#echoClient.connector.options.auth.headers.Authorization = "Bearer " + token;
        this.#httpClient.options.headers.Authorization = "Bearer " + token;
    }

    // Removes the token to be used by the frontend
    #removeToken() {
        this.#token = null;
        localStorage.removeItem(this.#tokenName);

        delete axios.defaults.headers.common.Authorization;
        delete this.#echoClient.connector.options.auth.headers.authorization;
        delete this.#httpClient.options.headers.authorization;
    }

    async #initialize() {
        return new Promise(async (resolve, reject) => {
            let token = localStorage.getItem(this.#tokenName);
            let sessionPromise = null;
            let guestPermissionsPromise = await this.#updateGuestPermissions();

            if(!!token) {
                this.#setToken(token);
                sessionPromise = this.#resumeSession();
                sessionPromise.catch(() => {
                    // If resumeSession failed, this will ensure the guest permissions are set correctly
                    this.#invalidateSession();
                })
            }
            else {
                this.#invalidateSession();
            }

            // Once all promises are resolved, the AuthenticationManager has finished initializing
            Promise.allSettled([guestPermissionsPromise, sessionPromise])
                .finally(() => {
                    resolve(true);
                });
        })
        .then(() => {
            this.#state.isInitialized = true;
        });
    }

    #resumeSession() {
        return new Promise((resolve, reject) => {
            if(!!!this.#token) {
                return reject("No token configured");
            }

            this.#updateUser()
                .then(() => {
                    resolve(true);
                })
                .catch(error => {
                    console.error("Failed to login using saved token, reason", error);
                    this.#showError("Failed to automatically login, please try manually");
                    reject(error);
                });
        });
    }

    #updateGuestPermissions() {
        return new Promise((resolve, reject) => {
            this.#apolloClient.query({
                query: GUEST_PERMISSIONS_QUERY
            })
            .then((result) => {
                let permissions = result.data?.role?.permissions;
                this.#guestPermissions = (permissions === null) ? [] : permissions.map(p => p.name);
                resolve();
            })
            .catch((error) => {
                this.#guestPermissions = [];
                reject("Failed updating the guest permissions");
            });
        });
    }

    // This function will attempt to load the user object who is the owner of the token
    #updateUser() {
        return new Promise((resolve, reject) => {
            const { mutate: whoamiMutate } = useMutation(WHOAMI_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            whoamiMutate()
                .then(result => {
                    this.#setUser(result.data.whoami.user);
                    this.#setPermissions(result.data.whoami.user.allPermissions.map(p => p.name));
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    #invalidateSession() {
        this.#setUser(null);
        this.#setPermissions(this.#guestPermissions);
        this.#removeToken();
    }

    #showError(message) {
        this.#app.config.globalProperties.bootstrapControl.showToast("danger", message);
    }

    #showSuccess(message) {
        this.#app.config.globalProperties.bootstrapControl.showToast("success", message);
    }

    #showInfo(message) {
        this.#app.config.globalProperties.bootstrapControl.showToast("info", message);
    }

    async #useToken(token) {
        return new Promise((resolve, reject) => {
            this.#setToken(token);
            this.#updateUser()
                .then(() => {
                    this.#showSuccess("You are now logged in");
                    resolve(true);
                })
                .catch(error => {
                    console.error("Failed to get user information, reason", error);
                    this.#showError("Failed to get user information, please try again");
                    reject(false);
                });
        });
    }

    can(permission) {
        return this.#state.permissions.includes(permission);
    }

    resendEmailVerification(username) {
        return new Promise((resolve, reject) => {
            const { mutate: resendEmailVerificationMutate } = useMutation(RESEND_VERIFY_EMAIL_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            resendEmailVerificationMutate({
                input: {
                    username,
                },
            }).then(result => {
                if(result?.data?.resendEmailVerification?.status === 'EMAIL_SENT') {
                    this.#showInfo('If the username exists and is not verified yet, you will receive an email shortly');
                    resolve(true);
                }
                else {
                    this.#showError('Server returned an unexpected response');
                    resolve(false);
                }
                
            }).catch(error => {
                this.#showError(error);
                reject(error);
            });
        });
    }

    forgotPassword(username) {
        return new Promise((resolve, reject) => {
            const { mutate: forgotPasswordMutate } = useMutation(FORGOT_PASSWORD_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            forgotPasswordMutate({
                input: {
                    username,
                },
            }).then(result => {
                const msg = result?.data?.forgotPassword?.message;
                if(result?.data?.forgotPassword?.status === 'EMAIL_SENT') {
                    this.#showInfo(msg ?? 'An email with instructions to reset your password has been sent');
                    resolve(true);
                } else {
                    this.#showError(msg ?? 'The server returned an unexpected response');
                    resolve(false);
                }
            }).catch(error => {
                this.#showError(error);
                reject(error);
            });
        });
    }

    register(username, email, password, password_confirmation) {
        return new Promise((resolve, reject) => {
            const { mutate: registerMutate } = useMutation(REGISTER_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            // Registers the user
            // `status` can contain either SUCCESS or MUST_VERIFY_EMAIL
            // if SUCCESS, `token` will contain the user's access token
            registerMutate({
                input: {
                    username,
                    email,
                    password,
                    password_confirmation
                },
            }).then(result => {
                const status = result?.data?.register?.status;
                switch(status) {
                    case "SUCCESS":
                        this.#showSuccess("Registration complete!");
                        this.#useToken(result.data.register.token)
                            .then((res) => resolve(true))
                            .catch((res) => reject(res));
                        break;

                    case "MANUAL_APPROVE_REQUIRED":
                        this.#showInfo("Your account needs to be approved before you can login");
                        resolve(false);
                        break;

                    case "MUST_VERIFY_EMAIL":
                        this.#showInfo("You need to verify your email before you can login");
                        resolve(false);
                        break;

                    default:
                        this.#showError(`Registration returned unknown response: ${status}`);
                        reject(false);
                        return;
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            const { mutate: loginMutate } = useMutation(LOGIN_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            // Fetch the token using username / password authentication
            loginMutate({
                input: {
                    username,
                    password,
                },
            }).then(result => {
                this.#useToken(result.data.login.token)
                    .then((res) => resolve(res))
                    .catch((res) => reject(res));
            }).catch(error => {
                reject(error);
            });
        });
    }

    logout() {
        return new Promise((resolve, reject) => {
            const { mutate: logoutMutate } = useMutation(LOGOUT_MUTATION, {
                fetchPolicy: 'no-cache'
            });

            logoutMutate()
                .then(() => {
                    this.#invalidateSession();
                    this.#showSuccess("You are now signed out");
                    resolve(true);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

export const AuthenticationPlugin = {
    install: (app, options) => {
        const auth = new AuthenticationManager(app, options.tokenName, options.echoClient, options.httpClient, options.apolloClient)
        app.config.globalProperties.auth = auth;

        /**
         * Add `can` mixin method
         * Can be used in Vue templates to determine whether or not to show elements
         */
        app.mixin({
            methods: {
                can: function(permission) {
                    return auth.can(permission);
                }
            }
        });
    }
}
