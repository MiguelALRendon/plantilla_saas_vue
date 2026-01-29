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
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <ObjectInputComponent 
                    v-if="isBaseEntityType(prop)"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    :modelType="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <DateInputComponent
                    v-if="entityClass.getPropertyType(prop) === Date"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <BooleanInputComponent
                    v-if="entityClass.getPropertyType(prop) === Boolean"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <ListInputComponent
                    v-if="entityClass.getPropertyType(prop) instanceof EnumAdapter"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    :property-enum-values="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <!-- APARTADO PARA LOS INPUTS EN BASE STRING -->
                    <TextInputComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXT"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <TextAreaComponent 
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.TEXTAREA"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <EmailInputComponent
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.EMAIL"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />

                    <PasswordInputComponent
                    v-if="entityClass.getPropertyType(prop) === String && entity.getStringType()[prop] == StringType.PASSWORD"
                    :required="entity.isRequired(prop)"
                    :disabled="entity.isDisabled(prop)"
                    :validated="entity.isValidation(prop)"
                    :requiredd-message="entity.requiredMessage(prop)"
                    :validated-message="entity.validationMessage(prop)"
                    :property-name="entityClass.getPropertyNameByKey(prop)"
                    v-model="entity[prop]" />
                    <!---------------------------------------------->
                </div>
            </component>
        </template>
    </FormGroupComponent>
</div>

<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeys()">
            <ArrayInputComponent 
            :required="entity.isRequired(tab)"
            :disabled="entity.isDisabled(tab)"
            :validated="entity.isValidation(tab)"
            :requiredd-message="entity.requiredMessage(tab)"
            :validated-message="entity.validationMessage(tab)"
            v-model="entity[tab]" 
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
import { BaseEntity } from '@/entities/base_entitiy';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import { EnumAdapter } from '@/models/enum_adapter';

export default {
    name: 'DefaultDetailView',
    components: {
        ...FormComponents,
        TabControllerComponent,
        TabComponent
    },
    data() {
        return {
            StringType,
            EnumAdapter,
            BaseEntity,
            entity: Application.View.value.entityObject as BaseEntity,
            entityClass: Application.View.value.entityClass as typeof BaseEntity,
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
                    return FormComponents.FormRowTwoItemsComponent;
                case ViewGroupRow.TRIPLE:
                    return FormComponents.FormRowThreeItemsComponent;
                default:
                    return FormComponents.FormRowTwoItemsComponent;
            }
        },
        isBaseEntityType(prop: string): boolean {
            const propType = this.entityClass.getPropertyType(prop);
            return propType && propType.prototype instanceof BaseEntity;
        },
        getArrayListsTabs(): Array<string> {
            var returnList: Array<string> = [];
            var listTypes = this.entity.getArrayKeys();
            for (let i = 0; i < listTypes.length; i++) {
                returnList.push(this.entityClass.getPropertyNameByKey(listTypes[i])!);
            }

            return returnList;
        }
    }
}
</script>
<style scoped>
.form-row-single {
    width: 100%;
}
</style>
