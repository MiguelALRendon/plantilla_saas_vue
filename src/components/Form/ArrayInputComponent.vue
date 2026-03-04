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
                    <label class="label-input">Buscar {{ moduleName }}</label>
                    <input type="text" class="main-input" placeholder=" " v-model="search" :disabled="disabled" />
                </div>
                <button
                    class="button alert fill"
                    :disabled="selectedItems.length == 0 || disabled"
                    @click="showDeleteModal"
                >
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.DELETE }}</span>
                    <span class="btn-label">Eliminar</span>
                </button>
                <button
                    class="button success fill"
                    @click="toggleSelection"
                    :disabled="modelValue.length == 0 || disabled"
                >
                    <span :class="[GGCLASS, 'btn-icon']">{{ selectionIcon }}</span>
                    <span class="btn-label">Seleccionar</span>
                </button>
                <button class="button secondary fill" @click="openModal" :disabled="disabled">
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.ADD }}</span>
                    <span class="btn-label">Agregar</span>
                </button>
            </div>
        </div>

        <div class="table-scroll-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th class="selection" :class="[{ display: isSelection }]"></th>
                        <th
                            v-for="(label, key) in visibleProperties"
                            :key="String(key)"
                            :style="getColumnStyle(String(key))"
                            @dblclick="autoFitColumn($event, String(key))"
                        >
                            {{ label }}
                            <span class="col-resize-handle" @mousedown.prevent="startResize($event, String(key))"></span>
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
                        <td v-for="property in Object.keys(visibleProperties)" :key="property" :style="getColumnStyle(property)">
                            {{ getCellValue(item, property) }}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td class="pagination-td" :colspan="Object.keys(visibleProperties).length + 1">
                            <div class="pagination-bar">
                                <select class="page-size-select" :value="pageSize" @change="onPageSizeChange">
                                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                                </select>
                                <div class="pagination-nav">
                                    <button
                                        class="page-btn"
                                        :disabled="currentPage === 1 || pageSize === 'ALL'"
                                        @click="prevPage"
                                        title="Página anterior"
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
                                        title="Página siguiente"
                                    >&#8250;</button>
                                </div>
                                <span class="pagination-info">{{ paginationInfo }}</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>
<script setup lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import { EnumAdapter } from '@/models/enum_adapter';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

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

const columnWidths: Ref<Record<string, number>> = ref({});
const MIN_COL_WIDTH = 50; // px — equivalent of var(--table-width-very-small)
let resizeColumn = '';
let resizeStartX = 0;
let resizeStartWidth = 0;

// FR-034 — Pagination
const pageSizeOptions: (number | 'ALL')[] = [10, 20, 50, 100, 'ALL'];
const pageSize = ref<number | 'ALL'>(10);
const currentPage = ref<number>(1);

const moduleIcon = computed<string | undefined>(() => props.typeValue?.getModuleIcon());
const moduleName = computed<string | undefined>(() => props.typeValue?.getModuleName());
const selectionIcon = computed<string>(() => (isSelection.value ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID));

const filteredData = computed<BaseEntity[]>(() => {
    if (!search.value) {
        return props.modelValue;
    }
    return props.modelValue.filter((item) => {
        const defaultValue = item.getDefaultPropertyValue();
        if (defaultValue && typeof defaultValue === 'string') {
            return defaultValue.toLowerCase().includes(search.value.toLowerCase());
        }
        return false;
    });
});

const paginatedItems = computed<BaseEntity[]>(() => {
    if (pageSize.value === 'ALL') return filteredData.value;
    const size = pageSize.value as number;
    const start = (currentPage.value - 1) * size;
    return filteredData.value.slice(start, start + size);
});

const totalPages = computed<number>(() => {
    if (pageSize.value === 'ALL' || filteredData.value.length === 0) return 1;
    return Math.ceil(filteredData.value.length / (pageSize.value as number));
});

const visiblePages = computed<number[]>(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
    }
    return pages;
});

const paginationInfo = computed<string>(() => {
    if (pageSize.value === 'ALL') return `${filteredData.value.length} registros`;
    const size = pageSize.value as number;
    if (filteredData.value.length === 0) return '0 registros';
    const start = (currentPage.value - 1) * size + 1;
    const end = Math.min(currentPage.value * size, filteredData.value.length);
    return `${start}–${end} de ${filteredData.value.length}`;
});

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
// #endregion

// #region METHODS
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
        'Confirmar eliminación',
        'El elemento que esta a punto de eliminarse no podrá ser recuperado. ¿Desea continuar?',
        () => {
            const updatedArray = props.modelValue.filter((item) => !selectedItems.value.includes(item));
            emit('update:modelValue', updatedArray);
            selectedItems.value = [];
            isSelection.value = false;
        }
    );
}

function getCellValue(item: BaseEntity, column: string): string {
    const value = item[column];

    if (value instanceof BaseEntity) {
        return String(value.getDefaultPropertyValue() ?? '');
    }

    // SC-017 — enum resolution: getPropertyType stores an EnumAdapter instance for enum columns.
    if (item.isEnumProperty(column) && typeof value === 'number') {
        const adapter = item.getPropertyType(column) as EnumAdapter;
        const found = adapter.getKeyValuePairs().find((pair) => pair.value === value);
        if (found) {
            return parseEnumValue(found.key);
        }
    }

    return item.getFormattedValue(column);
}

function parseEnumValue(key: string): string {
    return key
        .toLowerCase()
        .split('_')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');
}

function getColumnStyle(column: string): Record<string, string> | undefined {
    const width = columnWidths.value[column];
    if (!width) return undefined;
    return { width: `${width}px`, minWidth: `${width}px` };
}

function startResize(event: MouseEvent, column: string): void {
    const td = (event.target as HTMLElement).parentElement;
    if (!td) return;
    resizeColumn = column;
    resizeStartX = event.clientX;
    resizeStartWidth = td.offsetWidth;
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
}

function onResizeMove(event: MouseEvent): void {
    if (!resizeColumn) return;
    const delta = event.clientX - resizeStartX;
    columnWidths.value[resizeColumn] = Math.max(MIN_COL_WIDTH, resizeStartWidth + delta);
}

function onResizeUp(): void {
    resizeColumn = '';
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
}

// FR-032 — already defined above (autoFitColumn, startResize, onResizeMove, onResizeUp)

// FR-034 — Pagination helpers
function prevPage(): void {
    if (currentPage.value > 1) currentPage.value--;
}

function nextPage(): void {
    if (currentPage.value < totalPages.value) currentPage.value++;
}

function goToPage(page: number): void {
    currentPage.value = page;
}

function onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    pageSize.value = value === 'ALL' ? 'ALL' : Number(value);
    currentPage.value = 1;
}

function autoFitColumn(event: MouseEvent, column: string): void {
    const th = event.currentTarget as HTMLElement;
    const tableEl = th.closest('table');
    if (!tableEl) return;
    const headers = Array.from(th.parentElement!.children) as HTMLElement[];
    const colIndex = headers.indexOf(th);
    if (colIndex === -1) return;
    const bodyRows = tableEl.querySelectorAll('tbody tr');
    // FR-032: seed with th.scrollWidth so the header label is always included in the max
    let maxWidth = th.scrollWidth;
    bodyRows.forEach((row) => {
        const cell = row.children[colIndex] as HTMLElement | undefined;
        if (cell) maxWidth = Math.max(maxWidth, cell.scrollWidth);
    });
    columnWidths.value[column] = Math.max(MIN_COL_WIDTH, maxWidth);
}

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
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
});

// FR-034: reset to page 1 when the filtered list length changes (search or modelValue update)
watch(
    () => filteredData.value.length,
    () => {
        currentPage.value = 1;
    }
);
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
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
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
    position: relative; /* anchor for .col-resize-handle */
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

.table tbody {
    display: block;
    width: 100%;
    flex: 1; /* fill remaining space between thead and tfoot */
}

.table tfoot {
    display: block;
    width: 100%;
    position: sticky;
    bottom: 0;
    background-color: var(--white);
    z-index: var(--z-base);
    border-top: var(--border-width-thin) solid var(--gray-lighter);
    height: auto;
}

.tfoot-add-cell {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    flex: 1;
}

.tfoot-add-btn {
    flex-shrink: 0;
}

.table thead tr,
.table tbody tr,
.table tfoot tr {
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
