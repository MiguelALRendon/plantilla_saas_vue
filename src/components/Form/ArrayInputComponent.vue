<template>
<div class="table-container" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <div class="table-header-row">
        <div class="left-side-space">
            <div class="icon"><img :src="typeValue?.getModuleIcon()" alt=""></div>
            <span class="title">{{ typeValue?.getModuleName() }}</span>
            <div class="advice" v-if="!isInputValidated">
                <div class="alert-btn">!</div>
                <div class="val-list">
                    <span v-for="message in validationMessages">{{ message }}</span>
                </div>
            </div>
        </div>

        <div class="right-side-space">
            <div class="TextInput" style="width: 100%">
                <label class="label-input">Buscar {{ typeValue?.getModuleName() }}</label>
                <input 
                    type="text" 
                    class="main-input" 
                    placeholder=" "
                    v-model="search"
                    :disabled="disabled"
                />
            </div>
            <button class="button alert fill" 
            :disabled="selectedItems.length == 0 || disabled"
            @click="showDeleteModal"
            >
                <span :class="GGCLASS">{{ GGICONS.DELETE }}</span>
                Eliminar
            </button>
            <button 
            class="button success fill" 
            @click="toggleSelection"
            :disabled="modelValue.length == 0 || disabled"
            >
                <span :class="GGCLASS">{{ isSelection ?
                    GGICONS.SELECT_CHECKBOX :
                    GGICONS.SELECT_VOID
                }}</span>
                Seleccionar
            </button>
            <button class="button secondary fill" @click="openModal" :disabled="disabled">
                <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
                Agregar
            </button>
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
            <tr v-for="item in filteredData" :class="[{selected: selectedItems.includes(item)}]">
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
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { confMenuType } from '@/enums/conf_menu_type';

export default {
  name: 'ArrayInputComponent',
  components: {},
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
        required: {
            type: Boolean,
            required: false,
            default: false,
        },
        requireddMessage: {
            type: String,
            required: false,
            default: '',
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        validated: {
            type: Boolean,
            required: false,
            default: true,
        },
        validatedMessage: {
            type: String,
            required: false,
            default: '',
        },
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.saveItem);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.saveItem);
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
        showDeleteModal() {
            Application.openConfirmationMenu(
                confMenuType.WARNING,
                'Confirmar eliminación',
                'El elemento que esta a punto de eliminarse no podrá ser recuperado. ¿Desea continuar?',
                () => {
                    const updatedArray = this.modelValue.filter(item => !this.selectedItems.includes(item));
                    this.$emit('update:modelValue', updatedArray);
                    this.selectedItems = [];
                    this.isSelection = false;
                },
            );
        },
        isValidated(): boolean {
            this.validationMessages = [];
            if (this.required && (!this.modelValue || this.modelValue.length === 0)) {
                this.validationMessages.push(this.requireddMessage || `${this.typeValue?.getModuleName()} is required.`);
            }
            if (!this.validated) {
                this.validationMessages.push(this.validatedMessage || `${this.typeValue?.getModuleName()} is not valid.`);
            }
            return this.validationMessages.length === 0;
        },
        saveItem() {
            this.isInputValidated = this.isValidated();
            if (!this.isInputValidated) {
                Application.View.value.isValid = false;
            }
        },
    },
    computed: {
        filteredData() {
            if (!this.search) {
                return this.modelValue;
            }
            return this.modelValue.filter(item => {
                const defaultValue = item.getDefaultPropertyValue();
                if (defaultValue && typeof defaultValue === 'string') {
                    return defaultValue.toLowerCase().includes(this.search.toLowerCase());
                }
                return false;
            });
        },
    },
    data() {
    return {
        Application,
        GGICONS,
        GGCLASS,
        search: '',
        isSelection: false,
        isInputValidated: true,
        selectedItems: [] as BaseEntity[],
        validationMessages: [] as string[],
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
    border-collapse: collapse !important;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 30ch;
}

.table td{
    height: 4rem;
    border-bottom: 1px solid var(--gray-lighter);
}
.table tbody tr:hover {
    background-color: var(--bg-gray);
    cursor: pointer;
}

.table thead{
    height: 2.5rem;
    border-bottom: 1px solid var(--gray-lighter);
    flex-shrink: 0;
}

.table tbody {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

.table tfoot{
    height: 2.5rem;
    border-top: 1px solid var(--gray-lighter);
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

.advice {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;

}
.alert-btn {
    background-color: var(--accent-red);
    color: var(--white);
    border: none;
    border-radius: 50%;
    width: 1.5rem;
    height: 1.5rem;
    font-weight: bold;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
}
.val-list{
    display: flex;
    flex-direction: column;
}
.val-list span{
    font-size: 0.875rem;
    color: var(--accent-red);
    margin-bottom: 0.2rem;
}
</style>