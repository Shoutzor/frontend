/**
 * Helper class to parse the GraphQL errors
 * These errors "should" be conform to the Laravel MessageBag format
 * 
 * Currently only supports:
 * - Validation
 */
export class MessageBagParser {

    #validationErrors

    constructor(errors) {
        let validationErrors = {};
        errors?.filter(e => e.extensions.category === 'validation')?.map(e => e.extensions.validation).forEach(element => {
            Object.keys(element).forEach(error => {
                if(error in validationErrors) {
                    validationErrors[error] = validationErrors[error].contact(element[error]);
                } else {
                    validationErrors[error] = element[error];
                }
            });
        });
        this.#validationErrors = validationErrors;
    }

    get allValidationErrors() {
        return this.#validationErrors;
    }
    
    get hasValidationErrors() {
        return Object.keys(this.#validationErrors).length > 0;
    }

    getValidationErrorsList() {
        return Object.values(this.#validationErrors).reduce((a, b) => a.concat(b), []);
    }

    getValidationErrors(key) {
        if(
            this.#validationErrors !== null && 
            key in this.#validationErrors
        ) {
            return this.#validationErrors[key];
        }
        
        return null;
    }
}

export const MessageBagParserPlugin = {
    install: (app) => {
        /**
         * Add `parseMessageBag` mixin method
         * Can be used in Vue templates to parse GraphQL errors
         */
         app.mixin({
            methods: {
                parseMessageBag: function(errors) {
                    return new MessageBagParser(errors);
                }
            }
        });
    }
}
