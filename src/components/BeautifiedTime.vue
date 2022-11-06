<template>
    <span class="time">{{ displayTime }}</span>
</template>

<script>
export default {
    name: 'beautified-time',
    props: {
        seconds: {
            type: Number,
            required: true
        }
    },

    data() {
        return {
            displayTime: this.formatTime(this.seconds)
        }
    }
}
</script>
