<template>
<h2 class="title">{{ defaultPropertyValue }}</h2>

<div v-for="(group, groupName) in groupedProperties" :key="groupName">
    <FormGroupComponent :title="groupName">
        <template v-for="(chunk, index) in group" :key="index">
            <component 
                :is="getRowComponent(chunk.rowType)" 
                :class="chunk.rowType === 'single' ? 'form-row-single' : ''">
                <div v-for="prop in chunk.properties" :key="prop">
                    <NumberInputComponent 
                    v-if="propertyMetadata[prop].showNumberInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <ObjectInputComponent 
                    v-if="propertyMetadata[prop].showObjectInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    :modelType="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <DateInputComponent
                    v-if="propertyMetadata[prop].showDateInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <BooleanInputComponent
                    v-if="propertyMetadata[prop].showBooleanInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <ListInputComponent
                    v-if="propertyMetadata[prop].showListInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    :property-enum-values="entityClass.getPropertyType(prop)"
                    v-model="entity[prop]" />

                    <!-- APARTADO PARA LOS INPUTS EN BASE STRING -->
                    <TextInputComponent 
                    v-if="propertyMetadata[prop].showTextInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <TextAreaComponent 
                    v-if="propertyMetadata[prop].showTextAreaInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <EmailInputComponent
                    v-if="propertyMetadata[prop].showEmailInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />

                    <PasswordInputComponent
                    v-if="propertyMetadata[prop].showPasswordInput"
                    :entity-class="entityClass"
                    :entity="entity"
                    :property-key="prop"
                    v-model="entity[prop]" />
                    <!---------------------------------------------->
                </div>
            </component>
        </template>
    </FormGroupComponent>
</div>

<FormGroupComponent title="Listas">
    <TabControllerComponent :tabs="getArrayListsTabs()">
        <TabComponent v-for="(tab) in entity.getArrayKeysOrdered()">
            <ArrayInputComponent 
            :entity="entity"
            :property-key="tab"
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
import { BaseEntity } from '@/entities/base_entity';
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
    mounted() {
        // FUTURE: Aquí se implementará la lógica para cargar la entidad desde la API
        // usando Application.View.value.entityOid cuando entityObject sea null
        // Ejemplo:
        // if (!this.entity && Application.View.value.entityOid) {
        //     this.loadEntityFromAPI(Application.View.value.entityOid);
        // }
    },
    computed: {
        defaultPropertyValue(): string {
            return this.entity.getDefaultPropertyValue();
        },
        propertyMetadata(): Record<string, {
            showNumberInput: boolean;
            showObjectInput: boolean;
            showDateInput: boolean;
            showBooleanInput: boolean;
            showListInput: boolean;
            showTextInput: boolean;
            showTextAreaInput: boolean;
            showEmailInput: boolean;
            showPasswordInput: boolean;
        }> {
            const metadata: Record<string, any> = {};
            const keys = this.entity.getKeys();
            
            for (const prop of keys) {
                const propType = this.entityClass.getPropertyType(prop);
                const stringType = this.entity.getStringType()[prop];
                
                metadata[prop] = {
                    showNumberInput: propType === Number,
                    showObjectInput: propType && propType.prototype instanceof BaseEntity,
                    showDateInput: propType === Date,
                    showBooleanInput: propType === Boolean,
                    showListInput: propType instanceof EnumAdapter,
                    showTextInput: propType === String && stringType == StringType.TEXT,
                    showTextAreaInput: propType === String && stringType == StringType.TEXTAREA,
                    showEmailInput: propType === String && stringType == StringType.EMAIL,
                    showPasswordInput: propType === String && stringType == StringType.PASSWORD
                };
            }
            return metadata;
        },
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const viewGroupRows = this.entity.getViewGroupRows();
            const keys = this.entity.getKeys();
            
            const groups: Record<string, Array<{ rowType: string, properties: string[] }>> = {};
            let currentGroup = 'default';
            
            for (const prop of keys) {
                // Filtrar propiedades ocultas
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
    methods: {
        // FUTURE: Método para cargar entidad desde API
        // async loadEntityFromAPI(oid: string) {
        //     try {
        //         const response = await Application.axiosInstance.get(
        //             `${this.entityClass.getApiEndpoint()}/${oid}`
        //         );
        //         this.entity = new this.entityClass(response.data);
        //         Application.View.value.entityObject = this.entity;
        //     } catch (error) {
        //         console.error('Error loading entity:', error);
        //     }
        // },
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
            var listTypes = this.entity.getArrayKeysOrdered();
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
