<template>
<div class="table-container">
    <div class="table-header-row">
        <div class="left-side-space">
            <div class="icon"><img :src="typeValue?.getModuleIcon()" alt=""></div>
            <span class="title">{{ typeValue?.getModuleName() }}</span>
        </div>

        <div class="right-side-space">
            <TextInputComponent v-model="search" :property-name="'Buscar ' + typeValue?.getModuleName()"/>
            <button class="button primary fill" :disabled="selectedItems.length == 0">Eliminar</button>
            <button class="button success fill" @click="toggleSelection">Seleccionar</button>
            <button class="button secondary fill" @click="openModal">Agregar</button>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th class="selection" :class="[{display: isSelection}]"></th>
                <th v-for="header in typeValue?.getProperties()">{{ header }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in modelValue" :class="[{selected: selectedItems.includes(item)}]">
                <td class="selection" :class="[{display: isSelection}]">
                    <button class="select-btn" 
                    :class="[{added: selectedItems.includes(item)}]"
                    @click="selectedItems.includes(item) ? selectedItems.splice(selectedItems.indexOf(item), 1) : selectedItems.push(item)">
                        <span :class="GGCLASS">{{ selectedItems.includes(item) ? GGICONS.REMOVE : GGICONS.ADD }}</span>
                    </button>
                </td>
                <td v-for="property in item.getKeys()">
                    {{ item[property] }}
                </td>
            </tr>
        </tbody>
        <tfoot>
        </tfoot>
    </table>
</div>
</template>
<script lang="ts">
import { BaseEntity } from '@/entities/base_entitiy';
import { PropType } from 'vue';
import TextInputComponent from './TextInputComponent.vue';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';

export default {
  name: 'ArrayInputComponent',
  components: {
    TextInputComponent,
  },
    methods: {
        openModal() {
            Application.showModalOnFunction(this.typeValue!, this.addSelectedElement, ViewTypes.LOOKUPVIEW);
        },
        addSelectedElement(newElement: BaseEntity | undefined) {
            if (newElement) {
                const updatedArray = [...this.modelValue, newElement];
                this.$emit('update:modelValue', updatedArray);
            }
        },
        toggleSelection() {
            this.isSelection = !this.isSelection;
            if (!this.isSelection) {
                this.selectedItems = [];
            }
        },
    },
  props: {
    modelValue: {
      type: Array<BaseEntity>,
      required: true,
      default: () => [],
    },
    typeValue: {
      type: Function as unknown as PropType<typeof BaseEntity | undefined>,
      required: true,
    },
  },
  data() {
    return {
      GGICONS,
      GGCLASS,
      search: '',
      isSelection: false,
      selectedItems: [] as BaseEntity[],
    };
  },
};
</script>

<style scoped>
.left-side-space {
    display: flex;
    align-items: center;
    gap: 1rem;
    box-sizing: border-box;
    height: 100%;
    padding-block: .5rem;
}
.title{
    font-size: 1.25rem;
    font-weight: 600;
}
.table-container {
  height: 26rem;
  overflow: hidden;
  box-sizing: border-box;
}

.table-container .table-header-row{
    display: flex;
    align-items: center;
    height: 5rem;
    background-color: var(--white);
    border-radius: 1rem;
    box-shadow: var(--shadow-light);
    padding-inline: 1rem;
    margin-bottom: 0.5rem;
    justify-content: space-between;
    gap: 1rem;
    box-sizing: border-box;
}

.right-side-space {
    display: flex;
    align-items: center;
    min-width: 50%;
    display: flex;
    justify-content: flex-end;
    flex-direction: row-reverse;
    gap: 1rem;
    box-sizing: border-box;
}

.table{
    box-sizing: border-box;
    width: 100%;
    height: 20rem;
    background-color: var(--white);
    border-radius: 1rem;
    box-shadow: var(--shadow-light);
    display: flex;
    flex-direction: column;
    border-collapse: collapse;
}

.table thead,
.table tbody,
.table tfoot {
    display: block;
    width: 100%;
}

.table tr {
    display: flex;
    width: 100%;
}

.table th,
.table td {
    flex: 1;
    padding: 0.5rem;
    text-align: left;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 30ch;
}

.table td{
    height: 4rem;
    border-bottom: 1px solid var(--bg-gray);
}
.table tbody tr:hover {
    background-color: var(--bg-gray);
    cursor: pointer;
}

.table thead{
    height: 2.5rem;
    border-bottom: 1px solid var(--bg-gray);
    flex-shrink: 0;
}

.table tbody {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

.table tfoot{
    height: 2.5rem;
    border-top: 1px solid var(--bg-gray);
    flex-shrink: 0;
}

.table tr.selected {
    background-color: var(--beige) !important;
}

.selection {
    display: none !important;
}
.select-btn span {
    color: var(--sky);
    transform: rotate(-180deg);
    transition: 0.5s ease;
}
.select-btn.added span {
    transform: rotate(0deg);
    color: var(--accent-red);
}
.selection.display {
    display: flex !important;
    max-width: 3rem;
}
</style>