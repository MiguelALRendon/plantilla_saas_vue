<template>
    <div class="table-wrapper">
        <DataTableComponent
            :key="entityClass?.name ?? ''"
            :source-data="data"
            :total-count="totalFromServer"
            :visible-properties="visibleProperties"
            :t="t"
            :entity-class="entityClass"
            :loading="isLoading"
            @request-data="loadData"
            @row-click="openDetailView"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { BaseEntity } from '@/entities/base_entity';
import { GetLanguagedText } from '@/helpers/language_helper';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';
import type { ConcreteEntityClass } from '@/types/entity.types';
import DataTableComponent, { type RequestDataParams } from '@/components/DataTableComponent.vue';

// #region STATE

const data = ref<BaseEntity[]>([]);
const totalFromServer = ref<number>(0);
const isLoading = ref<boolean>(false);

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
    const tempEntity = (ec as unknown as { createNewInstance(): BaseEntity }).createNewInstance();
    return Object.fromEntries(
        Object.entries(allProps).filter(([key]) => {
            if (ec.getPropertyType(key) === Array) return false;
            return !tempEntity.isHideInListView(key);
        })
    );
});

// #endregion

// #region METHODS

async function loadData(params?: RequestDataParams): Promise<void> {
    const ec = Application.View.value.entityClass as ConcreteEntityClass<BaseEntity> | null;

    if (!ec) {
        data.value = [];
        totalFromServer.value = 0;
        return;
    }

    const probeEntity = new ec({});
    if (!probeEntity.isPersistent()) {
        data.value = [];
        totalFromServer.value = 0;
        return;
    }

    const page = params?.page ?? 1;
    const pageSizeVal = params?.pageSize ?? 10;
    const limit = pageSizeVal === 'ALL' ? 999999 : (pageSizeVal as number);

    isLoading.value = true;
    try {
        const result = await ec.getElementListPaginated({
            page,
            limit,
            filter: '',
            sortBy: params?.sortBy,
            sortDir: params?.sortDir || undefined,
        });
        data.value = result.data;
        totalFromServer.value = result.total;
    } catch (error: unknown) {
        console.error('[DefaultListView] Failed to load entity list', error);
        data.value = [];
        totalFromServer.value = 0;
    } finally {
        isLoading.value = false;
    }
}

function openDetailView(entity: BaseEntity): void {
    const uniqueValue = entity.getUniquePropertyValue();
    Application.View.value.entityOid =
        uniqueValue === undefined || uniqueValue === null || uniqueValue === ''
            ? 'new'
            : String(uniqueValue);
    Application.changeViewToDetailView(entity);
}

// #endregion

// #region WATCHERS

// When the active entity class changes, DataTableComponent remounts (via :key),
// resetting all column/filter/pagination state. We clear data immediately so the
// previous module's rows don't linger while the new request is in-flight.
watch(
    () => Application.View.value.entityClass,
    () => {
        data.value = [];
        totalFromServer.value = 0;
        void loadData();
    }
);

// #endregion

// #region LIFECYCLE

onMounted((): void => {
    Application.View.value.viewType = ViewTypes.LISTVIEW;
    Application.setButtonList();
    void loadData();
});

// #endregion
</script>

<style scoped>
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
</style>
