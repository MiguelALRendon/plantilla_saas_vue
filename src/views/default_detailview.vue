<template>
<h2 class="title">{{ entity.getDefaultPropertyValue() }}</h2>

<div v-for="(group, groupName) in groupedProperties" :key="groupName">
    <FormGroupComponent :title="groupName">
        <template v-for="(rowGroup, index) in group" :key="index">
            <!-- SINGLE: div al 100% -->
            <div v-if="rowGroup.type === ViewGroupRow.SINGLE" style="width: 100%;">
                <div v-for="prop in rowGroup.props" :key="prop">
                    <NumberInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'number'"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                    
                    <TextInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'string' && entity.getStringType()[prop] !== StringType.TEXT"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                </div>
            </div>

            <!-- PAIR: FormRowTwoItemsComponent -->
            <FormRowTwoItemsComponent v-if="rowGroup.type === ViewGroupRow.PAIR">
                <div v-for="prop in rowGroup.props" :key="prop">
                    <NumberInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'number'"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                    
                    <TextInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'string' && entity.getStringType()[prop] !== StringType.TEXT"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                </div>
            </FormRowTwoItemsComponent>

            <!-- TRIPLE: FormRowThreeItemsComponent -->
            <FormRowThreeItemsComponent v-if="rowGroup.type === ViewGroupRow.TRIPLE">
                <div v-for="prop in rowGroup.props" :key="prop">
                    <NumberInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'number'"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                    
                    <TextInputComponent 
                    v-if="typeof entity.toObject()[prop] === 'string' && entity.getStringType()[prop] !== StringType.TEXT"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />
                </div>
            </FormRowThreeItemsComponent>
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
import { BaseEntity } from '@/entities/base_entitiy';
import { DetailTypes } from '@/enums/detail_type';
import { StringType } from '@/enums/string_type';
import { ViewGroupRow } from '@/enums/view_group_row';
import Application from '@/models/application';

export default {
    name: 'DefaultDetailView',
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        TextInputComponent,
        NumberInputComponent
    },
    data() {
        return {
            StringType,
            ViewGroupRow,
            entity: Application.activeViewComponentProps.value?.viewEntity as BaseEntity,
            entityClass: Application.activeView.value?.moduleModelType as typeof BaseEntity,
            detailType: Application.activeViewComponentProps.value?.viewType as DetailTypes,
        };
    },
    computed: {
        groupedProperties() {
            const viewGroups = this.entity.getViewGroups();
            const viewGroupRows = this.entity.getViewGroupRows();
            const keys = this.entity.getKeys();
            
            const groups: Record<string, any[]> = {};
            let currentGroup = 'default';
            
            // Procesar las propiedades en orden
            for (const prop of keys) {
                // Si esta propiedad tiene un grupo definido, cambiamos al nuevo grupo
                if (viewGroups[prop]) {
                    currentGroup = viewGroups[prop];
                    if (!groups[currentGroup]) {
                        groups[currentGroup] = [];
                    }
                }
                
                // Si no hay grupo actual, crear uno por defecto
                if (!groups[currentGroup]) {
                    groups[currentGroup] = [];
                }
                
                // Agregar la propiedad al grupo actual
                if (!Array.isArray(groups[currentGroup])) {
                    groups[currentGroup] = [];
                }
                groups[currentGroup].push(prop);
            }
            
            // Ahora agrupar las propiedades por ViewGroupRow dentro de cada grupo
            const result: Record<string, Array<{type: ViewGroupRow, props: string[]}>> = {};
            
            for (const [groupName, props] of Object.entries(groups)) {
                result[groupName] = [];
                let currentRowType: ViewGroupRow = ViewGroupRow.PAIR; // Default
                let currentRowProps: string[] = [];
                
                for (const prop of props) {
                    // Si esta propiedad tiene un ViewGroupRow definido
                    if (viewGroupRows[prop]) {
                        // Si ya tenemos propiedades acumuladas, guardarlas primero
                        if (currentRowProps.length > 0) {
                            result[groupName].push({
                                type: currentRowType,
                                props: [...currentRowProps]
                            });
                            currentRowProps = [];
                        }
                        // Cambiar al nuevo tipo de fila
                        currentRowType = viewGroupRows[prop];
                    }
                    
                    // Agregar la propiedad al grupo de fila actual
                    currentRowProps.push(prop);
                }
                
                // No olvidar las últimas propiedades acumuladas
                if (currentRowProps.length > 0) {
                    result[groupName].push({
                        type: currentRowType,
                        props: currentRowProps
                    });
                }
            }
            
            return result;
        }
    }
}
</script>