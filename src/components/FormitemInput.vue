<template>
    <div class="form-group">
        <label class="form-label">Name</label>
        <div>
            <base-input 
                :name="name"
                :value="value"
                :placeholder="name"
                />
            <input :disabled="role.protected"
                :value="role.name"
                autocomplete="off"
                class="form-control"
                placeholder="Role name" type="text" />
        </div>
    </div>
    
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
    name: 'formitem-input',
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
        value: {
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
