<template>
<div class="ListInput">
    <button class="list-input-header" @click="openOptions" :id="'id-4-click-on' + propertyName">
        <div class="list-input-container">
            <div class="label-and-value">
                <label class="label" :class="[{active: actualOption != ''}]">{{ propertyName }}</label>
                <label class="value" :class="[{active: actualOption != ''}]">{{ actualOption }}</label>
            </div>
            <span class="arrow" :class="[GGCLASS, {active: droped}]">{{ GGICONS.ARROW_UP }}</span>
        </div>
    </button>
    <div class="list-input-body" :class="[{enabled: droped}, { 'from-bottom': fromBottom }]">
        <div class="list-input-items-wrapper">
            <div class="list-input-item" 
            v-for="value in propertyEnumValues.getKeyValuePairs()" 
            :class="[{selected: modelValue == value.value}]"
            :key="value.key"
            @click="$emit('update:modelValue', value.value); droped = false;">
                <span>{{ parseValue(value.key) }}</span>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { EnumAdapter } from '@/models/enum_adapter';
import { GGCLASS, GGICONS } from '@/constants/ggicons';

export default {
    name: 'ListInputComponent',
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        parseValue(key: string): string {
            return key
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        },
        openOptions() {
            const rect = document.getElementById('id-4-click-on' + this.propertyName)?.getBoundingClientRect();
            if (rect) {
                this.fromBottom = (window.innerHeight - rect.bottom) < 300;
            }
            this.droped = !this.droped;
        },

        handleClickOutside(event: MouseEvent) {
            if(this.droped) {
                const dropdown = this.$el;
                if (!dropdown) return;

                if (!dropdown.contains(event.target as Node)) {
                    this.droped = false;
                }
            }
        }
    },
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        propertyEnumValues: {
            type: Object as () => EnumAdapter,
            required: true,
        },
        modelValue: {
            type: [String, Number],
            required: true,
            default: '',
        },
    },
    computed: {
        actualOption(): String | number {
            var value = this.propertyEnumValues.getKeyValuePairs().find(
                (pair) => pair.value === this.modelValue
            )?.key || '';
            return this.parseValue(value);
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
            droped: false,
            fromBottom: false,
        }
    }
};
</script>

<style scoped>
.ListInput {
    width: 100%;
    position: relative;
}

.list-input-container .arrow {
    transition: transform 0.3s ease;
    transform: rotate(180deg);
}
.list-input-container .arrow.active {
    transform: rotate(0deg);
}

.list-input-header {
    width: 100%;
    padding-top: 0.9rem;
}

.list-input-header .list-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: var(--bg-gray);
    padding: 0.75rem;
    box-sizing: border-box;
    border: 1px solid var(--sky);
    border-radius: 1rem;
    position: relative;
}

.list-input-header label { 
    pointer-events: all;
    cursor: pointer;
    font-size: 1rem;
    color: var(--blue-1);
}
.list-input-header span {
    color: var(--blue-1);
}

.label-and-value .label {
    position: absolute;
    left: 0.75rem;
    top: .9rem;
    color: var(--blue-1);
    font-size: 1rem;
    transition: 0.5s ease;
    pointer-events: none;
    overflow: visible;
    display: flex;
    flex-direction: row;
    align-items: end;    
}

.label-and-value .label.active {
    color: var(--white);
    background-color: var(--sky);
    font-size: 0.75rem;
    top: -1.1rem;
    left: 1.5rem;
    padding: 0.1rem 0.25rem 0 0.25rem;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
}

.label-and-value .value.active {
    color: var(--gray-medium);
}

.list-input-body {
    box-shadow: var(--shadow-dark);
    border-radius: 1rem;
    display: grid;
    grid-template-rows: 0fr;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    position: absolute;
    background-color: var(--white);
    z-index: 1000;
    transition: grid-template-rows 0.3s ease;
}
.list-input-body.from-bottom {
    bottom: 100%;
}

.list-input-body.enabled {
    grid-template-rows: 1fr;
}

.list-input-items-wrapper {
    min-height: 0;
    overflow-y: auto;
}

.list-input-item {
    padding: 0.75rem;
    cursor: pointer;
}
.list-input-item:hover {
    background-color: var(--bg-gray);
}
.list-input-item.selected {
    background-color: var(--sky);
}
.list-input-item.selected span{
    color: var(--white) !important;
}

button:focus .list-input-container {
    background-color: var(--white) !important;
    border: 2px solid var(--lavender) !important;
}
</style>