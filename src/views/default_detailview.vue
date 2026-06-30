<template>
    <h2 class="title">{{ defaultPropertyValue }}</h2>

    <div v-for="(group, groupName) in groupedProperties" :key="groupName">
        <FormGroupComponent :title="groupName">
            <template v-for="(chunk, index) in group" :key="index">
                <component
                    :is="getRowComponent(chunk.rowType)"
                    :class="getChunkClass(chunk.rowType)"
                >
                    <!-- T126 — Registry-based component resolution; replaces 16-branch v-if cascade -->
                    <div v-for="prop in chunk.properties" :key="prop">
                        <component
                            v-if="resolveInputForProp(prop)"
                            :is="resolveInputForProp(prop)"
                            v-bind="getInputProps(prop)"
                        />
                    </div>
                </component>
            </template>
        </FormGroupComponent>
    </div>


    <FormGroupComponent v-if="entity.getArrayKeysOrdered().length > 0" title="Listas">
        <TabControllerComponent :tabs="getArrayListsTabs()">
            <TabComponent v-for="tab in entity.getArrayKeysOrdered()" :key="tab">
                <ArrayInputComponent
                    :entity="entity"
                    :property-key="tab"
                    :required="entity.isRequired(tab)"
                    :disabled="entity.isDisabled(tab)"
                    :validated="entity.isValidation(tab)"
                    :required-message="entity.requiredMessage(tab)"
                    :validated-message="entity.validationMessage(tab)"
                    :model-value="getArrayModel(tab)"
                    @update:model-value="setArrayModel(tab, $event)"
                    :type-value="entityClass.getArrayPropertyType(tab)"
                />
            </TabComponent>
        </TabControllerComponent>
    </FormGroupComponent>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Component } from 'vue';

import {
    FormGroupComponent,
    ArrayInputComponent,
    FormRowTwoItemsComponent,
    FormRowThreeItemsComponent,
} from '@/components/Form';
import TabControllerComponent from '@/components/TabControllerComponent.vue';
import TabComponent from '@/components/TabComponent.vue';
import Application from '@/models/application';
import { BaseEntity, EmptyEntity } from '@/entities/base_entity';
import { ViewGroupRow } from '@/enums/view_group_row';
import { ViewTypes } from '@/enums/view_type';
import { useFormRenderer } from '@/composables/useFormRenderer';

const renderer = useFormRenderer();

// #region COMPUTED
const entity = computed<BaseEntity>(() => (Application.View.value.entityObject ?? new EmptyEntity({})) as BaseEntity);
const entityClass = computed<typeof BaseEntity>(() => (Application.View.value.entityClass ?? BaseEntity) as typeof BaseEntity);
const defaultPropertyValue = computed<string>(() => String(entity.value.getDefaultPropertyValue() ?? ''));

const groupedProperties = computed<Record<string, Array<{ rowType: ViewGroupRow; properties: string[] }>>>(() => {
    const viewGroups = entity.value.getViewGroups();
    const viewGroupRows = entity.value.getViewGroupRows();
    const keys = entity.value.getKeys();

    const groups: Record<string, Array<{ rowType: ViewGroupRow; properties: string[] }>> = {};
    let currentGroup = 'default';

    for (const prop of keys) {
        /** Filtrar propiedades ocultas */
        if (entity.value.isHideInDetailView(prop)) {
            continue;
        }

        if (viewGroups[prop]) {
            currentGroup = viewGroups[prop];
            if (!groups[currentGroup]) {
                groups[currentGroup] = [];
            }
        }

        if (!groups[currentGroup]) {
            groups[currentGroup] = [];
        }
        const rowType = viewGroupRows[prop] || ViewGroupRow.PAIR;
        const lastChunk = groups[currentGroup][groups[currentGroup].length - 1];

        if (lastChunk && lastChunk.rowType === rowType) {
            lastChunk.properties.push(prop);
        } else {
            groups[currentGroup].push({
                rowType: rowType,
                properties: [prop]
            });
        }
    }

    return groups;
});
// #endregion

// #region METHODS
function getRowComponent(rowType: ViewGroupRow): Component | string {
    switch (rowType) {
        case ViewGroupRow.SINGLE:
            return 'div';
        case ViewGroupRow.PAIR:
            return FormRowTwoItemsComponent;
        case ViewGroupRow.TRIPLE:
            return FormRowThreeItemsComponent;
        default:
            return FormRowTwoItemsComponent;
    }
}

function getChunkClass(rowType: ViewGroupRow): string {
    return rowType === ViewGroupRow.SINGLE ? 'form-row-single' : '';
}

function resolveInputForProp(prop: string): Component | null {
    return renderer.resolveInputForProp(entityClass.value, entity.value, prop);
}

function getInputProps(prop: string): Record<string, unknown> {
    return {
        entityClass: entityClass.value,
        entity: entity.value,
        propertyKey: prop,
        modelValue: renderer.getModelValue(entityClass.value, entity.value, prop),
        'onUpdate:modelValue': (val: unknown) => renderer.setModelValue(entity.value, prop, val),
        ...renderer.getExtraProps(entityClass.value, entity.value, prop)
    };
}

function getArrayModel(prop: string): BaseEntity[] {
    const value = entity.value[prop];
    return Array.isArray(value) ? (value as BaseEntity[]) : [];
}

function setArrayModel(prop: string, value: BaseEntity[]): void {
    entity.value[prop] = value;
}

function getArrayListsTabs(): Array<string> {
    const returnList: Array<string> = [];
    const listTypes = entity.value.getArrayKeysOrdered();
    for (let i = 0; i < listTypes.length; i++) {
        returnList.push(entityClass.value.getPropertyNameByKey(listTypes[i])!);
    }

    return returnList;
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    if (!Application.View.value.entityObject) {
        Application.View.value.entityObject = Application.View.value.entityClass
            ? Application.View.value.entityClass.createNewInstance()
            : new EmptyEntity({});
    }

    Application.View.value.viewType = Application.View.value.entityObject ? ViewTypes.DETAILVIEW : ViewTypes.DEFAULTVIEW;
    Application.setButtonList();
});
// #endregion
</script>
<style scoped>
.form-row-single {
    width: 100%;
}
</style>
