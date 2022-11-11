<template>
    <form-checkbox-list
        :items="items"
        :asSwitches="true" />
</template>

<script>
import FormCheckboxList from "@components/FormCheckboxList.vue";

export default {
    components: {
        FormCheckboxList
    },
    props: {
        permissions: {
            type: Array,
            required: true
        },
        hasPermissions: {
            type: Array,
            required: true
        }
    },
    computed: {
        activePermissions() {
            return this.hasPermissions.map(p => p.name);
        },
        items() {
            return this.permissions.map(p => {
                return {
                    ...p,
                    id: `permission_${p.name}`,
                    checked: this.activePermissions.indexOf(p.name) !== -1
                }
            });
        }
    }
}
</script>
