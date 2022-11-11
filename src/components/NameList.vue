<template>
    <div class="roles">
        <template v-if="names.length === 0">{{ emptyMessage }}</template>
        <template v-else>
            <span 
                v-for="(name, index) in names"
                :key="name">
                <template v-if="index != 0">, </template>
                {{ name }}
            </span>
        </template>
    </div>
</template>

<script>
export default {
    name: 'name-list',
    props: {
        names: {
            type: Array,
            default: [],
            required: true
        },
        emptyMessage: {
            type: String,
            default: '',
            required: false
        }
    }
}
</script>
