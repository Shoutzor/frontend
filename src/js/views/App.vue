<template>
    <div v-if="!hasLoaded" class="w-100 h-100 d-flex flex-grow-1 align-items-center justify-content-center">
        <load-screen message="Loading, please wait"/>
    </div>

    <shoutzor v-else-if="hasAccess"/>
    <login-screen v-else/>

    <div class="position-relative bottom-0 order-3">
        <the-modalmanager />
        <the-toastmanager />
    </div>
</template>

<script>
import LoadScreen from "@components/LoadScreen.vue";
import Shoutzor from "@js/views/Shoutzor.vue";
import LoginScreen from "@components/LoginScreen.vue";
import TheModalmanager from "@components/TheModalmanager.vue";
import TheToastmanager from "@components/TheToastmanager.vue";

export default {
    name: "App",
    components: {
        TheModalmanager,
        TheToastmanager,
        LoadScreen,
        LoginScreen,
        Shoutzor
    },
    computed: {
        hasLoaded() {
            return this.auth.isInitialized;
        },
        hasAccess() {
            return this.can("website.access");
        }
    }
}
</script>
