<template>
    <nav id="navbar-left" class="col-12 col-md-4 col-lg-2 sidebar collapse">
        <perfect-scrollbar ref="menuScroll">
            <div id="navbar-left-menu" class="position-sticky">
                <template v-for="(section, index) in items">
                    <span
                        class="sidebar-heading d-flex justify-content-between align-items-center px-3 mb-1 text-muted"
                        :class="index > 0 ? 'mt-md-5' : ''"
                    >
                        {{ section.name }}
                    </span>
                    <ul class="nav flex-column">
                        <li v-for="item in section.items" class="nav-item">
                            <router-link :to="{name: item.route}" class="nav-link">
                                <component :is="item.icon" class="icon" />
                                <span class="text ps-1">{{ item.name }}</span>
                            </router-link>
                        </li>
                    </ul>
                </template>
            </div>
        </perfect-scrollbar>
    </nav>
</template>

<script>
export default {
    name: 'the-menu',
    props: {
        items: {
            type: Array,
            required: false
        }
    },
    mounted() {
        this.updateScrollbar();
    },
    updated() {
        this.updateScrollbar();
    },
    methods: {
        updateScrollbar() {
            this.$refs.menuScroll.update();
        }
    }
}
</script>

<style lang="scss">
#navbar-left {
    // Hide by default
    display: none;

    // Show when toggled to show
    &.show {
        display: flex;
    }

    //Or if the screen size is MD or larger
    @include media-breakpoint-up(md) {
        display: flex;
    }

    .ps {
        flex: 1 1 auto;
        height: 0; // Required to make content scrollable, see: https://stackoverflow.com/a/14964944/1024322
    }
}

.nav-link {
    .icon {
        display: inline-block;
        vertical-align: text-top;
    }

    .text {
        display: inline-block;
        vertical-align: middle;
    }
}
</style>