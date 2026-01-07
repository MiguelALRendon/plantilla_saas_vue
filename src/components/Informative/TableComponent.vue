<template>
<table>
    <thead>
        <tr>
            <td v-for="item in Application.activeView?.moduleModelType.getColumns()">
                {{ item }}
            </td>
        </tr>
    </thead>

    <tbody>
        <tr v-for="item in data">
            <td v-for="column in item.getKeys()">
                {{ item.getMask()[column]?.side === MaskSides.START ? item.getMask()[column]?.mask : '' }}{{ item.toObject()[column] }}{{ item.getMask()[column]?.side === MaskSides.END ? item.getMask()[column]?.mask : '' }}
            </td>
        </tr>
    </tbody>

    <tfoot>
        <tr></tr>
    </tfoot>
</table>
</template>

<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';
import { MaskSides } from '@/enums/mask_sides';
import Application from '@/models/application';
export default {
    name: 'TableComponent',
    data() {
        const data : BaseEntity[] = [];
        for (let i = 1; i <= 50; i++) {
            data.push(
                new Products({
                    id: i,
                    name: `Producto ${i}`,
                    description: `Descripción del producto ${i}`,
                    price: Math.floor(Math.random() * 100) + 1,
                    stock: Math.floor(Math.random() * 50) + 1,
                })
            );
        }
        
        return {
            Application,
            MaskSides,
            data
        }
    },
}
</script>

<style scoped>
table {
    width: 100%;
    height: calc(100vh - 50px - 2rem - 2rem);
    background-color: white;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
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
    flex: 1;
    font-weight: bold;
}

tbody {
    display: block;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    scrollbar-gutter: stable;
}

tbody tr {
    display: flex;
    width: 100%;
}

tbody td {
    flex: 1;
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
    border: 1px solid #e0e0e0;
    user-select: none;
    cursor: pointer;
}

tr {
    min-height: 3rem;
}
</style>