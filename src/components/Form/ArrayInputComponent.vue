<template>
    <div class="table-container" :class="[{ disabled: disabled }, { nonvalidated: !isInputValidated }]">
        <div class="table-header-row">
            <div class="left-side-space">
                <div class="icon"><img :src="moduleIcon" alt="" /></div>
                <span class="title">{{ moduleName }}</span>
                <div class="advice" v-if="!isInputValidated">
                    <div class="alert-btn">!</div>
                    <div class="val-list">
                        <span v-for="message in validationMessages">{{ message }}</span>
                    </div>
                </div>
            </div>

            <div class="right-side-space">
                <div class="TextInput search-input-container">
                    <label class="label-input">{{ t('common.search') }} {{ moduleName }}</label>
                    <input type="text" class="main-input" placeholder=" " v-model="search" :disabled="disabled" />
                </div>
                <button
                    class="button alert fill"
                    :disabled="selectedItems.length == 0 || disabled"
                    @click="showDeleteModal"
                >
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.DELETE }}</span>
                    <span class="btn-label">{{ t('common.delete') }}</span>
                </button>
                <button
                    class="button success fill"
                    @click="toggleSelection"
                    :disabled="modelValue.length == 0 || disabled"
                >
                    <span :class="[GGCLASS, 'btn-icon']">{{ selectionIcon }}</span>
                    <span class="btn-label">{{ t('common.select') }}</span>
                </button>
                <button class="button secondary fill" @click="openModal" :disabled="disabled">
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.ADD }}</span>
                    <span class="btn-label">{{ t('common.add') }}</span>
                </button>
            </div>
        </div>

        <div class="table-scroll-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th class="selection" :class="[{ display: isSelection }]">
                            <!-- T120 — select-all toggle, only shown when selection mode is active -->
                            <button
                                v-if="isSelection"
                                class="select-btn"
                                :class="[{ added: isAllSelected }]"
                                :title="isAllSelected ? t('common.deselect_all') : t('common.select_all')"
                                @click="toggleSelectAll"
                            >
                                <span :class="[GGCLASS]">{{ isAllSelected ? GGICONS.REMOVE : GGICONS.ADD }}</span>
                            </button>
                        </th>
                        <th
                            v-for="colKey in columnOrder"
                            :key="colKey"
                            :style="getColumnStyle(colKey)"
                            @dblclick="autoFitColumn($event, colKey)"
                            draggable="true"
                            @dragstart="onDragStart(colKey)"
                            @dragover.prevent="onDragOver(colKey)"
                            @dragleave="onDragLeave(colKey)"
                            @drop.prevent="onDrop(colKey)"
                            :class="{ 'drag-over': dragOverKey === colKey }"
                        >
                            <button
                                class="col-sort-btn"
                                :class="{ 'is-sorted': sortColumn === colKey }"
                                @click.stop="toggleSort(colKey)"
                            >
                                <span :class="[GGCLASS]">{{ getSortIcon(colKey) }}</span>
                            </button>
                            <span class="col-label">{{ visibleProperties[colKey] }}</span>
                            <button
                                class="col-filter-btn"
                                :class="{ 'has-filter': (columnFilters[colKey]?.length ?? 0) > 0 }"
                                @click.stop="openColumnFilter($event, colKey)"
                            >
                                <span :class="[GGCLASS]">{{ GGICONS.FILTER_LIST }}</span>
                            </button>
                            <span class="col-resize-handle" @mousedown.prevent="startResize($event, colKey)"></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedItems" :class="[{ selected: selectedItems.includes(item) }]">
                        <td class="selection" :class="[{ display: isSelection }]">
                            <button
                                class="select-btn"
                                :class="[{ added: selectedItems.includes(item) }]"
                                @click="toggleItemSelection(item)"
                            >
                                <span :class="[GGCLASS]">{{ getItemIcon(item) }}</span>
                            </button>
                        </td>
                        <td v-for="colKey in columnOrder" :key="colKey" :style="getColumnStyle(colKey)">
                            {{ getCellValue(item, colKey) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="table-footer">
            <div class="pagination-bar">
                <select class="page-size-select" :value="pageSize" @change="onPageSizeChange">
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                </select>
                <div class="pagination-nav">
                    <button
                        class="page-btn"
                        :disabled="currentPage === 1 || pageSize === 'ALL'"
                        @click="prevPage"
                        :title="t('common.previous_page')"
                    >&#8249;</button>
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        class="page-btn"
                        :class="{ active: page === currentPage }"
                        :disabled="pageSize === 'ALL'"
                        @click="goToPage(page)"
                    >{{ page }}</button>
                    <button
                        class="page-btn"
                        :disabled="currentPage === totalPages || pageSize === 'ALL'"
                        @click="nextPage"
                        :title="t('common.next_page')"
                    >&#8250;</button>
                </div>
                <span class="pagination-info">{{ paginationInfo }}</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useTableCore } from '@/composables/useTableCore';

interface Props {
    modelValue: BaseEntity[];
    typeValue?: typeof BaseEntity;
    entity?: BaseEntity;
    propertyKey?: string;
    required?: boolean;
    requireddMessage?: string;
    disabled?: boolean;
    validated?: boolean;
    validatedMessage?: string;
}

// #region PROPERTIES
const props = withDefaults(defineProps<Props>(), {
    required: false,
    requireddMessage: '',
    disabled: false,
    validated: true,
    validatedMessage: ''
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: BaseEntity[]): void;
}>();

const search = ref('');
const isSelection = ref(false);
const isInputValidated = ref(true);
const selectedItems = ref<BaseEntity[]>([]);
const validationMessages = ref<string[]>([]);
// #endregion

// #region COMPUTED PROPERTIES

const moduleIcon = computed<string | undefined>(() => props.typeValue?.getModuleIcon());
const moduleName = computed<string | undefined>(() => props.typeValue?.getModuleName());
const selectionIcon = computed<string>(() => (isSelection.value ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID));

// Search filter applied to the full modelValue list
const filteredData = computed<BaseEntity[]>(() => {
    if (!search.value) return props.modelValue;
    return props.modelValue.filter((item) => {
        const defaultValue = item.getDefaultPropertyValue();
        if (defaultValue && typeof defaultValue === 'string') {
            return defaultValue.toLowerCase().includes(search.value.toLowerCase());
        }
        return false;
    });
});

// Column metadata: visible non-array properties respecting @HideInListView
const visibleProperties = computed<Record<string, string>>(() => {
    if (!props.typeValue) return {};
    const allProps = props.typeValue.getProperties();
    const tempEntity = (props.typeValue as unknown as { createNewInstance(): BaseEntity }).createNewInstance();
    return Object.fromEntries(
        Object.entries(allProps).filter(([key]) => {
            if (props.typeValue!.getPropertyType(key) === Array) return false;
            return !tempEntity.isHideInListView(key);
        })
    );
});

function t(path: string): string {
    return GetLanguagedText(path);
}

// Composable — sort, column filters, resize, drag-reorder, client-side pagination
const {
    columnOrder,
    dragOverKey,
    columnFilters,
    sortColumn,
    pageSize,
    currentPage,
    pageSizeOptions,
    paginatedItems,
    totalPages,
    visiblePages,
    paginationInfo,
    getCellValue,
    getColumnStyle,
    getSortIcon,
    toggleSort,
    openColumnFilter,
    startResize,
    autoFitColumn,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    prevPage,
    nextPage,
    goToPage,
    onPageSizeChange,
    cleanup,
} = useTableCore({
    sourceData: filteredData,
    visibleProperties,
    t,
});

// #endregion

// #region SELECTION

function getItemIcon(item: BaseEntity): string {
    return selectedItems.value.includes(item) ? GGICONS.REMOVE : GGICONS.ADD;
}

function toggleItemSelection(item: BaseEntity): void {
    if (selectedItems.value.includes(item)) {
        selectedItems.value.splice(selectedItems.value.indexOf(item), 1);
    } else {
        selectedItems.value.push(item);
    }
}

// T118 — true when every item on the current page is selected
const isAllSelected = computed<boolean>(() => {
    if (paginatedItems.value.length === 0) return false;
    return paginatedItems.value.every((item) => selectedItems.value.includes(item));
});

// T119 — Toggle select/deselect all visible (current-page) items
function toggleSelectAll(): void {
    if (isAllSelected.value) {
        selectedItems.value = selectedItems.value.filter(
            (item) => !paginatedItems.value.includes(item)
        );
    } else {
        for (const item of paginatedItems.value) {
            if (!selectedItems.value.includes(item)) {
                selectedItems.value.push(item);
            }
        }
    }
}

function openModal(): void {
    if (!props.typeValue) return;
    Application.ApplicationUIService.showModalOnFunction(
        props.typeValue,
        (param: unknown): void => {
            if (param === undefined || param instanceof BaseEntity) {
                addSelectedElement(param);
            }
        },
        ViewTypes.LOOKUPVIEW
    );
}

function addSelectedElement(newElement: BaseEntity | undefined): void {
    if (newElement) {
        const updatedArray = [...props.modelValue, newElement];
        emit('update:modelValue', updatedArray);
    }
}

function toggleSelection(): void {
    isSelection.value = !isSelection.value;
    if (!isSelection.value) {
        selectedItems.value = [];
    }
}

function showDeleteModal(): void {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        t('common.confirm_delete'),
        t('common.confirm_delete_message'),
        () => {
            const updatedArray = props.modelValue.filter((item) => !selectedItems.value.includes(item));
            emit('update:modelValue', updatedArray);
            selectedItems.value = [];
            isSelection.value = false;
        }
    );
}

// #endregion

// #region VALIDATION

async function isValidated(): Promise<boolean> {
    validationMessages.value = [];

    if (props.required && (!props.modelValue || props.modelValue.length === 0)) {
        validationMessages.value.push(props.requireddMessage || `${props.typeValue?.getModuleName()} is required.`);
    }

    if (props.entity && props.propertyKey) {
        const isValid = props.entity.isValidation(props.propertyKey);
        if (!isValid) {
            const validationMsg = props.entity.validationMessage(props.propertyKey);
            validationMessages.value.push(validationMsg || `${props.typeValue?.getModuleName()} is not valid.`);
        }
    } else if (!props.validated) {
        validationMessages.value.push(props.validatedMessage || `${props.typeValue?.getModuleName()} is not valid.`);
    }

    return validationMessages.value.length === 0;
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
    if (!isInputValidated.value) {
        Application.View.value.isValid = false;
    }
}

// #endregion

// #region LIFECYCLE

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
    cleanup();
});

// #endregion
</script>

<style scoped>
@import '@/css/table.css';

.left-side-space {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    box-sizing: border-box;
    height: 100%;
    padding-block: var(--padding-small);
}
.title {
    font-size: var(--font-size-xl);
    font-weight: 600;
}
.table-container {
    height: var(--array-input-height-large);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
}

/* Single-scroll wrapper — mirrors DetailViewTableComponent pattern.
   Only this element scrolls (both axes); thead is sticky inside it. */
.table-scroll-wrapper {
    flex: 1;
    overflow: auto;
    width: 100%;
    min-width: 0;
    background-color: var(--white);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    box-shadow: var(--shadow-light);
    overscroll-behavior: contain;
}

.table-footer {
    width: 100%;
    background-color: var(--white);
    border-top: var(--border-width-thin) solid var(--gray-lighter);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    box-shadow: var(--shadow-light);
    overflow: hidden;
}

.table-container .table-header-row {
    display: flex;
    align-items: center;
    height: var(--array-input-height-medium);
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    padding-inline: var(--padding-large);
    margin-bottom: var(--margin-small);
    justify-content: space-between;
    gap: var(--spacing-lg);
    box-sizing: border-box;
}

.right-side-space {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
    flex-direction: row-reverse;
    gap: var(--spacing-lg);
    box-sizing: border-box;
    overflow: hidden;
}

/* Search input: fills available space and shrinks last */
.search-input-container {
    flex: 1;
    min-width: 0;
}

/* Action buttons: never shrink — labels handled by .btn-label at ≤992px */
.right-side-space .button {
    flex-shrink: 0;
}

.table {
    width: 100%;
    min-width: max-content; /* allows horizontal scroll inside .table-scroll-wrapper */
    min-height: 100%; /* stretch to fill .table-scroll-wrapper so tbody can expand with flex: 1 */
    display: flex;
    flex-direction: column;
    border-collapse: collapse;
}

.table thead {
    display: block;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: var(--z-base);
    background-color: var(--white);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
}

.table th {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 8px;
    position: relative; /* anchor for .col-resize-handle */
    font-weight: bold;
}

.col-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.col-sort-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    border: none;
    padding: 0 2px;
    cursor: pointer;
    line-height: 1;
    color: var(--gray-light);
    transition: color var(--transition-fast) var(--timing-ease),
                filter var(--transition-fast) var(--timing-ease);
}
.col-sort-btn span {
    font-size: var(--font-size-sm);
}
.col-sort-btn:hover {
    color: var(--gray-medium);
    filter: brightness(0.85);
}
.col-sort-btn.is-sorted {
    color: var(--gray-medium);
}

.table th:hover {
    background-color: var(--bg-gray);
    box-shadow: inset 0 0 0 var(--border-width-thin) var(--gray-lighter);
}

/* Column resize drag handle — right edge of each header cell */
.col-resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    user-select: none;
    background: transparent;
    transition: background-color var(--transition-fast) var(--timing-ease);
}

.col-resize-handle:hover {
    background-color: var(--gray-lighter);
}

/* T244 — Column filter funnel button */
.col-filter-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    padding: 0 2px;
    cursor: pointer;
    line-height: 1;
    opacity: 0.35;
    transition: opacity var(--transition-fast) var(--timing-ease),
                color var(--transition-fast) var(--timing-ease);
}
.col-filter-btn span {
    font-size: var(--font-size-base);
    color: var(--blue-1);
}
.table th:hover .col-filter-btn,
.col-filter-btn.has-filter {
    opacity: 1;
}
.col-filter-btn.has-filter span {
    color: var(--lavender);
}

/* T245 — Column drag-reorder */
.table th[draggable] {
    cursor: grab;
}
.table th[draggable]:active {
    cursor: grabbing;
}
.table th.drag-over {
    border-left: 2px solid var(--primary-main);
}

.table tbody {
    display: block;
    width: 100%;
    flex: 1; /* fill remaining space between thead and tfoot */
}

.table thead tr,
.table tbody tr {
    display: flex;
    min-width: 100%;
}

.table th,
.table td {
    flex: 1;
    flex-shrink: 0;
    min-width: var(--table-width-small);
    padding: var(--spacing-sm);
    text-align: left;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table td {
    height: 4rem;
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
}

.table tbody tr:hover {
    background-color: var(--bg-gray);
    cursor: pointer;
}

.table tr.selected {
    background-color: var(--beige);
}

.table th.selection,
.table td.selection {
    display: none;
}
.select-btn span {
    color: var(--sky);
    transform: rotate(-180deg);
    transition: transform var(--transition-slow) var(--timing-ease),
                color var(--transition-slow) var(--timing-ease);
}
.select-btn.added span {
    transform: rotate(0deg);
    color: var(--accent-red);
}
.table th.selection.display,
.table td.selection.display {
    display: flex;
    max-width: 2rem;
}

.advice {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
}
.alert-btn {
    background-color: var(--accent-red);
    color: var(--white);
    border: none;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    font-weight: bold;
    font-size: var(--font-size-base);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
}
.val-list {
    display: flex;
    flex-direction: column;
}
.val-list span {
    font-size: var(--font-size-sm);
    color: var(--accent-red);
    margin-bottom: 0.2rem;
}

/* FR-034 — Pagination */
.pagination-td {
    flex: 1;
    padding: 0;
    min-width: 0;
}

.pagination-bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-medium);
    padding: var(--spacing-small);
    flex: 1;
    min-width: 0;
}

.page-size-select {
    padding: var(--spacing-xs) var(--spacing-small);
    border: var(--border-width-thin) solid var(--green-main);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    background-color: var(--white);
    color: var(--green-main);
    cursor: pointer;
    flex-shrink: 0;
    transition: var(--transition-slow) var(--timing-ease);
}
.page-size-select:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--white), 0 0 0 3px var(--green-main);
}

.pagination-nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-small);
    flex-shrink: 0;
}

.page-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: var(--border-width-thin) solid var(--green-main);
    background-color: var(--white);
    color: var(--green-main);
    cursor: pointer;
    font-size: var(--font-size-base);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: var(--transition-slow) var(--timing-ease);
}

.page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.page-btn.active {
    opacity: 1;
    box-shadow: 0 0 0 2px var(--white), 0 0 0 3px var(--green-main);
}

.pagination-info {
    font-size: var(--font-size-sm);
    color: var(--gray);
    margin-left: auto;
    white-space: nowrap;
}
</style>
