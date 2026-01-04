<template>
    <h2>Template de Formulario</h2>
    <FormGroupComponent title="Titulo del grupo">
        <FormRowTwoItemsComponent>
            <TextInputComponent propertyName="Nombre del Producto" />
            <NumberInputComponent propertyName="Cantidad" />
        </FormRowTwoItemsComponent>

        <FormRowThreeItemsComponent>
            <NumberInputComponent propertyName="Precio Unitario" />
            <NumberInputComponent propertyName="Impuesto %" />
            <NumberInputComponent propertyName="Descuento %" />
        </FormRowThreeItemsComponent>
    </FormGroupComponent>
</template>

<script>
import FormGroupComponent from '@/components/Form/FormGroupComponent.vue';
import FormRowThreeItemsComponent from '@/components/Form/FormRowThreeItemsComponent.vue';
import FormRowTwoItemsComponent from '@/components/Form/FormRowTwoItemsComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';

export default {
    name: 'InventoryView',
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        TextInputComponent,
        NumberInputComponent
    },
}
</script>