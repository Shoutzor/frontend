<template>
    <form class="upload-area" enctype="multipart/form-data" method="post">
        <div class="box_input">
            <b-icon-cloud-upload class="box_icon"></b-icon-cloud-upload>

            <input
                id="file"
                class="box_file"
                data-multiple-caption="{count} files selected"
                multiple
                name="files[]"
                type="file"
                @change="onFileSelect" />

            <label v-if="dragOver" for="file">
                <span class="box_dragndrop">Drop your file here</span>
            </label>
            <label v-else for="file">
                <span class="action">Select a file</span>
                <span class="box_dragndrop"> or drag it here</span>
                <span class="requirements">Allowed extensions: {{ allowedExtensions }}</span>
                <span 
                    v-if="maxFilesize > 0"
                    class="filesize">Files must be smaller then {{ maxFilesize }}MB</span>

                <span 
                    v-if="minDuration > 0 && maxDuration > 0"
                    class="duration">
                    Duration must be between {{ formatTime(minDuration) }} - {{ formatTime(maxDuration) }}
                </span>
                <span v-else-if="minDuration > 0"
                    class="duration">
                    Duration must be longer then {{ formatTime(minDuration) }}
                </span>
                <span v-else-if="maxDuration > 0"
                    class="duration">
                    Duration must be shorter then {{ formatTime(maxDuration) }}
                </span>
            </label>
        </div>
    </form>
</template>

<script>
export default {
    name: "upload-area",

    data: () => ({
        dragTimer: null,
        dragOver: false,
        test: null
    }),

    mounted() {
        document.querySelector('body').addEventListener('dragover', this.onDragOver);
        document.querySelector('body').addEventListener('dragleave', this.onDragLeave);
        document.querySelector('.upload-area').addEventListener('drop', this.onDrop);
    },

    beforeUnmount() {
        document.querySelector('body').removeEventListener('dragover', this.onDragOver);
        document.querySelector('body').removeEventListener('dragleave', this.onDragLeave);
        document.querySelector('.upload-area').removeEventListener('drop', this.onDrop);
    },
    computed: {
        allowedExtensions() {
            return this.uploadManager.validExtensions.join(', ');
        },
        maxFilesize() {
            return this.uploadManager.maxFileSize;
        },
        minDuration() {
            return this.uploadManager.minDuration;
        },
        maxDuration() {
            return this.uploadManager.maxDuration;
        }
    },
    methods: {
        onDragOver(e) {
            e.preventDefault();

            // Prevent running the queryselector + classlist modifiers on every single dragover event
            // which is basically triggered on every pixel movement
            if(this.dragOver) {
                return;
            }

            this.dragOver = true;
            document.querySelector(".upload-area").classList.add("showarea");
        },

        onDragLeave(e) {
            // Only trigger when the dragleave event has no related target (ie: left the <body>)
            if(e.relatedTarget) {
                return;
            }

            this.dragOver = false;
            document.querySelector(".upload-area").classList.remove("showarea");
        },

        onDrop(e) {
            e.preventDefault();
            let dt = e.dataTransfer;
            if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.contains('Files'))) {
                this.uploadManager.uploadFiles(e.dataTransfer.files);
            }

            this.onDragLeave(e);
        },

        onFileSelect(e) {
            if (e.target.files !== undefined) {
                this.uploadManager.uploadFiles(e.target.files);
            }
        }
    }
}
</script>

<style lang="scss">
.upload-area {
    padding: 25px 20px;
    background-color: $black;
    outline: 2px dashed $dark;
    outline-offset: -10px;
    color: $secondary;

    &.showarea {
        background-color: $secondary;
        outline-color: $dark;
        color: $dark;
    }

    .box_input {
        text-align: center;

        .box_icon {
            width: 100%;
            height: 50px;
            display: block;
            margin-bottom: 10px;
            stroke-width: 1;
        }

        .box_file {
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            position: absolute;
            z-index: -1;
        }

        label {
            font-size: 23px;
            max-width: 80%;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
            display: inline-block;
            overflow: hidden;

            .action {
                color: $primary;
            }

            .box_dragndrop {
                display: inline;
            }

            .requirements, .filesize, .duration {
                display: block;
                font-size:14px;
            }
        }
    }
}
</style>