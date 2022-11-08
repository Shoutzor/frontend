<template>
    <span :class="classes">
        <slot></slot>
    </span>
</template>

<script>
import {computed, reactive} from "vue";

export default {
    name: 'base-badge',

    props: {
        type: {
            type: String,
            required: true,
            validator: function (value) {
                return ['primary', 'secondary', 'danger', 'warning', 'info', 'success'].indexOf(value) !== -1;
            },
            default: 'info'
        },
        rounded: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    setup(props) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'badge': true,
                [`text-bg-${props.type}`]: true,
                'rounded-pill': props.rounded
            }))
        }
    }
};
</script>
