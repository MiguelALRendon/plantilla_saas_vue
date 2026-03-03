<template>
    <!-- .table-wrapper is the SINGLE scroll container for both header and body.
         This ensures the sticky header always aligns with the scrolling body columns. -->
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <td
                        v-for="(item, key) in Application.View.value.entityClass?.getProperties()"
                        :key="key"
                        :class="Application.View.value.entityClass?.getCSSClasses()[key]"
                    >
                        {{ item }}
                    </td>
                </tr>
            </thead>

            <tbody>
                <tr v-for="item in data" :key="String(item.getUniquePropertyValue() ?? item.entityObjectId ?? '')" @click="openDetailView(item)">
                    <template v-for="column in item.getKeys()" :key="column">
                        <td
                            :class="item.getCSSClasses()[column]"
                            class="table-row"
                            v-if="Application.View.value.entityClass?.getPropertyType(column) !== Array"
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
import { onMounted, ref, watch, type Ref } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

// #region PROPERTIES
const data: Ref<BaseEntity[]> = ref([]);
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

function getCellValue(item: BaseEntity, column: string): string {
    const value = item[column];

    return value instanceof BaseEntity
        ? String(value.getDefaultPropertyValue() ?? '')
        : item.getFormattedValue(column);
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
