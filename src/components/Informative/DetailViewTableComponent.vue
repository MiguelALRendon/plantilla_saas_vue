<template>
    <table>
        <thead>
            <tr>
                <td
                    v-for="(item, key) in Application.View.entityClass?.getProperties()"
                    :class="Application.View.entityClass?.getCSSClasses()[key]"
                >
                    {{ item }}
                </td>
            </tr>
        </thead>

        <tbody>
            <tr v-for="item in data" @click="openDetailView(item)">
                <template v-for="column in item.getKeys()">
                    <td
                        :class="item.getCSSClasses()[column]"
                        class="table-row"
                        v-if="Application.View.entityClass?.getPropertyType(column) !== Array"
                    >
                        <span v-if="Application.View.entityClass?.getPropertyType(column) !== Boolean">
                            {{
                                item[column] instanceof BaseEntity
                                    ? item[column].getDefaultPropertyValue()
                                    : item.getFormattedValue(column)
                            }}
                        </span>

                        <span
                            v-else-if="Application.View.entityClass?.getPropertyType(column) === Boolean"
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

<script lang="ts">
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
export default {
    name: 'DetailViewTableComponent',
    methods: {
        async loadData(): Promise<void> {
            const entityClass = Application.View.value.entityClass as
                | (typeof BaseEntity & (new (data: Record<string, unknown>) => BaseEntity))
                | null;

            if (!entityClass) {
                this.data = [];
                return;
            }

            try {
                const entities = await entityClass.getElementList('');
                this.data = entities;
            } catch (error: unknown) {
                console.error('[DetailViewTableComponent] Failed to load entity list', error);
                this.data = [];
            }
        },
        getBooleanIcon(item: BaseEntity, column: string): string {
            return item.toObject()[column] ? GGICONS.CHECK : GGICONS.CANCEL;
        },
        openDetailView(entity: BaseEntity) {
            /** Setear entityOid antes de cambiar la vista */
            const uniqueValue = entity.getUniquePropertyValue();
            if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
                Application.View.value.entityOid = 'new';
            } else {
                Application.View.value.entityOid = String(uniqueValue);
            }
            Application.changeViewToDetailView(entity as BaseEntity);
        }
    },
    mounted() {
        this.loadData();
    },
    data() {
        return {
            Application,
            BaseEntity,
            data: [] as BaseEntity[],
            GGICONS,
            GGCLASS
        };
    }
};
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
    border-bottom: 1px solid var(--gray-lighter);
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
