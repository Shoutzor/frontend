<template>
    <div class="form-group">
        <label v-if="showLabel" class="form-label mb-0">{{ name }}</label>
        <div v-if="description !== ''" class="form-text mt-0 mb-2">{{ description }}</div>
        <div 
            v-for="(item, index) in items" :key="item"
            class="row mb-2">
            <div class="col">
                <base-input
                    :id="name+'_'+index"
                    :name="name+'[]'"
                    :placeholder="placeholder"
                    :modelValue="items[index]"
                    :disabled="disabled"
                    :hasError="errors.indexOf(index) >= 0"
                    autocomplete="off"
                    @input="valueUpdated($event, index)"
                    />
            </div>
            <div class="col">
                <base-button
                    @click="deleteField(index)"
                    type="button"
                    class="btn-danger" 
                    style="--bs-btn-padding-y: .37rem; --bs-btn-padding-x: .5rem;">
                    <b-icon-trash width="1.3em" height="1.3em" />
                </base-button>
            </div>
        </div>

        <base-button 
            @click="addField"
            class="btn-primary" 
            type="button">+ Add Field</base-button>

        <base-button 
            v-if="hasChanges"
            @click="onSave"
            :disabled="hasErrors"
            class="btn-primary ms-2" 
            type="button">Save Changes</base-button>

        <base-button 
            v-if="hasChanges"
            @click="onReset"
            class="btn-secondary ms-2" 
            type="button">Reset</base-button>
    </div>
</template>

<script>
import { BIconTrash } from 'bootstrap-icons-vue';
import BaseButton from "@components/BaseButton.vue";
import BaseInput from "@components/BaseInput.vue";

export default {
    name: 'formitem-list',
    emits: ['update', 'save'],
    components: {
        BIconTrash,
        BaseButton,
        BaseInput
    },
    props: {
        showLabel: {
            type: Boolean,
            required: false,
            default: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false,
            default: ''
        },
        placeholder: {
            type: String,
            required: false,
            default: ''
        },
        modelValue: {
            type: Array,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            items: [...this.modelValue]
        };
    },
    computed: {
        errors() {
            let errors = [];

            this.items.forEach((item, index) => {
                if(this.isValidValue(item) === false) {
                    errors.push(index);
                }
            });

            return errors;
        },
        hasChanges() {
            // Credits: https://stackoverflow.com/a/19746771/1024322
            return !(this.items.length === this.modelValue.length && this.items.every((value, index) => value === this.modelValue[index]));
        },
        hasErrors() {
            return this.errors.length > 0;
        }
    },
    watch: {
        items: {
            handler(newValue) {
                this.$emit('update', newValue);
            },
            deep: true
        }
    },
    methods: {
        onSave() {
            this.$emit('save', this.getValidValues());
        },
        onReset() {
            this.items = [...this.modelValue]
        },
        getValidValues() {
            return this.items.filter(item => this.isValidValue(item));
        },
        isValidValue(input) {
            return (input !== '' && /^[A-Za-z0-9]*$/.test(input));
        },
        addField() {
            this.items.push('');
        },
        deleteField(index) {
            this.items.splice(index, 1);
        },
        valueUpdated(e, index) {
            this.items[index] = e.target.value;

            // Little hack to re-set the focus. Every time the value of 1 of the items
            // is changed, we lose focus. This resets that.
            this.$nextTick(() => {
                document.getElementById(this.name+'_'+index).focus();
            })
        }
    }
}
</script>
