<template>
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
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';

import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';

const data: Ref<BaseEntity[]> = ref([]);

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

onMounted((): void => {
    loadData();
});
</script>

<style scoped>
@import '@/css/table.css';

table {
    width: 100%;
    height: calc(100vh - var(--topbar-height) - (var(--spacing-2xl) * 2) - var(--detail-table-footer-offset));
    background-color: var(--white);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-light);
    overflow: auto;
}

thead {
    display: block;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: var(--z-base);
}

thead tr {
    display: flex;
    width: 100%;
}

thead td {
    font-weight: bold;
}

tbody {
    display: block;
    width: 100%;
    overflow-y: auto;
    overflow-x: auto;
    flex: 1;
    scrollbar-gutter: stable;
}

tbody tr {
    display: flex;
    width: 100%;
}

tfoot {
    display: block;
    width: 100%;
}

tfoot tr {
    display: flex;
    width: 100%;
}

td {
    padding-inline: var(--spacing-medium);
    padding-block: var(--spacing-small);
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    user-select: none;
    width: 100%;
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
</style>
