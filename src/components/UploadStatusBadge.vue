<template>
    <base-badge class="p-2" :type="type">{{ statusMessage }}</base-badge>
</template>

<script>
import {computed, reactive} from "vue";
import BaseBadge from "./BaseBadge.vue";

export default {
    name: 'upload-status-badge',

    components: {
        BaseBadge
    },

    props: {
        status: {
            type: Number,
            required: true
        }
    },

    setup(props) {
        props = reactive(props);

        // Status codes can be found in the backend Upload-model (App\Models\Upload)

        return {
            type: computed(() => {
                switch(props.status) {
                    //QUEUED
                    case 0:
                        return 'secondary';

                    //PROCESSING
                    case 1:
                        return 'info';

                    //FAILED_RETRY = Processing failed, will try again
                    //FAILED_FINAL = Processing failed, retries exhausted
                    case 3:
                    case 4:
                        return 'danger';

                    default:
                        return 'secondary';
                }
            }),
            statusMessage: computed(() => {
                switch(props.status) {
                    //QUEUED
                    case 0:
                        return 'Queued';

                    //PROCESSING
                    case 1:
                        return 'Processing';

                    //FAILED_RETRY = Processing failed, will try again
                    //FAILED_FINAL = Processing failed, retries exhausted
                    case 3:
                        return 'Failed, will retry';

                    case 4:
                        return 'Failed, retries exhausted';

                    default:
                        return 'Unknown';
                }
            })
        }
    }
};
</script>
