<template>
    <div class="base-pagination">
        <slot></slot>

        <base-pagination-controls 
            v-if="totalPages > 1 || (totalPages < 2 && !hideControlsForSinglePage)"
            :current-page="currentPage"
            :total-pages="totalPages"
            :on-navigate="onNavigate"
            class="mt-2">
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
        hideControlsForSinglePage: {
            type: Boolean,
            default: false,
            required: false
        },
        onNavigate: {
            type: Function,
            required: true,
            default: (page) => {}
        }
    }
}
</script>
