<template>
    <base-pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :hideControlsForSinglePage="hideControlsForSinglePage"
        :on-navigate="onNavigate"
        >
        <slot :itemsOnPage="itemsOnPage" :isLoading="isLoading" :error="error">
            <template v-if="isLoading">
                <base-spinner />
            </template>

            <template 
                v-else-if="error"
                :refresh="refresh">
                <p>Failed loading the data</p>
                <base-button @click="refresh">Retry</base-button>
            </template>    
        </slot>
    </base-pagination>
</template>

<script>
import {computed, reactive} from "vue";
import { useQuery, useSubscription } from "@vue/apollo-composable";
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
        queryVars: {
            type: Object,
            required: false,
            default: {}
        },
        refreshObj: {
            type: Object,
            required: false,
            default: null
        },
        refreshVars: {
            type: Object,
            required: false,
            default: null
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
        hideControlsForSinglePage: {
            type: Boolean,
            required: false,
            default: false
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
            itemsOnPage: [],
            refetch: null
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
        const { 
            onResult,
            refetch,
            loading,
            error
        } = useQuery(
            this.queryObj, 
            this.getQueryVars(), 
            {
                fetchPolicy: this.cachePolicy
            }
        );

        this.isLoading = loading;
        this.error = error;
        this.refetch = refetch;

        onResult((result) => {
            const data = result.data[Object.keys(result.data)[0]];
            this.totalPages = data.paginatorInfo.lastPage;
            this.itemsOnPage = data.data;

            // If the current page is no longer available, move to the last available page
            if(this.currentPage > this.totalPages) {
                this.loadPage(this.totalPages);
            }
        });

        if(this.refreshObj) {
            // Refresh query when a subscription event is received
            const s = useSubscription(this.refreshObj, this.refreshVars);
            s.onResult((result) => {
                refetch();
            });
        }
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
            this.refetch(this.getQueryVars());
        },
        getQueryVars() {
            return Object.assign({
                page: this.currentPage,
                limit: this.limit,
                where: this.where
            }, this.queryVars);
        }
    }
}
</script>
