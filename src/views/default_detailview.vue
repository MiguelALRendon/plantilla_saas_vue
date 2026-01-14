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
                    v-if="typeof entity[prop] === 'number'"
                    :property-name="entityClass.getColumnNameByKey(prop)"
                    v-model="entity[prop]" />

                    <ObjectInputComponent 
                    v-if="entity[prop] instanceof BaseEntity"
                    v-model="entity[prop]" />

                    <!-- APARTADO PARA LOS INPUTS EN BASE STRING -->
                    <TextInputComponent 
                    v-if="typeof entity[prop] === 'string' && entity.getStringType()[prop] !== StringType.TEXT"
                    :property-name="entityClass.getColumnNameByKey(prop)"
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
                
                // Obtener el tipo de fila para esta propiedad
                const rowType = viewGroupRows[prop] || ViewGroupRow.PAIR;
                
                // Verificar si el último chunk tiene el mismo rowType
                const lastChunk = groups[currentGroup][groups[currentGroup].length - 1];
                
                if (lastChunk && lastChunk.rowType === rowType) {
                    // Agregar al chunk existente
                    lastChunk.properties.push(prop);
                } else {
                    // Crear un nuevo chunk
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
        }
    }
}
</script>
<style scoped>
.form-row-single {
    width: 100%;
}
</style>
