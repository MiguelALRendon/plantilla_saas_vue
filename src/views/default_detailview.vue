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


    <FormGroupComponent title="Listas">
        <TabControllerComponent :tabs="getArrayListsTabs()">
            <TabComponent v-for="tab in entity.getArrayKeysOrdered()">
                <ArrayInputComponent
                    :entity="entity"
                    :property-key="tab"
                    :required="entity.isRequired(tab)"
                    :disabled="entity.isDisabled(tab)"
                    :validated="entity.isValidation(tab)"
                    :requiredd-message="entity.requiredMessage(tab)"
                    :validated-message="entity.validationMessage(tab)"
                    :model-value="getArrayModel(tab)"
                    @update:model-value="setArrayModel(tab, $event)"
                    :type-value="entityClass.getArrayPropertyType(tab)"
                />
            </TabComponent>
        </TabControllerComponent>
    </FormGroupComponent>
</template>

<script lang="ts">
import * as FormComponents from '@/components/Form';
import TabControllerComponent from '@/components/TabControllerComponent.vue';
import TabComponent from '@/components/TabComponent.vue';
import Application from '@/models/application';
import { BaseEntity, EmptyEntity } from '@/entities/base_entity';
import { ViewGroupRow } from '@/enums/view_group_row';
import { ViewTypes } from '@/enums/view_type';
import { useFormRenderer } from '@/composables/useFormRenderer';
import type { Component } from 'vue';

const _renderer = useFormRenderer();

export default {
    name: 'DefaultDetailView',
    components: {
        ...FormComponents,
        TabControllerComponent,
        TabComponent
    },

    // #region PROPERTIES
    data() {
        return {};
    },
    // #endregion

    // #region LIFECYCLE
    mounted() {
        if (!Application.View.value.entityObject) {
            Application.View.value.entityObject = Application.View.value.entityClass
                ? Application.View.value.entityClass.createNewInstance()
                : new EmptyEntity({});
        }

        Application.View.value.viewType = Application.View.value.entityObject ? ViewTypes.DETAILVIEW : ViewTypes.DEFAULTVIEW;
        Application.setButtonList();
    },
    // #endregion

    // #region COMPUTED
    computed: {
        entity(): BaseEntity {
            return (Application.View.value.entityObject ?? new EmptyEntity({})) as BaseEntity;
        },
        entityClass(): typeof BaseEntity {
            return (Application.View.value.entityClass ?? BaseEntity) as typeof BaseEntity;
        },
        defaultPropertyValue(): string {
            return String(this.entity.getDefaultPropertyValue() ?? '');
        },
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const viewGroupRows = this.entity.getViewGroupRows();
            const keys = this.entity.getKeys();

            const groups: Record<string, Array<{ rowType: ViewGroupRow; properties: string[] }>> = {};
            let currentGroup = 'default';

            for (const prop of keys) {
                /** Filtrar propiedades ocultas */
                if (this.entity.isHideInDetailView(prop)) {
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
        }
    },
    // #endregion

    // #region METHODS
    methods: {
        /**
         * FUTURE: async loadEntityFromAPI(oid: string) {
         *     try {
         *         const response = await Application.axiosInstance.get(
         *             `${this.entityClass.getApiEndpoint()}/${oid}`
         *         );
         *         this.entity = new this.entityClass(response.data);
         *         Application.View.value.entityObject = this.entity;
         *     } catch (error) {
         *         console.error('Error loading entity:', error);
         *     }
         * }
         */
        getRowComponent(rowType: ViewGroupRow) {
            switch (rowType) {
                case ViewGroupRow.SINGLE:
                    return 'div';
                case ViewGroupRow.PAIR:
                    return FormComponents.FormRowTwoItemsComponent;
                case ViewGroupRow.TRIPLE:
                    return FormComponents.FormRowThreeItemsComponent;
                default:
                    return FormComponents.FormRowTwoItemsComponent;
            }
        },
        getChunkClass(rowType: ViewGroupRow): string {
            return rowType === ViewGroupRow.SINGLE ? 'form-row-single' : '';
        },
        resolveInputForProp(prop: string): Component | null {
            return _renderer.resolveInputForProp(this.entityClass, this.entity, prop);
        },
        getInputProps(prop: string): Record<string, unknown> {
            return {
                entityClass: this.entityClass,
                entity: this.entity,
                propertyKey: prop,
                modelValue: _renderer.getModelValue(this.entityClass, this.entity, prop),
                'onUpdate:modelValue': (val: unknown) => _renderer.setModelValue(this.entity, prop, val),
                ..._renderer.getExtraProps(this.entityClass, this.entity, prop)
            };
        },
        getArrayModel(prop: string): BaseEntity[] {
            const value = this.entity[prop];
            return Array.isArray(value) ? (value as BaseEntity[]) : [];
        },
        setArrayModel(prop: string, value: BaseEntity[]): void {
            this.entity[prop] = value;
        },
        getArrayListsTabs(): Array<string> {
            const returnList: Array<string> = [];
            const listTypes = this.entity.getArrayKeysOrdered();
            for (let i = 0; i < listTypes.length; i++) {
                returnList.push(this.entityClass.getPropertyNameByKey(listTypes[i])!);
            }

            return returnList;
        }
    }
    // #endregion
};
</script>
<style scoped>
.form-row-single {
    width: 100%;
}
</style>
