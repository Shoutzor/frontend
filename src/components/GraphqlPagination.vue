<template>
    <base-pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :on-navigate="onNavigate"
        >
        <slot name="loading" v-if="isLoading">
            <base-spinner />
        </slot>

        <slot name="error" :refresh="refresh" v-else-if="error">
            <p>Failed loading the data</p>
            <base-button @click="refresh">Retry</base-button>
        </slot>

        <slot :itemsOnPage="itemsOnPage" v-else></slot>
    </base-pagination>
</template>

<script>
import {computed, reactive} from "vue";
import { useQuery } from "@vue/apollo-composable";
import BaseButton from "@components/BaseButton.vue";
import BaseSpinner from "@components/BaseSpinner.vue";
import BasePagination from "@components/BasePagination.vue";

export default {
    name: 'graphql-pagination',
    components: {
        BaseButton,
        BaseSpinner,
        BasePagination
    },
    props: {
        queryObj: {
            type: Object,
            required: true
        },
        cachePolicy: {
            type: String,
            required: false,
            default: 'cache-and-network'
        },
        limit: {
            type: Number,
            required: false,
            default: 10
        },
        where: {
            type: Object,
            required: false,
            default: {}
        },
        beforePageChange: {
            type: Function,
            required: false,
            default: () => {}
        },
        afterPageChange: {
            type: Function,
            required: false,
            default: () => {}
        },
        afterPageChangeError: {
            type: Function,
            required: false,
            default: () => {}
        }
    },
    data() {
        return {
            isLoading: true,
            error: null,
            currentPage: 1,
            totalPages: 1,
            itemsOnPage: []
        }
    },
    setup(props) {
        props = reactive(props);

        return {
            classes: computed(() => ({
                'pagination': true,
                'pagination-sm': props.size === 'small',
                'pagination-lg': props.size === 'large',
                'justify-content-start': props.justify === 'start',
                'justify-content-center': props.justify === 'center',
                'justify-content-end': props.justify === 'end',
            }))
        }
    },
    mounted() {
        this.loadPage(1);
    },
    methods: {
        async onNavigate(page) {
            // Prevent queries when no change is taking place
            // or when the query is already loading
            if(this.currentPage === page || this.isLoading === true) {
                return;
            }

            await this.loadPage(page);
        },
        async refresh() {
            this.loadPage(this.currentPage);
        },
        async loadPage(page) {
            this.currentPage = page;

            const { 
                onResult,
                loading,
                error
            } = useQuery(this.queryObj, {
                variables: {
                    page: this.currentPage,
                    limit: this.limit,
                    where: this.where
                }
            }, {
                fetchPolicy: this.cachePolicy
            });

            this.isLoading = loading;
            this.error = error;

            onResult((result) => {
                const data = result.data[Object.keys(result.data)[0]];
                this.totalPages = data.paginatorInfo.lastPage;
                this.itemsOnPage = data.data;
            });
        }
    }
}
</script>
