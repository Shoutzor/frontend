<template>
    <div class="playbutton" @click="onClick">
        <b-icon-play-fill v-if="state === PlayerState.STOPPED" class="play"></b-icon-play-fill>
        <b-icon-stop-fill v-else-if="state === PlayerState.PLAYING" class="stop"></b-icon-stop-fill>
        <div v-else class="spinner-border loading" role="status"></div>
    </div>
</template>

<script>
import {BIconPlayFill, BIconStopFill} from 'bootstrap-icons-vue';
import {PlayerState} from "@models/PlayerState";

export default {
    name: 'play-button',
    components: {BIconPlayFill, BIconStopFill},
    data() {
        return {
            PlayerState
        }
    },
    props: {
        state: {
            type: Number,
            required: true,
            validator: function (value) {
                return Object.values(PlayerState).indexOf(value) !== -1;
            },
            default: PlayerState.STOPPED
        }
    },

    emits: ['click'],

    setup(_props, {emit}) {
        return {
            onClick() {
                emit('click');
            }
        }
    }
};
</script>

<style lang="scss">
.playbutton {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    text-align: center;
    background: $primary;

    svg {
        width: 1.8rem;
        height: 1.8rem;
        color: $dark;

        &.play {
            padding-left: 0.15rem;
        }
    }

    .spinner-border {
        width: 1.5rem;
        height: 1.5rem;
        color: $dark;
    }
}
</style>