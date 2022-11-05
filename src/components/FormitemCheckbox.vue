<template>
    <div :class="classes">
        <input :checked="checked" class="form-check-input" type="checkbox" :id="id" :role="isSwitch ? 'switch' : ''">
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
        }
    },
    setup(props) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'list-item': true,
                'form-check': true,
                'form-switch': props.isSwitch
            }))
        }
    }
}
</script>
