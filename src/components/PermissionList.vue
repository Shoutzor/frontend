<template>
    <form-checkbox-list
        v-model:items="checklistPermissions"
        :asSwitches="true" />
</template>

<script>
import FormCheckboxList from "@components/FormCheckboxList.vue";

export default {
    components: {
        FormCheckboxList
    },
    emits: ['update:hasPermissions'],
    props: {
        permissions: {
            type: Array,
            required: true,
            default: []
        },
        hasPermissions: {
            type: Array,
            required: true,
            default: []
        }
    },
    data() {
        return {
            checklistPermissions: this.permissions.map(p => {
                return {
                    ...p,
                    id: `permission_${p.name}`,
                    checked: this.hasPermissions.map(p => p.name).indexOf(p.name) !== -1
                }
            })
        }
    },
    watch: {
        checklistPermissions: {
            handler(newValue) {
                const newPermissions = newValue.filter(p => p.checked).map(p => p.name);

                this.$emit('update:hasPermissions', this.permissions.filter(p => {
                    return newPermissions.indexOf(p.name) !== -1;
                }));
            },
            deep: true
        }
    }
}
</script>
