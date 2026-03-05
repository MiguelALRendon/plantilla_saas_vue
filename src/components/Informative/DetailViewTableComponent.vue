<template>
    <!-- .table-wrapper is the SINGLE scroll container for both header and body.
         This ensures the sticky header always aligns with the scrolling body columns. -->
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <td
                        v-for="column in getVisibleColumns()"
                        :key="column"
                        :class="Application.View.value.entityClass?.getCSSClasses()[column]"
                        :style="getColumnStyle(column)"
                        @dblclick="autoFitColumn($event, column)"
                    >
                        {{ Application.View.value.entityClass?.getProperties()[column] }}
                        <button
                            class="col-filter-btn"
                            :class="{ 'has-filter': (columnFilters[column]?.length ?? 0) > 0 }"
                            @click.stop="openColumnFilter($event, column)"
                        >
                            <span :class="[GGCLASS]">{{ GGICONS.FILTER_LIST }}</span>
                        </button>
                        <span class="col-resize-handle" @mousedown.prevent="startResize($event, column)"></span>
                    </td>
                </tr>
            </thead>

            <tbody>
                <tr v-for="item in paginatedRows" :key="String(item.getUniquePropertyValue() ?? item.entityObjectId ?? '')" @click="openDetailView(item)">
                    <template v-for="column in getVisibleColumns(item)" :key="column">
                        <td
                            :class="item.getCSSClasses()[column]"
                            :style="getColumnStyle(column)"
                            class="table-row"
                        >
                            <span v-if="Application.View.value.entityClass?.getPropertyType(column) !== Boolean">
                                {{ getCellValue(item, column) }}
                            </span>

                            <span
                                v-else-if="Application.View.value.entityClass?.getPropertyType(column) === Boolean"
                                :class="[GGCLASS, item.toObject()[column] ? 'row-check' : 'row-cancel']"
                                class="boolean-row"
                            >
                                {{ getBooleanIcon(item, column) }}
                            </span>
                        </td>
                    </template>
                </tr>
            </tbody>

            <tfoot>
                <tr>
                    <td class="pagination-td">
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
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { GetLanguagedText } from '@/helpers/language_helper';
import { EnumAdapter } from '@/models/enum_adapter';
import Application from '@/models/application';
import ColumnFilterPanelComponent from '@/components/Form/ColumnFilterPanelComponent.vue';
import type { ConcreteEntityClass } from '@/types/entity.types';

// #region PROPERTIES
const data: Ref<BaseEntity[]> = ref([]);
const columnWidths: Ref<Record<string, number>> = ref({});

// T243 — Column filter state (distinct values scoped to current page per I3)
const columnFilters: Ref<Record<string, unknown[]>> = ref({});

const MIN_COL_WIDTH = 50; // px — equivalent of var(--table-width-very-small)
let resizeColumn = '';
let resizeStartX = 0;
let resizeStartWidth = 0;

// FR-034 — Pagination (T217: server-side pagination state)
const pageSizeOptions: (number | 'ALL')[] = [10, 20, 50, 100, 'ALL'];
const pageSize = ref<number | 'ALL'>(10);
const currentPage = ref<number>(1);
/** T217: total record count returned by the server (or full dataset if API returns flat array) */
const totalFromServer = ref<number>(0);

/**
 * T217: paginatedRows === data.value because getElementListPaginated already returns
 * the current page's slice from the server. No client-side slicing needed.
 * T243: further filtered by active columnFilters (current-page values only — I3).
 */
const filteredRows = computed<BaseEntity[]>(() => {
    const activeFilters = columnFilters.value;
    const filterKeys = Object.keys(activeFilters).filter(k => activeFilters[k].length > 0);
    if (filterKeys.length === 0) return data.value;
    return data.value.filter(item =>
        filterKeys.every(col => activeFilters[col].includes(getCellValue(item, col)))
    );
});

const paginatedRows = computed<BaseEntity[]>(() => filteredRows.value);

const totalPages = computed<number>(() => {
    if (pageSize.value === 'ALL' || totalFromServer.value === 0) return 1;
    return Math.ceil(totalFromServer.value / (pageSize.value as number));
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
    if (pageSize.value === 'ALL') {
        return t('common.records_count').split('{count}').join(String(totalFromServer.value));
    }
    const size = pageSize.value as number;
    if (totalFromServer.value === 0) return t('common.zero_records');
    const start = (currentPage.value - 1) * size + 1;
    const end = Math.min(currentPage.value * size, totalFromServer.value);
    return t('common.pagination_range')
        .split('{start}').join(String(start))
        .split('{end}').join(String(end))
        .split('{total}').join(String(totalFromServer.value));
});

function t(path: string): string {
    return GetLanguagedText(path);
}
// #endregion

// #region METHODS
/**
 * T217: Loads entity data using server-side pagination via getElementListPaginated.
 * Passes current page and pageSize so the API receives real pagination params.
 * For 'ALL' option, sends a very high limit so the server returns everything.
 */
async function loadData(): Promise<void> {
    const entityClass = Application.View.value.entityClass as ConcreteEntityClass<BaseEntity> | null;

    if (!entityClass) {
        data.value = [];
        totalFromServer.value = 0;
        currentPage.value = 1;
        return;
    }

    const limit = pageSize.value === 'ALL' ? 999999 : (pageSize.value as number);

    try {
        const result = await entityClass.getElementListPaginated({
            page: currentPage.value,
            limit,
            filter: ''
        });
        data.value = result.data;
        totalFromServer.value = result.total;
    } catch (error: unknown) {
        console.error('[DetailViewTableComponent] Failed to load entity list', error);
        data.value = [];
        totalFromServer.value = 0;
        currentPage.value = 1;
    }
}

function getBooleanIcon(item: BaseEntity, column: string): string {
    return item.toObject()[column] ? GGICONS.CHECK : GGICONS.CANCEL;
}

/**
 * Formats a cell value for display.
 * Resolves enum numeric values to their human-readable key name (SC-017).
 * @param item The entity instance for the row.
 * @param column The property key.
 * @returns Formatted display string.
 */
function getCellValue(item: BaseEntity, column: string): string {
    const value = item[column];

    if (value instanceof BaseEntity) {
        return String(value.getDefaultPropertyValue() ?? '');
    }

    // SC-017 — enum resolution via BaseEntity.isEnumProperty().
    // getPropertyType() stores an EnumAdapter instance for enum columns — use it directly.
    if (item.isEnumProperty(column) && typeof value === 'number') {
        const adapter = item.getPropertyType(column) as EnumAdapter;
        const found = adapter.getKeyValuePairs().find((pair) => pair.value === value);
        if (found) {
            return parseEnumValue(found.key);
        }
    }

    return item.getFormattedValue(column);
}

/**
 * Converts an enum key string to human-readable format.
 * e.g. STATUS_ACTIVE → Status Active
 * @param key Enum key string.
 * @returns Formatted display string.
 */
function parseEnumValue(key: string): string {
    return key
        .toLowerCase()
        .split('_')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');
}

/**
 * T243 — Returns distinct display values for a given column from the current page.
 * ⚠ I3: limited to current page because DetailViewTableComponent uses server-side pagination (T217).
 */
function getDistinctValues(column: string): unknown[] {
    const seen = new Set<unknown>();
    for (const item of data.value) {
        seen.add(getCellValue(item, column));
    }
    return Array.from(seen);
}

/**
 * T243 — Opens the ColumnFilterPanel dropdown for a given column header.
 */
function openColumnFilter(event: MouseEvent, column: string): void {
    const buttonEl = event.currentTarget as HTMLElement;
    const columnLabel = Application.View.value.entityClass?.getProperties()[column] ?? column;
    Application.ApplicationUIService.openDropdownMenu(
        buttonEl,
        columnLabel,
        ColumnFilterPanelComponent,
        '18rem',
        {
            distinctValues: getDistinctValues(column),
            activeFilters: columnFilters.value[column] ?? [],
            columnLabel,
            onApply: (selected: unknown[]) => {
                if (selected.length === 0) {
                    const updated = { ...columnFilters.value };
                    delete updated[column];
                    columnFilters.value = updated;
                } else {
                    columnFilters.value = { ...columnFilters.value, [column]: selected };
                }
                Application.ApplicationUIService.closeDropdownMenu();
            },
            onClear: () => {
                const updated = { ...columnFilters.value };
                delete updated[column];
                columnFilters.value = updated;
                Application.ApplicationUIService.closeDropdownMenu();
            },
        }
    );
}

/**
 * Returns inline style binding for a column's resize width.
 * @param column The property key.
 * @returns Style object if width is set, undefined otherwise.
 */
function getColumnStyle(column: string): Record<string, string> | undefined {
    const width = columnWidths.value[column];
    if (!width) return undefined;
    return { width: `${width}px`, minWidth: `${width}px` };
}

/**
 * Initiates column resize on mousedown of the resize handle.
 * @param event The MouseEvent from the handle.
 * @param column The property key of the column being resized.
 */
function startResize(event: MouseEvent, column: string): void {
    const td = (event.target as HTMLElement).parentElement;
    if (!td) return;
    resizeColumn = column;
    resizeStartX = event.clientX;
    resizeStartWidth = td.offsetWidth;
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
}

/**
 * Updates column width during drag.
 * @param event The mousemove MouseEvent.
 */
function onResizeMove(event: MouseEvent): void {
    if (!resizeColumn) return;
    const delta = event.clientX - resizeStartX;
    columnWidths.value[resizeColumn] = Math.max(MIN_COL_WIDTH, resizeStartWidth + delta);
}

/**
 * Auto-fits a column width to the maximum scrollWidth found in tbody cells.
 * Triggered by double-clicking a header cell.
 * @param event The dblclick MouseEvent.
 * @param column The property key of the clicked column.
 */
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

/**
 * Finalises column resize on mouseup.
 */
function onResizeUp(): void {
    resizeColumn = '';
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
}

// FR-034 — Pagination helpers (T217: all page changes re-fetch from server)
function prevPage(): void {
    if (currentPage.value > 1) {
        currentPage.value--;
        loadData();
    }
}

function nextPage(): void {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        loadData();
    }
}

function goToPage(page: number): void {
    currentPage.value = page;
    loadData();
}

function onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    pageSize.value = value === 'ALL' ? 'ALL' : Number(value);
    currentPage.value = 1;
    loadData();
}

function getVisibleColumns(entity?: BaseEntity): string[] {
    const entityClass = Application.View.value.entityClass;

    if (!entityClass) {
        return [];
    }

    const sourceKeys = entity ? entity.getKeys() : Object.keys(entityClass.getProperties());

    return sourceKeys.filter((column) => {
        if (entityClass.getPropertyType(column) === Array) {
            return false;
        }

        if (entity) {
            return !entity.isHideInListView(column);
        }

        const tempEntity = entityClass.createNewInstance();
        return !tempEntity.isHideInListView(column);
    });
}

function openDetailView(entity: BaseEntity): void {
    const uniqueValue = entity.getUniquePropertyValue();

    if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
        Application.View.value.entityOid = 'new';
    } else {
        Application.View.value.entityOid = String(uniqueValue);
    }

    Application.changeViewToDetailView(entity);
}

watch(
    () => Application.View.value.entityClass,
    () => {
        // T217: reset to page 1 when module changes so the API call uses correct offset
        currentPage.value = 1;
        loadData();
    }
);
// #endregion

// #region LIFECYCLE
onMounted((): void => {
    loadData();
});

onBeforeUnmount((): void => {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
});
// #endregion
</script>

<style scoped>
@import '@/css/table.css';

/* ─── Single-scroll-container table layout ────────────────────────────────────
   .table-wrapper is the ONE element that scrolls (both x and y).
   thead uses position:sticky so it remains visible during vertical scroll while
   ALSO tracking horizontal scroll — both move inside the same scroll viewport.
   This eliminates the previous thead/tbody misalignment caused by having a
   separate overflow-x:auto on tbody (which created an independent scroll context).
──────────────────────────────────────────────────────────────────────────────── */
.table-wrapper {
    width: 100%;
    height: calc(100vh - var(--topbar-height) - (var(--spacing-2xl) * 2.5) - var(--detail-table-footer-offset));
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    overflow: auto; /* single scroll context — both axes */
}

table {
    width: 100%;
    min-width: max-content; /* prevent table from squishing below its natural column-sum width */
    min-height: 100%; /* stretch to fill .table-wrapper so tbody can expand with flex: 1 */
    display: flex;
    flex-direction: column;
}

thead {
    display: block;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: var(--z-base);
    background-color: var(--white); /* opaque so rows don't bleed through on scroll */
}

thead tr {
    display: flex;
    min-width: 100%;
}

thead td {
    font-weight: bold;
    position: relative; /* required for .col-resize-handle absolute positioning */
}

thead td:hover {
    background-color: var(--bg-gray);
    box-shadow: inset 0 0 0 var(--border-width-thin) var(--gray-lighter);
}

/* Column resize drag handle — appears on the right edge of each header cell */
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

/* T243 — Column filter funnel button */
.col-filter-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
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
thead td:hover .col-filter-btn,
.col-filter-btn.has-filter {
    opacity: 1;
}
.col-filter-btn.has-filter span {
    color: var(--lavender);
}

tbody {
    display: block;
    width: 100%;
    flex: 1; /* fill remaining space between thead and tfoot */
    /* No overflow here — .table-wrapper owns all scroll, ensuring header stays in sync */
}

tbody tr {
    display: flex;
    min-width: 100%; /* at least fills wrapper width; cells' min-widths can push it wider */
}

tfoot {
    display: block;
    width: 100%;
    position: sticky;
    bottom: 0;
    background-color: var(--white);
    z-index: var(--z-base);
}

tfoot tr {
    display: flex;
    min-width: 100%;
}

.pagination-td {
    flex: 1;
    padding: 0;
}

.pagination-bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-medium);
    padding: var(--spacing-small) var(--spacing-medium);
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

td {
    padding-inline: var(--spacing-medium);
    padding-block: var(--spacing-small);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    user-select: none;
    flex-shrink: 0; /* cells never shrink below their declared width */
}

/* Flexible column that fills remaining row space (used by .table-length-full) */
td:not([class*='table-length-']) {
    flex: 1;
    min-width: var(--table-width-small); /* fallback minimum so unstyled cols stay readable */
}

tr {
    min-height: var(--table-row-min-height);
}
tbody tr {
    cursor: pointer;
}
tbody tr:hover {
    background-color: var(--bg-gray);
}

.table-row {
    display: flex;
    align-items: center;
}

.boolean-row {
    font-size: var(--font-size-h2);
    margin-left: var(--spacing-2xl);
    border-radius: 100%;
}

.boolean-row.row-check {
    background-color: var(--btn-info);
    color: var(--white);
}
.boolean-row.row-cancel {
    color: var(--accent-red);
}

/* Mobile: reduce internal padding so more columns fit before scroll kicks in */
@media (max-width: 768px) {
    td {
        padding-inline: var(--spacing-sm);
        padding-block: var(--spacing-xs);
        font-size: var(--font-size-sm);
    }
}
</style>
