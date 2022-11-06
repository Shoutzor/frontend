<template>
    <formitem-checkbox 
        :id="'permission_'+permission.name"
        :name="permission.name"
        :description="permission.description"
        :isSwitch="true"
        :checked="hasPermission"
        :data-permission="permission.name"
        />
</template>

<script>
import FormitemCheckbox from '@components/FormitemCheckbox.vue';

export default {
    name: 'permission-item',
    components: {
        FormitemCheckbox
    },
    props: {
        permission: {
            type: Object,
            required: true
        },
        hasPermission: {
            type: Boolean,
            required: true
        }
    }
}
</script>
