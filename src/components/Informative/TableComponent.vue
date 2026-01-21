<template>
<table>
    <thead>
        <tr>
            <td v-for="(item, key) in Application.activeViewEntity?.getProperties()" :class="Application.activeViewEntity?.getCSSClasses()[key]">
                {{ item }}
            </td>
        </tr>
    </thead>

    <tbody>
        <tr v-for="item in data" @click="openDetailView(item)">
            <td v-for="column in item.getKeys()" :class="item.getCSSClasses()[column]" class="table-row">
                <span v-if="Application.activeViewEntity?.getPropertyType(column) !== Boolean">
                    {{ item.getMask()[column]?.side === MaskSides.START ? item.getMask()[column]?.mask : '' }}{{ item[column] instanceof BaseEntity ? item[column].getDefaultPropertyValue() : item.toObject()[column] }}{{ item.getMask()[column]?.side === MaskSides.END ? item.getMask()[column]?.mask : '' }}
                </span>

                <span v-else-if="Application.activeViewEntity?.getPropertyType(column) === Boolean" :class="GGCLASS + ' ' + (item.toObject()[column] ? 'row-check' : 'row-cancel')" class="boolean-row">
                    {{ item.toObject()[column] ? GGICONS.CHECK : GGICONS.CANCEL }}
                </span>
            </td>
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
import { MaskSides } from '@/enums/mask_sides';
import Application from '@/models/application';
export default {
    name: 'TableComponent',
    methods: {
        openDetailView(entity : BaseEntity) {
            Application.changeViewToDetailView(entity);
        }  
    },
    data() {
        const data : BaseEntity[] = [];
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
                })
            );
        }
        
        return {
            Application,
            MaskSides,
            BaseEntity,
            data,
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
    height: calc(100vh - 50px - 2rem - 2rem);
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
    font-size: 2rem;
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