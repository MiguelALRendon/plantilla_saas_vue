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
                        <span class="col-resize-handle" @mousedown.prevent="startResize($event, column)"></span>
                    </td>
                </tr>
            </thead>

            <tbody>
                <tr v-for="item in data" :key="String(item.getUniquePropertyValue() ?? item.entityObjectId ?? '')" @click="openDetailView(item)">
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
                <tr></tr>
            </tfoot>
        </table>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { EnumAdapter } from '@/models/enum_adapter';
import Application from '@/models/application';

// #region PROPERTIES
const data: Ref<BaseEntity[]> = ref([]);
const columnWidths: Ref<Record<string, number>> = ref({});

const MIN_COL_WIDTH = 50; // px — equivalent of var(--table-width-very-small)
let resizeColumn = '';
let resizeStartX = 0;
let resizeStartWidth = 0;
// #endregion

// #region METHODS
async function loadData(): Promise<void> {
    const entityClass = Application.View.value.entityClass as
        | (typeof BaseEntity & (new (input: Record<string, unknown>) => BaseEntity))
        | null;

    if (!entityClass) {
        data.value = [];
        return;
    }

    try {
        data.value = await entityClass.getElementList('');
    } catch (error: unknown) {
        console.error('[DetailViewTableComponent] Failed to load entity list', error);
        data.value = [];
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

    // SC-017 — enum resolution: detect non-primitive, non-BaseEntity types and resolve numeric value
    const entityClass = Application.View.value.entityClass;
    const type = entityClass?.getPropertyType(column) as unknown;
    const primitiveConstructors: unknown[] = [String, Number, Boolean, Date, Array];

    if (type && !primitiveConstructors.includes(type) && typeof value === 'number') {
        const adapter = new EnumAdapter(type as Record<string, string | number>);
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
    let maxWidth = 0;
    bodyRows.forEach((row) => {
        const cell = row.children[colIndex] as HTMLElement | undefined;
        if (cell) maxWidth = Math.max(maxWidth, cell.scrollWidth);
    });
    if (maxWidth > 0) {
        columnWidths.value[column] = Math.max(MIN_COL_WIDTH, maxWidth);
    }
}

/**
 * Finalises column resize on mouseup.
 */
function onResizeUp(): void {
    resizeColumn = '';
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
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

tbody {
    display: block;
    width: 100%;
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
