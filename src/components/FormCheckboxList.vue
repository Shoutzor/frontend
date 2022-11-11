<template>
    <div class="list list-row">
        <template v-if="items.length > 0">
            <formitem-checkbox 
                v-for="item in items"
                :key="item.id"
                :id="item.id"
                :name="item.name"
                :description="item.description"
                :isSwitch="asSwitches"
                :checked="item.checked"
                />
        </template>
    </div>
</template>

<script>
import FormitemCheckbox from "@components/FormitemCheckbox.vue";

export default {
    components: {
        FormitemCheckbox
    },
    props: {
        items: {
            type: Array,
            required: true
        },
        asSwitches: {
            type: Boolean,
            required: false,
            default: false
        }
    }
}
</script>
