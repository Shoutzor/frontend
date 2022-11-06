<template>
    <div class="list list-row">
        <template v-if="permissions.length > 0">
            <permission-item
                v-for="(permission, index) in permissions"
                :key="permission.name"
                :hasPermission="activePermissions.indexOf(permission.name) !== -1"
                :permission="permission"
                @change="onChange" />
        </template>
    </div>
</template>

<script>
import PermissionItem from "@components/PermissionItem.vue";

export default {
    components: {
        PermissionItem
    },
    emits: ['change'],
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
        }
    },
    setup(props, {emit}) {
        return {
            async onChange(e) {
                emit('change', e);
            }
        }
    }
}
</script>
