<template>
    <div class="table-container" :class="[{ disabled: disabled }, { nonvalidated: !isInputValidated }]">
        <div class="table-header-row">
            <div class="left-side-space">
                <div class="icon"><img :src="moduleIcon" alt="" /></div>
                <span class="title">{{ moduleName }}</span>
                <div class="advice" v-if="!isInputValidated">
                    <div class="alert-btn">!</div>
                    <div class="val-list">
                        <span v-for="message in validationMessages">{{ message }}</span>
                    </div>
                </div>
            </div>

            <div class="right-side-space">
                <div class="TextInput search-input-container">
                    <label class="label-input">Buscar {{ moduleName }}</label>
                    <input type="text" class="main-input" placeholder=" " v-model="search" :disabled="disabled" />
                </div>
                <button
                    class="button alert fill"
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
                    <span :class="GGCLASS">{{ selectionIcon }}</span>
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
                    <th class="selection" :class="[{ display: isSelection }]"></th>
                    <th v-for="header in typeValue?.getProperties()">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredData" :class="[{ selected: selectedItems.includes(item) }]">
                    <td class="selection" :class="[{ display: isSelection }]">
                        <button
                            class="select-btn"
                            :class="[{ added: selectedItems.includes(item) }]"
                            @click="toggleItemSelection(item)"
                        >
                            <span :class="GGCLASS">{{ getItemIcon(item) }}</span>
                        </button>
                    </td>
                    <td v-for="property in item.getKeys()">
                        {{ item[property] }}
                    </td>
                </tr>
            </tbody>
            <tfoot></tfoot>
        </table>
    </div>
</template>
<script setup lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    modelValue: BaseEntity[];
    typeValue?: typeof BaseEntity;
    entity?: BaseEntity;
    propertyKey?: string;
    required?: boolean;
    requireddMessage?: string;
    disabled?: boolean;
    validated?: boolean;
    validatedMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
    required: false,
    requireddMessage: '',
    disabled: false,
    validated: true,
    validatedMessage: ''
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: BaseEntity[]): void;
}>();

const search = ref('');
const isSelection = ref(false);
const isInputValidated = ref(true);
const selectedItems = ref<BaseEntity[]>([]);
const validationMessages = ref<string[]>([]);

const moduleIcon = computed<string | undefined>(() => props.typeValue?.getModuleIcon());
const moduleName = computed<string | undefined>(() => props.typeValue?.getModuleName());
const selectionIcon = computed<string>(() => (isSelection.value ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID));

const filteredData = computed<BaseEntity[]>(() => {
    if (!search.value) {
        return props.modelValue;
    }
    return props.modelValue.filter((item) => {
        const defaultValue = item.getDefaultPropertyValue();
        if (defaultValue && typeof defaultValue === 'string') {
            return defaultValue.toLowerCase().includes(search.value.toLowerCase());
        }
        return false;
    });
});

function getItemIcon(item: BaseEntity): string {
    return selectedItems.value.includes(item) ? GGICONS.REMOVE : GGICONS.ADD;
}

function toggleItemSelection(item: BaseEntity): void {
    if (selectedItems.value.includes(item)) {
        selectedItems.value.splice(selectedItems.value.indexOf(item), 1);
    } else {
        selectedItems.value.push(item);
    }
}

function openModal(): void {
    if (!props.typeValue) return;

    Application.ApplicationUIService.showModalOnFunction(
        props.typeValue,
        (param: unknown): void => {
            if (param === undefined || param instanceof BaseEntity) {
                addSelectedElement(param);
            }
        },
        ViewTypes.LOOKUPVIEW
    );
}

function addSelectedElement(newElement: BaseEntity | undefined): void {
    if (newElement) {
        const updatedArray = [...props.modelValue, newElement];
        emit('update:modelValue', updatedArray);
    }
}

function toggleSelection(): void {
    isSelection.value = !isSelection.value;
    if (!isSelection.value) {
        selectedItems.value = [];
    }
}

function showDeleteModal(): void {
    Application.ApplicationUIService.openConfirmationMenu(
        confMenuType.WARNING,
        'Confirmar eliminación',
        'El elemento que esta a punto de eliminarse no podrá ser recuperado. ¿Desea continuar?',
        () => {
            const updatedArray = props.modelValue.filter((item) => !selectedItems.value.includes(item));
            emit('update:modelValue', updatedArray);
            selectedItems.value = [];
            isSelection.value = false;
        }
    );
}

async function isValidated(): Promise<boolean> {
    validationMessages.value = [];

    if (props.required && (!props.modelValue || props.modelValue.length === 0)) {
        validationMessages.value.push(props.requireddMessage || `${props.typeValue?.getModuleName()} is required.`);
    }

    if (props.entity && props.propertyKey) {
        const isValid = props.entity.isValidation(props.propertyKey);
        if (!isValid) {
            const validationMsg = props.entity.validationMessage(props.propertyKey);
            validationMessages.value.push(validationMsg || `${props.typeValue?.getModuleName()} is not valid.`);
        }
    } else if (!props.validated) {
        validationMessages.value.push(props.validatedMessage || `${props.typeValue?.getModuleName()} is not valid.`);
    }

    return validationMessages.value.length === 0;
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
    if (!isInputValidated.value) {
        Application.View.value.isValid = false;
    }
}

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
});
</script>

<style scoped>
.left-side-space {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    box-sizing: border-box;
    height: 100%;
    padding-block: var(--padding-small);
}
.title {
    font-size: var(--font-size-xl);
    font-weight: 600;
}
.table-container {
    height: var(--array-input-height-large);
    overflow: hidden;
    box-sizing: border-box;
}

.table-container .table-header-row {
    display: flex;
    align-items: center;
    height: var(--array-input-height-medium);
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    padding-inline: var(--padding-large);
    margin-bottom: var(--margin-small);
    justify-content: space-between;
    gap: var(--spacing-lg);
    box-sizing: border-box;
}

.right-side-space {
    display: flex;
    align-items: center;
    min-width: 50%;
    display: flex;
    justify-content: flex-end;
    flex-direction: row-reverse;
    gap: var(--spacing-lg);
    box-sizing: border-box;
}

.table {
    box-sizing: border-box;
    width: 100%;
    height: 20rem;
    background-color: var(--white);
    border-radius: var(--border-radius);
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
    padding: var(--spacing-sm);
    text-align: left;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 30ch;
}

.table td {
    height: 4rem;
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
}
.table tbody tr:hover {
    background-color: var(--bg-gray);
    cursor: pointer;
}

.table thead {
    height: 2.5rem;
    border-bottom: var(--border-width-thin) solid var(--gray-lighter);
    flex-shrink: 0;
}

.table tbody {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

.table tfoot {
    height: 2.5rem;
    border-top: var(--border-width-thin) solid var(--gray-lighter);
    flex-shrink: 0;
}

.table tr.selected {
    background-color: var(--beige);
}

.selection {
    display: none;
}
.select-btn span {
    color: var(--sky);
    transform: rotate(-180deg);
    transition: all var(--transition-slow) var(--timing-ease);
}
.select-btn.added span {
    transform: rotate(0deg);
    color: var(--accent-red);
}
.selection.display {
    display: flex;
    max-width: 3rem;
}

.search-input-container {
    width: 100%;
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
    font-size: var(--font-size-base);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
}
.val-list {
    display: flex;
    flex-direction: column;
}
.val-list span {
    font-size: var(--font-size-sm);
    color: var(--accent-red);
    margin-bottom: 0.2rem;
}
</style>
