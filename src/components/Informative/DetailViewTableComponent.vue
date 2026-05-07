<template>
    <!-- .table-wrapper is the SINGLE scroll container for both header and body.
         This ensures the sticky header always aligns with the scrolling body columns. -->
    <div class="table-wrapper">
        <div class="table-scroll-area">
            <table>
                <thead>
                    <tr>
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
                        @click="openDetailView(item)"
                    >
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
                                {{ getBooleanIcon(item, colKey) }}
                            </span>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';
import type { ConcreteEntityClass } from '@/types/entity.types';
import { useTableCore } from '@/composables/useTableCore';

// #region STATE

const data = ref<BaseEntity[]>([]);
const totalFromServer = ref<number>(0);

// #endregion

// #region HELPERS

function t(path: string): string {
    return GetLanguagedText(path);
}

const entityClass = computed(() =>
    Application.View.value.entityClass as unknown as typeof BaseEntity | null
);

const visibleProperties = computed<Record<string, string>>(() => {
    const ec = entityClass.value;
    if (!ec) return {};
    const allProps = ec.getProperties();
    const tempEntity = ec.createNewInstance();
    return Object.fromEntries(
        Object.entries(allProps).filter(([key]) => {
            if (ec.getPropertyType(key) === Array) return false;
            return !tempEntity.isHideInListView(key);
        })
    );
});

// #endregion

// #region COMPOSABLE

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
    sourceData: data,
    visibleProperties,
    t,
    serverPagination: {
        total: totalFromServer,
        onPageChange: loadData,
    },
});

// #endregion

// #region METHODS

async function loadData(): Promise<void> {
    const ec = Application.View.value.entityClass as ConcreteEntityClass<BaseEntity> | null;

    if (!ec) {
        data.value = [];
        totalFromServer.value = 0;
        currentPage.value = 1;
        return;
    }

    const probeEntity = new ec({});
    if (!probeEntity.isPersistent()) {
        data.value = [];
        totalFromServer.value = 0;
        currentPage.value = 1;
        return;
    }

    const limit = pageSize.value === 'ALL' ? 999999 : (pageSize.value as number);

    try {
        const result = await ec.getElementListPaginated({
            page: currentPage.value,
            limit,
            filter: '',
            sortBy: sortColumn.value || undefined,
            sortDir: sortDirection.value || undefined,
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

function openDetailView(entity: BaseEntity): void {
    const uniqueValue = entity.getUniquePropertyValue();

    if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
        Application.View.value.entityOid = 'new';
    } else {
        Application.View.value.entityOid = String(uniqueValue);
    }

    Application.changeViewToDetailView(entity);
}

// #endregion

// #region WATCHERS

watch(
    () => Application.View.value.entityClass,
    () => {
        currentPage.value = 1;
        void loadData();
    }
);

// #endregion

// #region LIFECYCLE

onMounted((): void => {
    void loadData();
});

onBeforeUnmount((): void => {
    cleanup();
});

// #endregion
</script>

<style scoped>
@import '@/css/table.css';

.table-wrapper {
    width: 100%;
    height: calc(100vh - var(--topbar-height) - (var(--spacing-2xl) * 2.5) - var(--detail-table-footer-offset));
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.table-scroll-area {
    flex: 1;
    overflow: auto;
    width: 100%;
    min-width: 0;
    overscroll-behavior: contain;
}

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

tbody {
    display: block;
    width: 100%;
    flex: 1;
}

tbody tr {
    display: flex;
    min-width: 100%;
}

.table-footer {
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

td {
    padding-inline: var(--spacing-medium);
    padding-block: var(--spacing-small);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    user-select: none;
    flex-shrink: 0;
}

td:not([class*='table-length-']) {
    flex: 1;
    min-width: var(--table-width-small);
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

@media (max-width: 768px) {
    td {
        padding-inline: var(--spacing-sm);
        padding-block: var(--spacing-xs);
        font-size: var(--font-size-sm);
    }
}
</style>
