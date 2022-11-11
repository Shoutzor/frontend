<template>
    <div :class="classes">
        <input 
            v-model="checked" 
            :disabled="disabled"
            :id="id" :role="isSwitch ? 'switch' : ''"
            :data-name="name"
            class="form-check-input" 
            type="checkbox" 
            @change="onChange" />
        <div class="text-truncate">
            <label :for="id">
                <div class="text-body d-block">{{ name }}</div>
                <small v-if="description" class="d-block text-muted text-truncate mt-n1">{{ description }}</small>
            </label>
        </div>
    </div>
</template>

<script>
import { reactive, computed } from "vue";

export default {
    name: 'formitem-checkbox',
    emits: ['change'],
    props: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false,
            default: ''
        },
        isSwitch: {
            type: Boolean,
            required: false,
            default: false
        },
        checked: {
            type: Boolean,
            required: false,
            default: false
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props, {emit}) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'list-item': true,
                'form-check': true,
                'form-switch': props.isSwitch
            })),
            async onChange(e) {
                emit('change', e);
            }
        }
    }
}
</script>
