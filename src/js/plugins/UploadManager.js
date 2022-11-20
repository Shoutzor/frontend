import { reactive } from 'vue';
import { UPLOAD_MUTATION } from '@js/graphql/uploads';
import { formatTime } from '@js/helpers/timeHelper';

export class UploadManager {

    #app
    #apolloClient

    #state

    #fileReader
 
    constructor(app, apolloClient) {
        this.#app = app;
        this.#apolloClient = apolloClient;
        this.#fileReader = new FileReader();
        
        this.#state = reactive({
            isUploading: false,
            progress: 0,
            currentFile: null,
            files: []
        });
    }

    get isUploading() {
        return this.#state.isUploading;
    }

    get progress() {
        return this.#state.progress;
    }

    get currentFile() {
        return this.#state.currentFile;
    }

    get files() {
        return this.#state.files;
    }

    get totalFiles() {
        return this.files.length;
    }

    get validExtensions() {
        return this.#app.config.globalProperties.settings.getSettingValue('upload_allowed_extensions');
    }

    get maxFileSize() {
        return this.#app.config.globalProperties.settings.getSettingValue('upload_max_size');
    }

    get minDuration() {
        return this.#app.config.globalProperties.settings.getSettingValue('upload_min_duration');
    }

    get maxDuration() {
        return this.#app.config.globalProperties.settings.getSettingValue('upload_max_duration');
    }

    #showError(message) {
        this.#app.config.globalProperties.bootstrapControl.showToast("danger", message);
    }

    async uploadFiles(addedFiles) {
        //Check if there's anything to upload
        if (addedFiles.length === 0) {
            return;
        }

        // Iterate over addedFiles to add them all to the upload queue
        // Required because addedFiles isn't actually an array, but a FileList object
        for (let i = 0; i < addedFiles.length; i++) {
            let file = addedFiles.item(i);

            // Check if the file has an allowed extension
            if(!this.isValidExtension(this.getFileExtension(file.name))) {
                this.#showError(`"${file.name}" does not have an allowed file-extension`);
                continue;
            }

            // Check if any duration requirements have been set
            if(this.minDuration > 0 || this.maxDuration > 0) {
                // Wrap in try/catch as this might not be supported by all browsers
                try {
                    const d = await this.getDuration(file);
                
                    // Check if the duration is shorter then the minimum
                    if(d < this.minDuration) {
                        this.#showError(`"${file.name}" has a duration of ${formatTime(d)} which is less then the required minimum ${formatTime(this.minDuration)}`);
                        continue;
                    }

                    // Check if the duration is longer then the maximum
                    if(d > this.maxDuration) {
                        this.#showError(`"${file.name}" has a duration of ${formatTime(d)} which is larger then the maximum allowed ${formatTime(this.maxDuration)}`);
                        continue;
                    }
                }
                catch (e) {
                    // If any errors occured, ignore this client-side validation check.
                    // The only downside is that the file will be uploaded & processed before getting rejected by the server.
                }
            }

            this.#state.files.push(file);
        }

        // Check if any files passed the validation
        if(this.files.length === 0) {
            return;
        }

        // Check if we're already uploading a file
        if (this.isUploading === true) {
            return;
        }

        //Start the upload of the first file
        this.uploadNextFile();
    }

    uploadNextFile() {
        // Grab the first file from the stack
        let currentFile = this.#state.files.shift();

        // Check if the file has an allowed extension


        // Set uploading status to true
        this.#state.isUploading = true;
        this.#state.currentFile = currentFile.name;

        let formData = new FormData();
        formData.append("file", currentFile);

        this.#apolloClient.mutate({
            // Query
            mutation: UPLOAD_MUTATION,
            // Parameters
            variables: {
                file: currentFile
            },
            context: {
                fetchOptions: {
                    onProgress: (progress) => {
                        this.#state.progress = this.#calculateProgress(progress.loaded, progress.total);
                    }
                }
            }
        })
        .catch((error) => {
            this.#showError(this.parseError(error).message);
        })
        .finally(() => {
            //Update status variables
            this.#state.progress = 0;
            this.#state.currentFile = null;

            //Check if there are any remaining files to upload
            if (this.totalFiles > 0) {
                //Start the upload of the next file.
                this.uploadNextFile();
            } else {
                //We're finished with all queued files
                this.#state.isUploading = false;
            }
        });
    }

    parseError(error) {
        let code = error?.status;

        if(code) {
            switch(code) {
                case 401:
                    return { message: "You need to be logged in to upload files" };

                case 413:
                    return { message: "The file is too large" };
                
                case 500:
                    return { message: "An error occured while uploading, please try again later" };
            }
        }
        // Custom error code from ApolloUploadCustomFetch.js on timeout
        else if(error?.message === 'REQUEST_TIMEOUT') {
            return { message: "The upload has timed out" };
        }
        // Custom error code from ApolloUploadCustomFetch.js on error
        // Could mean multiple things, but this is something to implement another time.
        // CORS error would return a status code of 0 with nothing to indicate it being a CORS issue, see:
        // https://stackoverflow.com/questions/4844643/is-it-possible-to-trap-cors-errors
        else if(error?.message === 'REQUEST_FAILED') {
            return { message: "The upload failed due to an unknown reason (maybe too big?)" };
        }

        //Unknown error
        return {
            message: "A unknown error occured while uploading"
        };
    }

    async getDuration(file) {
        return new Promise((resolve, reject) => {
            this.#fileReader.onload = () => {
                const media = new Audio(this.#fileReader.result);
                media.onloadedmetadata = () => resolve(media.duration);
            }
            
            this.#fileReader.onerror = (error) => {
                reject(error);
            }

            this.#fileReader.readAsDataURL(file);
        });
    }

    #calculateProgress(loaded, total) {
        return Math.floor((loaded / total) * 100);
    }

    getFileExtension(filename) {
        // Credits: https://stackoverflow.com/a/12900504/1024322
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    isValidExtension(extension) {
        return this.validExtensions.indexOf(extension) >= 0;
    }
}

export const UploadManagerPlugin = {
    install: (app, options) => {
        app.config.globalProperties.uploadManager = new UploadManager(app, options.apolloClient);
    }
}
