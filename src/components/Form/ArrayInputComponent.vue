<template>
    <div class="table-container" :class="[{ disabled: disabled }, { nonvalidated: !isInputValidated }]">
        <DataTableComponent
            :source-data="filteredData"
            :visible-properties="visibleProperties"
            :t="t"
            :selectable="true"
            :is-selection="isSelection"
            :is-all-selected="isAllSelected"
            :selected-items="selectedItems"
            @row-click="toggleItemSelection"
            @toggle-item-selection="toggleItemSelection"
            @toggle-select-all="toggleSelectAll"
        >
            <template #toolbar>
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
                            <label class="label-input">{{ t('common.search') }} {{ moduleName }}</label>
                            <input type="text" class="main-input" placeholder=" " v-model="search" :disabled="disabled" />
                        </div>
                        <button
                            class="button alert fill"
                            :disabled="selectedItems.length == 0 || disabled"
                            @click="showDeleteModal"
                        >
                            <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.DELETE }}</span>
                            <span class="btn-label">{{ t('common.delete') }}</span>
                        </button>
                        <button
                            class="button success fill"
                            @click="toggleSelection"
                            :disabled="modelValue.length == 0 || disabled"
                        >
                            <span :class="[GGCLASS, 'btn-icon']">{{ selectionIcon }}</span>
                            <span class="btn-label">{{ t('common.select') }}</span>
                        </button>
                        <button class="button secondary fill" @click="openModal" :disabled="disabled">
                            <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.ADD }}</span>
                            <span class="btn-label">{{ t('common.add') }}</span>
                        </button>
                    </div>
                </div>
            </template>
        </DataTableComponent>
    </div>
</template>
<script setup lang="ts">
import { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DataTableComponent from '@/components/DataTableComponent.vue';

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

// #region PROPERTIES
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
// #endregion

// #region COMPUTED PROPERTIES

const moduleIcon = computed<string | undefined>(() => props.typeValue?.getModuleIcon());
const moduleName = computed<string | undefined>(() => props.typeValue?.getModuleName());
const selectionIcon = computed<string>(() => (isSelection.value ? GGICONS.SELECT_CHECKBOX : GGICONS.SELECT_VOID));

// Search filter applied to the full modelValue list
const filteredData = computed<BaseEntity[]>(() => {
    if (!search.value) return props.modelValue;
    return props.modelValue.filter((item) => {
        const defaultValue = item.getDefaultPropertyValue();
        if (defaultValue && typeof defaultValue === 'string') {
            return defaultValue.toLowerCase().includes(search.value.toLowerCase());
        }
        return false;
    });
});

// Column metadata: visible non-array properties respecting @HideInListView
const visibleProperties = computed<Record<string, string>>(() => {
    if (!props.typeValue) return {};
    const allProps = props.typeValue.getProperties();
    const tempEntity = (props.typeValue as unknown as { createNewInstance(): BaseEntity }).createNewInstance();
    return Object.fromEntries(
        Object.entries(allProps).filter(([key]) => {
            if (props.typeValue!.getPropertyType(key) === Array) return false;
            return !tempEntity.isHideInListView(key);
        })
    );
});

function t(path: string): string {
    return GetLanguagedText(path);
}

// #endregion

// #region SELECTION

function toggleItemSelection(item: BaseEntity): void {
    if (selectedItems.value.includes(item)) {
        selectedItems.value.splice(selectedItems.value.indexOf(item), 1);
    } else {
        selectedItems.value.push(item);
    }
}

// T118 — true when every item on the current page is selected
const isAllSelected = computed<boolean>(() => {
    if (props.modelValue.length === 0) return false;
    return filteredData.value.every((item) => selectedItems.value.includes(item));
});

// T119 — Toggle select/deselect all visible items
function toggleSelectAll(): void {
    if (isAllSelected.value) {
        selectedItems.value = selectedItems.value.filter(
            (item) => !filteredData.value.includes(item)
        );
    } else {
        for (const item of filteredData.value) {
            if (!selectedItems.value.includes(item)) {
                selectedItems.value.push(item);
            }
        }
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
        t('common.confirm_delete'),
        t('common.confirm_delete_message'),
        () => {
            const updatedArray = props.modelValue.filter((item) => !selectedItems.value.includes(item));
            emit('update:modelValue', updatedArray);
            selectedItems.value = [];
            isSelection.value = false;
        }
    );
}

// #endregion

// #region VALIDATION

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

// #endregion

// #region LIFECYCLE

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
});

// #endregion
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
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
}

.table-header-row {
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
    flex-shrink: 0;
}

.right-side-space {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
    flex-direction: row-reverse;
    gap: var(--spacing-lg);
    box-sizing: border-box;
    overflow: hidden;
}

/* Search input: fills available space and shrinks last */
.search-input-container {
    flex: 1;
    min-width: 0;
}

/* Action buttons: never shrink — labels handled by .btn-label at ≤992px */
.right-side-space .button {
    flex-shrink: 0;
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
