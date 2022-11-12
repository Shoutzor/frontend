<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h2 class="category-header">History</h2>
            <history-table></history-table>
        </div>
    </div>
</template>

<script>
import HistoryTable from "@components/HistoryTable.vue";

export default {
    name: "history-view",
    components: {
        HistoryTable
    }
};
</script>
