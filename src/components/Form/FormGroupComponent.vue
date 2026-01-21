<template>
<div class="form-group">
    <div class="form-group-header">
        <span>{{ title }}</span>
        <button class="colapse-group-btn icon" @click="collapseGroup">
            <!-- <img :class="collapsedGroup ? ' collapsed' : ''" :src="ICONS.CHEVRON" alt=""> -->
             <span :class="GGCLASS + ' ' + (collapsedGroup ? ' collapsed' : '')">{{ GGICONS.ARROW_UP }}</span>
        </button>
    </div>

    <div class="form-group-body">
        <div :class="'form-group-body-container' + (collapsedGroup ? ' collapsed' : '')">
            <div class="form-group-body-content">
                <slot></slot>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import ICONS from '@/constants/icons';

export default {
    name: 'FormGroupComponent',
    props: {
        title: {
            type: String,
            required: true,
            default: '',
        },
    },
    methods: {
        collapseGroup() {
            this.collapsedGroup = !this.collapsedGroup;
        }
    },
    data() {
        return {
            ICONS,
            collapsedGroup: false,
            GGCLASS,
            GGICONS,
        }
    }
}
</script>

<style scoped>
.form-group {
    background-color: var(--white);
    border-radius: var(--border-radius);
    margin-block: 1rem;
}

.form-group-header {
    font-weight: bold;
    font-size: 1.25rem;
    color: var(--gray-medium);
    padding: 1rem;
    border-bottom: 1px solid var(--gray-lighter);
    height: 30px;
    max-height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-group-body {
    padding-block: 1rem;
    padding-inline: 0.5rem;
}

.form-group-body-container {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.3s ease;
}
.form-group-body-container.collapsed {
    grid-template-rows: 0fr;
}

.form-group-body-content {
    overflow: hidden;
}

.colapse-group-btn {
    height: 100%;
}
.colapse-group-btn span {
    height: fit-content;
    transform: rotate(180deg);
    height: 100%;
    transition: transform 0.3s ease;
    font-size: 2rem;
    width: 2rem;
}
.colapse-group-btn span.collapsed {
    transform: rotate(0deg);
}
</style>