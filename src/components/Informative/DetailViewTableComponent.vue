<template>
<table>
    <thead>
        <tr>
            <td v-for="(item, key) in Application.View.entityClass?.getProperties()" :class="Application.View.entityClass?.getCSSClasses()[key]">
                {{ item }}
            </td>
        </tr>
    </thead>

    <tbody>
        <tr v-for="item in data" @click="openDetailView(item)">
            <template v-for="column in item.getKeys()">
                <td :class="item.getCSSClasses()[column]" class="table-row" v-if="Application.View.entityClass?.getPropertyType(column) !== Array">
                    <span v-if="Application.View.entityClass?.getPropertyType(column) !== Boolean">
                        {{ item[column] instanceof BaseEntity ? item[column].getDefaultPropertyValue() : item.getFormattedValue(column) }}
                    </span>

                    <span v-else-if="Application.View.entityClass?.getPropertyType(column) === Boolean" :class="GGCLASS + ' ' + (item.toObject()[column] ? 'row-check' : 'row-cancel')" class="boolean-row">
                        {{ item.toObject()[column] ? GGICONS.CHECK : GGICONS.CANCEL }}
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
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';
import Application from '@/models/application';
export default {
    name: 'DetailViewTableComponent',
    methods: {
        openDetailView(entity : any) {
            // Setear entityOid antes de cambiar la vista
            const uniqueValue = entity.getUniquePropertyValue();
            if (uniqueValue === undefined || uniqueValue === null || uniqueValue === '') {
                Application.View.value.entityOid = 'new';
            } else {
                Application.View.value.entityOid = String(uniqueValue);
            }
            Application.changeViewToDetailView(entity as BaseEntity);
        }  
    },
    data() {
        const data : Products[] = [];
        for (let i = 1; i <= 50; i++) {
            data.push(
                new Products({
                    id: i,
                    name: `Producto ${i}`,
                    description: `Descripción del producto asdf fasdfasdfasdf ta sdf sd fasdf   asdfasdfasdf asdfasfafsdf ${i}`,
                    stock: Math.floor(Math.random() * 50) + 1,
                    Catedral: new Products({
                        id: i + 100,
                        name: `Inner Producto ${i}`,
                        description: `Inner Descripción del producto ${i}`,
                        stock: Math.floor(Math.random() * 50) + 1,
                    }),
                    bolian: i % 2 === 0,
                    listaProductos: [
                        new Products({
                            id: i + 200,
                            name: `List Producto A ${i}`,
                            description: `List Descripción del producto A ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                        new Products({
                            id: i + 300,
                            name: `List Producto B ${i}`,
                            description: `List Descripción del producto B ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                        new Products({
                            id: i + 400,
                            name: `List Producto C ${i}`,
                            description: `List Descripción del producto C ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                        new Products({
                            id: i + 500,
                            name: `List Producto D ${i}`,
                            description: `List Descripción del producto D ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                        new Products({
                            id: i + 600,
                            name: `List Producto E ${i}`,
                            description: `List Descripción del producto E ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                        new Products({
                            id: i + 700,
                            name: `List Producto F ${i}`,
                            description: `List Descripción del producto F ${i}`,
                            stock: Math.floor(Math.random() * 50) + 1,
                        }),
                    ]
                })
            );
        }
        
        return {
            Application,
            BaseEntity,
            data: data as any as Products[],
            GGICONS,
            GGCLASS
        }
    },
}
</script>

<style scoped>
@import '@/css/table.css';

table {
    width: 100%;
    height: calc(100vh - 50px - 2rem - 2rem - 4.3rem);
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
    z-index: 1;
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
    padding-inline: 1rem;
    padding-block: 0.5rem;
    border-bottom: 1px solid var(--gray-lighter);
    user-select: none;
    width: 100%;
}

tr {
    min-height: 3rem;
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
    font-size: 1.75rem;
    margin-left: 2rem;
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