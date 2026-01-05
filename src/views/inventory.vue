<template>
    <h2>Template de Formulario</h2>
    <FormGroupComponent title="Inputs Principales">
        <FormRowTwoItemsComponent>
            <TextInputComponent propertyName="Nombre del Producto" />
            <NumberInputComponent propertyName="Cantidad" />
        </FormRowTwoItemsComponent>

        <FormRowThreeItemsComponent>
            <EmailInputComponent propertyName="Email" />
            <PasswordInputComponent propertyName="Password" />
            <NumberInputComponent propertyName="Descuento %" />
        </FormRowThreeItemsComponent>

        <DateInputComponent propertyName="Fecha de Vencimiento" />
    </FormGroupComponent>

    <FormGroupComponent title="Inputs Secundarios">
        <FormRowTwoItemsComponent>
            <TextInputComponent propertyName="Proveedor" />
            <ObjectInputComponent propertyName="Objeto" />
            <NumberInputComponent propertyName="Precio Unitario" />
        </FormRowTwoItemsComponent>
    </FormGroupComponent>
</template>

<script>
import DateInputComponent from '@/components/Form/DateInputComponent.vue';
import EmailInputComponent from '@/components/Form/EmailInputComponent.vue';
import FormGroupComponent from '@/components/Form/FormGroupComponent.vue';
import FormRowThreeItemsComponent from '@/components/Form/FormRowThreeItemsComponent.vue';
import FormRowTwoItemsComponent from '@/components/Form/FormRowTwoItemsComponent.vue';
import NumberInputComponent from '@/components/Form/NumberInputComponent.vue';
import ObjectInputComponent from '@/components/Form/ObjectInputComponent.vue';
import PasswordInputComponent from '@/components/Form/PasswordInputComponent.vue';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';

export default {
    name: 'InventoryView',
    components: {
        FormGroupComponent,
        FormRowTwoItemsComponent,
        FormRowThreeItemsComponent,
        TextInputComponent,
        NumberInputComponent,
        EmailInputComponent,
        PasswordInputComponent,
        DateInputComponent,
        ObjectInputComponent
    },
}
</script>