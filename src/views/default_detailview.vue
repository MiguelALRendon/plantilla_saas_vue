<template>
<h2 class="title">{{ entity.getDefaultPropertyValue() }}</h2>

<FormGroupComponent>
    <FormRowTwoItemsComponent>
        <div v-for="prop in entity.getKeys()">
            <NumberInputComponent 
            v-if="typeof entity.toObject()[prop] === 'number'"
            :property-name="entityClass.getColumnNameByKey(prop)" />
            
            <!-- APARTADO PARA LOS STRINGS EN BASE STRING -->
            <TextInputComponent 
            v-if="typeof entity.toObject()[prop] === 'string' && entity.getStringType()[prop] !== StringType.TEXT"
            :property-name="entityClass.getColumnNameByKey(prop)" />
            <!---------------------------------------------->
            <!-- {{  prop + ': ' + entity.toObject()[prop] + ' as ' + typeof entity.toObject()[prop] }} -->
        </div>
    </FormRowTwoItemsComponent>
</FormGroupComponent>
</template>

<script lang="ts">
import FormGroupComponent from '@/components/Form/FormGroupComponent.vue';
import FormRowTwoItemsComponent from '@/components/Form/FormRowTwoItemsComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import { BaseEntity } from '@/entities/base_entitiy';
import { DetailTypes } from '@/enums/detail_type';
import { StringType } from '@/enums/string_type';
import Application from '@/models/application';

export default {
    name: 'DefaultDetailView',
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        TextInputComponent,
        NumberInputComponent
    },
    data() {
        return {
            StringType,
            entity: Application.activeViewComponentProps.value?.viewEntity as BaseEntity,
            entityClass: Application.activeView.value?.moduleModelType as typeof BaseEntity,
            detailType: Application.activeViewComponentProps.value?.viewType as DetailTypes,
        };
    },
}
</script>