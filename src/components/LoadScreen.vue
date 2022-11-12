<template>
    <div class="load-screen text-center">
        <shoutzor-logo alt="Shoutz0r logo" class="logo" />

        <div class="center-block">
            <BaseSpinner />
            <div v-if="message.length > 0" class="mt-3">
                <p>{{ message }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import ShoutzorLogo from "@static/images/shoutzor-logo.svg?component";
import BaseSpinner from "@components/BaseSpinner.vue";

export default {
    name: 'LoadScreen',
    components: {
        ShoutzorLogo,
        BaseSpinner
    },
    props: {
        message: {
            type: String,
            required: false,
            default: ''
        }
    }
}
</script>

<style lang="scss">
/**
 * Uses the same styling as defined in /assets/scss/custom-theme/_style.scss
 */
</style>