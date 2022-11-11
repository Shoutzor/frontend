<template>
    <form-checkbox-list
        :items="items"
        :asSwitches="false" />
</template>

<script>
import FormCheckboxList from "@components/FormCheckboxList.vue";

export default {
    components: {
        FormCheckboxList
    },
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
    computed: {
        activeRoles() {
            return this.hasRoles.map(r => r.name);
        },
        items() {
            return this.roles.map(r => {
                return {
                    ...r,
                    id: `role_${r.name}`,
                    checked: this.activeRoles.indexOf(r.name) !== -1
                }
            });
        }
    }
}
</script>
