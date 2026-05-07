<template>
    <div class="dt-root">
        <!-- Toolbar slot: search bars, action buttons, etc. Rendered by the parent. -->
        <slot name="toolbar" />

        <div class="dt-scroll">
            <table>
                <thead>
                    <tr>
                        <!-- Selection header cell — only when selectable=true -->
                        <th v-if="selectable" class="dt-selection" :class="{ display: isSelection }">
                            <button
                                v-if="isSelection"
                                class="select-btn"
                                :class="{ added: isAllSelected }"
                                :title="isAllSelected ? t('common.deselect_all') : t('common.select_all')"
                                @click="emit('toggle-select-all')"
                            >
                                <span :class="[GGCLASS]">{{ isAllSelected ? GGICONS.REMOVE : GGICONS.ADD }}</span>
                            </button>
                        </th>

                        <!-- Data column headers -->
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
                    <tr
                        v-for="item in paginatedItems"
                        :key="String(item.getUniquePropertyValue() ?? item.entityObjectId ?? '')"
                        :class="{ selected: selectedItems?.includes(item) }"
                        @click="emit('row-click', item)"
                    >
                        <!-- Selection cell -->
                        <td v-if="selectable" class="dt-selection" :class="{ display: isSelection }">
                            <button
                                class="select-btn"
                                :class="{ added: selectedItems?.includes(item) }"
                                @click.stop="emit('toggle-item-selection', item)"
                            >
                                <span :class="[GGCLASS]">
                                    {{ selectedItems?.includes(item) ? GGICONS.REMOVE : GGICONS.ADD }}
                                </span>
                            </button>
                        </td>

                        <!-- Data cells -->
                        <td
                            v-for="colKey in columnOrder"
                            :key="colKey"
                            :class="[item.getCSSClasses()[colKey], 'table-row']"
                            :style="getColumnStyle(colKey)"
                        >
                            <span v-if="entityClass?.getPropertyType(colKey) !== Boolean">
                                {{ getCellValue(item, colKey) }}
                            </span>
                            <span
                                v-else
                                :class="[GGCLASS, item.toObject()[colKey] ? 'row-check' : 'row-cancel']"
                                class="boolean-row"
                            >
                                {{ item.toObject()[colKey] ? GGICONS.CHECK : GGICONS.CANCEL }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Loading overlay: covers the entire table while data is being fetched -->
        <div class="dt-loading-overlay" :class="{ active: loading }">
            <span :class="[GGCLASS]" class="dt-spin-icon">{{ GGICONS.REFRESH }}</span>
        </div>

        <div class="dt-footer">
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
import { computed, onBeforeUnmount } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { useTableCore } from '@/composables/useTableCore';

// #region TYPES

export interface RequestDataParams {
    page: number;
    pageSize: number | 'ALL';
    sortBy?: string;
    sortDir?: 'asc' | 'desc' | null;
}

// #endregion

// #region PROPS & EMITS

interface Props {
    sourceData: BaseEntity[];
    visibleProperties: Record<string, string>;
    t: (key: string) => string;
    /** Required to enable boolean icon rendering in cells. */
    entityClass?: typeof BaseEntity | null;
    /**
     * Provide the server total to enable server-side pagination mode.
     * Omit (undefined) for client-side in-memory pagination.
     */
    totalCount?: number;
    /** Show a selection column on each row. */
    selectable?: boolean;
    /** Whether selection mode is currently active (shows/hides selection column). */
    isSelection?: boolean;
    /** Whether all visible items are selected (drives select-all button state). */
    isAllSelected?: boolean;
    /** Currently selected items (used for row highlight and button state). */
    selectedItems?: BaseEntity[];
    /** Shows a semi-transparent overlay that blocks interaction while data is loading. */
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    entityClass: null,
    totalCount: undefined,
    selectable: false,
    isSelection: false,
    isAllSelected: false,
    selectedItems: () => [],
    loading: false,
});

const emit = defineEmits<{
    /** A data row was clicked. */
    'row-click': [item: BaseEntity];
    /** The selection button on a row was clicked. */
    'toggle-item-selection': [item: BaseEntity];
    /** The select-all button in the header was clicked. */
    'toggle-select-all': [];
    /**
     * Emitted in server-side mode whenever the page, page-size, or sort changes.
     * The parent should use the params to re-fetch from the API and update sourceData.
     */
    'request-data': [params: RequestDataParams];
}>();

// #endregion

// #region COMPOSABLE

const sourceDataRef = computed(() => props.sourceData);
const visiblePropertiesRef = computed(() => props.visibleProperties);
const totalCountRef = computed(() => props.totalCount ?? 0);

// Determined once at setup — whether to use server-side or client-side pagination.
const isServerMode = props.totalCount !== undefined;

const {
    columnOrder,
    dragOverKey,
    columnFilters,
    sortColumn,
    sortDirection,
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
    sourceData: sourceDataRef,
    visibleProperties: visiblePropertiesRef,
    t: props.t,
    serverPagination: isServerMode
        ? {
              total: totalCountRef,
              onPageChange: () => {
                  emit('request-data', {
                      page: currentPage.value,
                      pageSize: pageSize.value,
                      sortBy: sortColumn.value || undefined,
                      sortDir: sortDirection.value,
                  });
              },
          }
        : undefined,
});

// #endregion

// #region LIFECYCLE

onBeforeUnmount(() => cleanup());

// #endregion
</script>

<style scoped>
@import '@/css/table.css';

/* ── Root layout ─────────────────────────────────────────────────────────── */

.dt-root {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    width: 100%;
}

/* ── Loading overlay ────────────────────────────────────────────────────── */

.dt-loading-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition-normal) var(--timing-ease);
}

.dt-loading-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.dt-spin-icon {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--green-soft);
    animation: dt-spin var(--animation-spin-duration) var(--timing-bounce) infinite;
}

@keyframes dt-spin {
    0%   { transform: var(--transform-rotate-0); }
    100% { transform: var(--transform-rotate-360); }
}

/* ── Scroll area ─────────────────────────────────────────────────────────── */

.dt-scroll {
    flex: 1;
    overflow: auto;
    width: 100%;
    min-width: 0;
    overscroll-behavior: contain;
}

/* ── Table structure ─────────────────────────────────────────────────────── */

table {
    width: 100%;
    min-width: max-content;
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

thead {
    display: block;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: var(--z-base);
    background-color: var(--white);
}

thead tr {
    display: flex;
    min-width: 100%;
}

thead th {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 8px;
    position: relative;
    min-width: max(min-content, 5rem);
    font-weight: bold;
}

thead th:hover {
    background-color: var(--bg-gray);
    box-shadow: inset 0 0 0 var(--border-width-thin) var(--gray-lighter);
}

thead th[draggable] {
    cursor: grab;
}

thead th[draggable]:active {
    cursor: grabbing;
}

thead th.drag-over {
    border-left: 2px solid var(--primary-main);
}

tbody {
    display: block;
    width: 100%;
    flex: 1;
}

tbody tr {
    display: flex;
    min-width: 100%;
    cursor: pointer;
}

tbody tr:hover {
    background-color: var(--bg-gray);
}

tbody tr.selected {
    background-color: var(--beige);
}

td {
    padding-inline: var(--spacing-medium);
    padding-block: var(--spacing-small);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    user-select: none;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

td:not([class*='table-length-']) {
    flex: 1;
    min-width: var(--table-width-small);
}

tr {
    min-height: var(--table-row-min-height);
}

/* ── Column header controls ──────────────────────────────────────────────── */

.col-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: bold;
}

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

thead th:hover .col-filter-btn,
.col-filter-btn.has-filter {
    opacity: 1;
}

.col-filter-btn.has-filter span {
    color: var(--lavender);
}

.col-sort-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0 2px;
    cursor: pointer;
    line-height: 1;
    vertical-align: middle;
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

/* ── Boolean cell ────────────────────────────────────────────────────────── */

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

/* ── Selection column ────────────────────────────────────────────────────── */

.dt-selection {
    display: none;
}

.dt-selection.display {
    display: flex;
    max-width: 2rem;
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

/* ── Footer / pagination ─────────────────────────────────────────────────── */

.dt-footer {
    width: 100%;
    border-top: var(--border-width-thin) solid var(--gray-lighter);
    background-color: var(--white);
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

@media (max-width: 768px) {
    td {
        padding-inline: var(--spacing-sm);
        padding-block: var(--spacing-xs);
        font-size: var(--font-size-sm);
    }
}
</style>
