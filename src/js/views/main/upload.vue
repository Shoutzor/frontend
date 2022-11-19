<template>
    <div class="row row-cards">
        <div class="col-sm-12">
            <upload-area></upload-area>
        </div>
    </div>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h2 class="category-header">File Uploads</h2>
            <upload-progress></upload-progress>
        </div>
    </div>
    <div class="row row-cards">
        <div class="col-sm-12">
            <h2 class="category-header">Upload processing queue</h2>
            <p>Files that have been succesfully uploaded and not yet processed will be shown here</p>
            <upload-table class="card p-2"></upload-table>
        </div>
    </div>
</template>

<script>
import UploadArea from "@components/UploadArea.vue";
import UploadProgress from "@components/UploadProgress.vue";
import UploadTable from "@components/UploadTable.vue";

export default {
    name: "upload-view",

    components: {
        UploadProgress,
        UploadArea,
        UploadTable
    }
};
</script>
