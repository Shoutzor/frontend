<template>
    <div class="form-group">
        <label v-if="showLabel" class="form-label mb-0">{{ name }}</label>
        <div v-if="description !== ''" class="form-text mt-0 mb-2">{{ description }}</div>
        <div>
            <base-input
                v-model="value"
                :id="id"
                :type="type"
                :disabled="disabled"
                :name="name"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                />
        </div>
    </div>
</template>

<script>
import BaseInput from "@components/BaseInput.vue";

export default {
    name: 'formitem-input',
    emits: ['update:modelValue'],
    components: {
        BaseInput
    },
    props: {
        showLabel: {
            type: Boolean,
            required: false,
            default: true
        },
        id: {
            type: String,
            required: false
        },
        name: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: false,
            default: ''
        },
        type: {
            type: String,
            required: false,
            default: 'text'
        },
        description: {
            type: String,
            required: false,
            default: ''
        },
        modelValue: {
            type: [ String, Number ],
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        autocomplete: {
            type: String,
            required: false,
            default: "off"
        }
    },
    data() {
        return {
            value: this.modelValue
        };
    },
    watch: {
        value(newValue) {
            this.$emit('update:modelValue', newValue);
        }
    }
}
</script>
