<template>
    <form-checkbox-list
        v-model:items="checklistRoles"
        :asSwitches="false" />
</template>

<script>
import FormCheckboxList from "@components/FormCheckboxList.vue";

export default {
    components: {
        FormCheckboxList
    },
    emits: ['update:hasRoles'],
    props: {
        roles: {
            type: Array,
            required: true,
            default: []
        },
        hasRoles: {
            type: Array,
            required: true,
            default: []
        }
    },
    data() {
        return {
            checklistRoles: this.roles.map(r => {
                return {
                    ...r,
                    id: `permission_${r.name}`,
                    checked: this.hasRoles.map(r => r.name).indexOf(r.name) !== -1
                }
            })
        }
    },
    watch: {
        checklistRoles: {
            handler(newValue) {
                const newRoles = newValue.filter(r => r.checked).map(r => r.name);

                this.$emit('update:hasRoles', this.roles.filter(r => {
                    return newRoles.indexOf(r.name) > -1;
                }));
            },
            deep: true
        }
    }
}
</script>
