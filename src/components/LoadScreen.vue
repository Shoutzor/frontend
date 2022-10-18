<template>
    <div class="load-screen text-center">
        <ShoutzorLogo alt="Shoutz0r logo" />
        <div class="center-block">
            <BaseSpinner class="mt-5"/>

            <div v-if="message.length > 0" class="mt-3">
                <p>{{ message }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import ShoutzorLogo from "@static/images/shoutzor-logo.svg";
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
.load-screen {
    opacity: 1 !important;
    z-index: 99999 !important;

    svg {
        max-width: 25%;
        max-height: 25%;
        fill: $white;
    }
}
</style>