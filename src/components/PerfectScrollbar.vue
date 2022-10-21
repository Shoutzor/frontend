<template>
    <div class="ps">
        <slot></slot>
    </div>
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar';

/**
 * Took some inspiration from mercs600's https://github.com/mercs600/vue3-perfect-scrollbar
 * to implement perfect-scrollbar without the addition of all the
 * unneeded (and outdated) dependencies of his package
 */

const eventNames = [
    'scroll',
    'ps-scroll-y',
    'ps-scroll-x',
    'ps-scroll-up',
    'ps-scroll-down',
    'ps-scroll-left',
    'ps-scroll-right',
    'ps-y-reach-start',
    'ps-y-reach-end',
    'ps-x-reach-start',
    'ps-x-reach-end'
];

export default {
    name: 'perfect-scrollbar',
    emits: eventNames,
    props: {
        options: {
            type: Object,
            required: false,
            default: {}
        }
    },
    data() {
        return {
            ps: null
        }
    },
    mounted() {
        if(!this.ps) {
            this.ps = new PerfectScrollbar(this.$el, this.options);

            eventNames.forEach(n => {
                this.ps.element.addEventListener(n, event => this.$emit(n, event));
            });
        }
    },
    updated() {
        this.$nextTick(() => {
            this.update();
        })
    },
    beforeUnmount() {
        if(this.ps) {
            this.ps.destroy();
            this.ps = null;
        }
    },
    methods: {
        update() {
            if(this.ps) {
                this.ps.update();
            }
        }
    }
}
</script>

<style lang="scss">
@import '~perfect-scrollbar/css/perfect-scrollbar.css';

.ps {
    .ps__rail-x:hover, 
    .ps__rail-y:hover,
    .ps__rail-x.ps--clicking, 
    .ps__rail-y.ps--clicking
    {
        background: transparent !important;
    }
}
</style>