<template>
    <h2>Template de Formulario</h2>
    <FormGroupComponent title="Inputs Principales">
        <FormRowThreeItemsComponent>
            <EmailInputComponent propertyName="Email" />
            <PasswordInputComponent propertyName="Password" v-model="password" />
            <DateInputComponent propertyName="Fecha de Vencimiento" v-model="date" />
        </FormRowThreeItemsComponent>
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
    data() {
        return {
            date : '',
            password : '',
        }
    }
}
</script>