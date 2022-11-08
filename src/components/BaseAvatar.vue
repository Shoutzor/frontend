<template>
    <span :class="classes">
        <slot></slot>
    </span>
</template>

<script>
import {computed, reactive} from "vue";

export default {
    name: 'base-avatar',

    props: {
        type: {
            type: String,
            required: true,
            validator: function (value) {
                return ['primary', 'secondary', 'danger', 'warning', 'info', 'success'].indexOf(value) !== -1;
            },
            default: 'info'
        }
    },

    setup(props) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'avatar': true,
                [`text-bg-${props.type}`]: true
            }))
        }
    }
};
</script>

<style>
.avatar > svg {
    width: 1.5rem;
    height: 1.5rem;
}
</style>