<template>
    <input
        v-model="value"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :class="classes"
        :autocomplete="autocomplete"
        @input="handleInput"
        :aria-label="name"/>
</template>

<script>
import {computed, reactive} from "vue";

export default {
    name: 'base-input',
    emits: ['update:modelValue'],
    data() {
        return {
            value: this.modelValue
        }
    },
    props: {
        type: {
            type: String,
            required: false,
            default: 'text',
            validator: function (value) {
                return ['text', 'password', 'email'].indexOf(value) !== -1;
            }
        },
        name: {
            type: String,
            required: false
        },
        modelValue: {
            type: String,
            required: false
        },
        placeholder: {
            type: String,
            required: false
        },
        autocomplete: {
            type: String,
            required: false
        },
        size: {
            type: String,
            required: false,
            default: 'normal',
            validator: function (value) {
                return ['small', 'normal', 'large'].indexOf(value) !== -1;
            }
        },
        hasError: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'form-control': true,
                'form-control-sm': props.size === 'small',
                'form-control-lg': props.size === 'large',
                'is-invalid': props.hasError
            }))
        }
    },
    watch: {
        value(newValue) {
            this.$emit('update:modelValue', newValue);
        }
    }
}
</script>
