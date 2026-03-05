<template>
    <div class="column-filter-panel">
        <p class="column-filter-label">{{ columnLabel }}</p>
        <div class="column-filter-list">
            <button
                v-for="value in distinctValues"
                :key="String(value)"
                class="select-btn"
                :class="[{ added: isSelected(value) }]"
                @click="toggleValue(value)"
            >
                <span :class="[GGCLASS]">{{ isSelected(value) ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID }}</span>
                <span class="value-label">{{ String(value) }}</span>
            </button>
        </div>
        <div class="column-filter-actions">
            <button class="button success fill" @click="applyFilter">{{ t('common.accept') }}</button>
            <button class="button secondary fill" @click="clearFilter">{{ t('common.clear') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import { GetLanguagedText } from '@/helpers/language_helper';

interface Props {
    distinctValues: unknown[];
    activeFilters: unknown[];
    columnLabel: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'apply', selected: unknown[]): void;
    (e: 'clear'): void;
}>();

// #region PROPERTIES
const selectedValues = ref<unknown[]>([...props.activeFilters]);

watch(
    () => props.activeFilters,
    (newVal) => {
        selectedValues.value = [...newVal];
    }
);
// #endregion

// #region METHODS
function t(path: string): string {
    return GetLanguagedText(path);
}

function isSelected(value: unknown): boolean {
    return selectedValues.value.includes(value);
}

function toggleValue(value: unknown): void {
    const idx = selectedValues.value.indexOf(value);
    if (idx === -1) {
        selectedValues.value.push(value);
    } else {
        selectedValues.value.splice(idx, 1);
    }
}

function applyFilter(): void {
    emit('apply', [...selectedValues.value]);
}

function clearFilter(): void {
    selectedValues.value = [];
    emit('clear');
}
// #endregion
</script>

<style scoped>
.column-filter-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
}

.column-filter-label {
    font-size: var(--font-size-small);
    color: var(--blue-1);
    font-weight: 600;
    margin: 0;
    padding-bottom: 0.25rem;
    border-bottom: var(--border-width-thin) solid var(--sky);
}

.column-filter-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 14rem;
    overflow-y: auto;
}

.select-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: var(--border-radius);
    text-align: left;
}
.select-btn:hover {
    background-color: var(--bg-gray);
}
.select-btn span:first-child {
    color: var(--sky);
    font-size: var(--font-size-lg);
    transition: color var(--transition-slow) var(--timing-ease);
}
.select-btn.added span:first-child {
    color: var(--accent-red);
}
.value-label {
    font-size: var(--font-size-base);
    color: var(--blue-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.column-filter-actions {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    padding-top: 0.25rem;
    border-top: var(--border-width-thin) solid var(--sky);
}
.column-filter-actions .button {
    flex: 1;
}
</style>
