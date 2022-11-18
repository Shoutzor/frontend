import { useMutation } from '@vue/apollo-composable';
import { reactive } from 'vue';
import { UPLOAD_MUTATION } from '@js/graphql/uploads';

export class UploadManager {

    #app
    #apolloClient
    #echoClient

    #state

    constructor(app, apolloClient, echoClient) {
        this.#app = app;
        this.#apolloClient = apolloClient;
        this.#echoClient = echoClient;

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

    #showError(message) {
        this.#app.config.globalProperties.bootstrapControl.showToast("danger", message);
    }

    uploadFiles(addedFiles) {
        //Check if there's anything to upload
        if (addedFiles.length === 0) {
            return;
        }

        // Iterate over addedFiles to add them all to the upload queue
        // Required because addedFiles isn't actually an array, but a FileList object
        for (let i = 0; i < addedFiles.length; i++) {
            let file = addedFiles.item(i);
            this.#state.files.push(file);
        }

        //Check if we're already uploading a file
        if (this.isUploading === true) {
            return;
        }

        //Start the upload of the first file
        this.uploadNextFile();
    }

    uploadNextFile() {
        // Grab the first file from the stack
        let currentFile = this.#state.files.shift();

        // TODO check if file is a valid media format
        // These extensions should be dynamically fetched / updated (echo-subscription?)

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
        .then(({data}) => {
            console.log("upload response: ", data.upload);
            //On success?
            //this.message = response.data.message;
        })
        .catch((error) => {
            console.dir({error});
            this.#showError(this.parseError(error).message);
        })
        .finally(() => {
            console.log("finally called");
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
            return { message: "The upload failed due to an unknown reason" };
        }

        //Unknown error
        return {
            message: "A unknown error occured while uploading"
        };
    }

    #calculateProgress(loaded, total) {
        return Math.floor((loaded / total) * 100);
    }
}

export const UploadManagerPlugin = {
    install: (app, options) => {
        app.config.globalProperties.uploadManager = new UploadManager(app, options.apolloClient, options.echoClient);
    }
}
