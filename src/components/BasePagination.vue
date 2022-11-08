<template>
    <div class="base-pagination">
        <slot></slot>

        <base-pagination-controls 
            v-model="currentPage"
            :total-pages="totalPages"
            :on-navigate="onNavigate">
        </base-pagination-controls>
    </div>
</template>

<script>
import BasePaginationControls from "@components/BasePaginationControls.vue";

export default {
    name: 'base-pagination',
    components: {
        BasePaginationControls
    },
    props: {
        currentPage: {
            type: Number,
            default: 1,
            required: true
        },
        totalPages: {
            type: Number,
            default: 1,
            required: true
        },
        onNavigate: {
            type: Function,
            required: true,
            default: (page) => {}
        }
    }
}
</script>
