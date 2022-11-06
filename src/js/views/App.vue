<template>
    <div v-if="!hasLoaded" class="d-flex flex-grow-1 align-items-center justify-content-center">
        <load-screen message="Loading, please wait"/>
    </div>

    <shoutzor v-else-if="hasAccess"/>
    <login-screen v-else/>
</template>

<script>
import LoadScreen from "@components/LoadScreen.vue";
import Shoutzor from "@js/views/Shoutzor.vue";
import LoginScreen from "@components/LoginScreen.vue";

export default {
    name: "App",
    components: {
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
