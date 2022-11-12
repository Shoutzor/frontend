<template>
    <div class="base-pagination">
        <slot></slot>

        <base-pagination-controls 
            v-model="currentPageIntermediate"
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
    emits: ['update:currentPage'],
    data() {
        return {
            currentPageIntermediate: this.currentPage
        }
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
    },
    watch: {
        currentPageIntermediate(newValue) {
            this.$emit('update:currentPage', newValue);
        }
    }
}
</script>
