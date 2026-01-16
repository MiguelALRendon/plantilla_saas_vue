<template>
<h2 class="title">{{ entity.getDefaultPropertyValue() }}</h2>

<div v-for="(group, groupName) in groupedProperties" :key="groupName">
    <FormGroupComponent :title="groupName">
        <template v-for="(chunk, index) in group" :key="index">
            <component 
                :is="getRowComponent(chunk.rowType)" 
                :class="chunk.rowType === 'single' ? 'form-row-single' : ''">
                <div v-for="prop in chunk.properties" :key="prop">
                    <NumberInputComponent 
                    v-if="entityClass.getPropertyType(prop) === Number"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <ObjectInputComponent 
                    v-if="isBaseEntityType(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    :modelType="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <DateInputComponent
                    v-if="entityClass.getPropertyType(prop) === Date"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <!-- APARTADO PARA LOS INPUTS EN BASE STRING -->
                    <TextInputComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXT"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <TextAreaComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXTAREA"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />
                    <!---------------------------------------------->
                </div>
            </component>
        </template>
    </FormGroupComponent>
</div>
</template>

<script lang="ts">
import FormGroupComponent from '@/components/Form/FormGroupComponent.vue';
import FormRowTwoItemsComponent from '@/components/Form/FormRowTwoItemsComponent.vue';
import FormRowThreeItemsComponent from '@/components/Form/FormRowThreeItemsComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import ObjectInputComponent from '@/components/Form/ObjectInputComponent.vue';
import DateInputComponent from '@/components/Form/DateInputComponent.vue';
import { BaseEntity } from '@/entities/base_entitiy';
import { DetailTypes } from '@/enums/detail_type';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import Application from '@/models/application';
import TextAreaComponent from '@/components/Form/TextAreaComponent.vue';

export default {
    name: 'DefaultDetailView',
    components: {
        DateInputComponent,
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        TextInputComponent,
        TextAreaComponent,
        ObjectInputComponent,
        NumberInputComponent
    },
    data() {
        return {
            StringType,
            BaseEntity,
            entity: Application.activeViewComponentProps.value as BaseEntity,
            entityClass: Application.activeViewEntity.value as typeof BaseEntity,
            detailType: Application.activeViewComponentProps.value?.viewType as DetailTypes,
        };
    },
    computed: {
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const viewGroupRows = this.entity.getViewGroupRows();
            const keys = this.entity.getKeys();
            
            const groups: Record<string, Array<{ rowType: string, properties: string[] }>> = {};
            let currentGroup = 'default';
            
            for (const prop of keys) {
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
    methods: {
        getRowComponent(rowType: string) {
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
        },
        isBaseEntityType(prop: string): boolean {
            const propType = this.entityClass.getPropertyType(prop);
            return propType && propType.prototype instanceof BaseEntity;
        }
    }
}
</script>
<style scoped>
.form-row-single {
    width: 100%;
}
</style>
