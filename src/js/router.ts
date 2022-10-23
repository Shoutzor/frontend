import {createRouter, createWebHashHistory} from "vue-router";
import { AuthenticationManager } from "./plugins/AuthenticationManager";

import Dashboard from "@js/views/main/dashboard.vue";
import History from "@js/views/main/history.vue";
import Upload from "@js/views/main/upload.vue";
import Artist from "@js/views/main/artist.vue";
import Album from "@js/views/main/album.vue";
import Search from "@js/views/main/search.vue";

import AdminDashboard from "@js/views/admin/dashboard.vue";
import AdminUserList from "@js/views/admin/user/list.vue";
import AdminRoleList from "@js/views/admin/role/list.vue";
import AdminRoleEdit from "@js/views/admin/role/list.vue";

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
            props: ({params}) => ({
                id: params.id || null
            }),
            meta: {
                requiresPermission: "website.access"
            }
        }, {
            name: 'album',
            path: '/album/:id',
            component: Album,
            props: ({params}) => ({
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
            name: 'profile',
            path: '/profile',
            component: Dashboard,
            meta: {
                requiresPermission: "website.profile",
                requiresAuth: true
            }
        },
        {
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
                    name: 'admin-users',
                    path: 'users',
                    redirect: {
                        name: 'admin-users-list'
                    },
                    children: [
                        {
                            name: 'admin-users-list',
                            path: 'list',
                            component: AdminUserList,
                            meta: {
                                requiresPermission: "admin.user.list",
                                requiresAuth: true
                            }
                        }
                    ]
                }, {
                    name: 'admin-roles',
                    path: 'roles',
                    redirect: {
                        name: 'admin-roles-list'
                    },
                    children: [
                        {
                            name: 'admin-roles-list',
                            path: 'list',
                            component: AdminRoleList,
                            meta: {
                                requiresPermission: "admin.role.list",
                                requiresAuth: true
                            }
                        }, {
                            name: 'admin-roles-edit',
                            path: 'edit/:roleId',
                            component: AdminRoleEdit,
                            props: ({params}) => ({
                                roleId: Number.parseInt(params.roleId+"", 10) || null
                            }),
                            meta: {
                                requiresPermission: "admin.role.edit",
                                requiresAuth: true
                            }
                        }
                    ]
                }
            ]
        }
    ];


export default function (authManager : AuthenticationManager) {
    const router = createRouter({ 
        history: createWebHashHistory(), 
        routes 
    });

    router.beforeEach(async (to, from) => {
        if(!authManager.isInitialized) {
            await authManager.isInitializedPromise;
        }

        if("meta" in to) {
            let m = to.meta;

            // If requiresPermission is set, check if the user has the required permission.
            if ("requiresPermission" in m && authManager.can(m.requiresPermission) === false) {
                return false;
            }

            // If requiresAuth is set, check if the user is authenticated (permission-based is preferred)
            if ("requiresAuth" in m && m.requiresAuth === true && authManager.isAuthenticated === false) {
                return false;
            }
        }

        // Everything checks out, allow the navigation to continue
        return true;
    });

    return router;
}