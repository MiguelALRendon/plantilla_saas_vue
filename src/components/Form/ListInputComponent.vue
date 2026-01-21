<template>
<div class="ListInput">
    <button class="list-input-header" @click="openOptions">
        <div class="list-input-container">
            <div class="label-and-value">
                <label class="label" :class="[{active: modelValue != ''}]">{{ propertyName }}</label>
                <label>{{ actualOption }}</label>
            </div>
            <span :class="GGCLASS">{{ GGICONS.ARROW_UP }}</span>
        </div>
    </button>
    <div class="list-input-body">
        <div class="list-input-item" 
        v-for="value in propertyEnumValues.getKeyValuePairs()" 
        :key="value.key"
        @click="$emit('update:modelValue', value.value)">
            <span>{{ parseValue(value.key) }}</span>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { EnumAdapter } from '@/models/enum_adapter';
import { GGCLASS, GGICONS } from '@/constants/ggicons';

export default {
    name: 'ListInputComponent',
    methods: {
        parseValue(key: string): string {
            return key
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        },
        openOptions() {
            
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
        }
    }
};
</script>

<style scoped>
.ListInput {
    width: 100%;
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
    background-color: var(--lavender);
    font-size: 0.75rem;
    top: -1.1rem;
    left: 1.5rem;
    padding: 0.1rem 0.25rem 0 0.25rem;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
}

.list-input-body {
    box-shadow: var(--shadow-dark);
    border-radius: 1rem;
}

.list-input-item {
    padding: 0.75rem;
    cursor: pointer;
}
.list-input-item:hover {
    background-color: var(--bg-gray);
}
</style>