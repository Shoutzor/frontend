import {createRouter, createWebHashHistory} from "vue-router";
import { AuthenticationManager } from "./plugins/AuthenticationManager";

import Dashboard from "@js/views/main/dashboard.vue";
import History from "@js/views/main/history.vue";
import Upload from "@js/views/main/upload.vue";
import Artist from "@js/views/main/artist.vue";
import Album from "@js/views/main/album.vue";
import Search from "@js/views/main/search.vue";
import Register from "@js/views/main/register.vue";
import Profile from "@js/views/main/profile.vue";

import AdminDashboard from "@js/views/admin/dashboard.vue";
import AdminUserList from "@js/views/admin/user/list.vue";
import AdminUserEdit from "@js/views/admin/user/edit.vue";
import AdminRoleList from "@js/views/admin/role/list.vue";
import AdminRoleCreate from "@js/views/admin/role/create.vue";
import AdminRoleEdit from "@js/views/admin/role/edit.vue";
import AdminSettings from "@js/views/admin/settings.vue";

const routes = [
        {
            name: 'dashboard',
            path: '/',
            component: Dashboard,
            meta: {
                requiresPermission: "website.access"
            }
        },
        {
            name: 'history',
            path: '/history',
            component: History,
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'popular',
            path: '/popular',
            component: Dashboard,
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'upload',
            path: '/upload',
            component: Upload,
            meta: {
                requiresPermission: "website.upload",
                requiresAuth: true
            }
        }, {
            name: 'artist',
            path: '/artist/:id',
            component: Artist,
            props: ({ params } : { params : { id: String }}) => ({
                id: params.id || null
            }),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'album',
            path: '/album/:id',
            component: Album,
            props: ({params} : { params : { id: String }}) => ({
                id: params.id || null
            }),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'search',
            path: '/search',
            component: Search,
            meta: {
                requiresPermission: "website.search"
            }
        }, {
            name: 'register',
            path: '/register',
            component: Register,
            meta: {
                requiresAuth: false
            }
        }, {
            name: 'admin',
            path: '/admin',
            redirect: {
                name: 'admin-dashboard'
            },
            meta: {
                requiresPermission: 'admin.access'
            },
            children: [
                {
                    name: 'admin-dashboard',
                    path: 'dashboard',
                    component: AdminDashboard,
                    meta: {
                        requiresPermission: "admin.access",
                        requiresAuth: true
                    }
                }, {
                    name: 'admin-user',
                    path: 'users',
                    redirect: {
                        name: 'admin-user-list'
                    },
                    children: [
                        {
                            name: 'admin-user-list',
                            path: 'list',
                            component: AdminUserList,
                            meta: {
                                requiresPermission: "admin.user.list",
                                requiresAuth: true
                            }
                        }, {
                            name: 'admin-user-edit',
                            path: 'edit/:userId',
                            component: AdminUserEdit,
                            props: ({params} : { params : { userId: String } }) => ({
                                userId: params.userId || null
                            }),
                            meta: {
                                requiresPermission: "admin.user.edit",
                                requiresAuth: true
                            }
                        }
                    ]
                }, {
                    name: 'admin-role',
                    path: 'roles',
                    redirect: {
                        name: 'admin-role-list'
                    },
                    children: [
                        {
                            name: 'admin-role-list',
                            path: 'list',
                            component: AdminRoleList,
                            meta: {
                                requiresPermission: "admin.role.list",
                                requiresAuth: true
                            }
                        }, {
                            name: 'admin-role-create',
                            path: 'create',
                            component: AdminRoleCreate,
                            meta: {
                                requiresPermission: "admin.role.create",
                                requiresAuth: true
                            }
                        }, {
                            name: 'admin-role-edit',
                            path: 'edit/:roleId',
                            component: AdminRoleEdit,
                            props: ({params} : { params : { roleId: Number } }) => ({
                                roleId: Number.parseInt(params.roleId+"", 10) || null
                            }),
                            meta: {
                                requiresPermission: "admin.role.edit",
                                requiresAuth: true
                            }
                        }
                    ]
                },
                {
                    name: 'admin-settings',
                    path: 'settings',
                    component: AdminSettings,
                    meta: {
                        requiresPermission: "admin.settings",
                        requiresAuth: true
                    }
                }
            ]
        }
    ];


export default function (authManager : AuthenticationManager) {
    const router = createRouter({ 
        history: createWebHashHistory(), 
        routes 
    });

    /**
     * Checks if the user is authorized to access the route
     * if not, the user will be redirected back to the root of the app
     * Checks if the targeted path is '/' in order to prevent infinite
     * loops.
     */
    router.beforeEach(async (to, from) => {
        if(!authManager.isInitialized) {
            await authManager.isInitializedPromise;
        }

        if("meta" in to) {
            const m = to.meta;

            // If requiresPermission is set, check if the user has the required permission.
            if ("requiresPermission" in m && authManager.can(m.requiresPermission) === false) {
                return (to.fullPath === '/') ? false : '/';
            }

            // If requiresAuth is set, check if the user is (un)authenticated (permission-based is preferred)
            if ("requiresAuth" in m && authManager.isAuthenticated === !m.requiresAuth) {
                return (to.fullPath === '/') ? false : '/';
            }
        }

        // Everything checks out, allow the navigation to continue
        return true;
    });

    return router;
}