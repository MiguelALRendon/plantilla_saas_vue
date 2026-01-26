<template>
<div class="TextInput ObjectInput" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue?.getDefaultPropertyValue()"
        :disabled="disabled"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" />
    <button class="right" @click="Application.showModalOnFunction(modelType, setNewValue, ViewTypes.LOOKUPVIEW)" :disabled="disabled"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
</div>
<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">{{ message }}</span>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity, EmptyEntity } from '@/entities/base_entitiy';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';
import { PropType } from 'vue';

export default {
    name: 'ObjectInputComponent',
    props: {
        modelValue: {
            type: Object as PropType<BaseEntity>,
            required: false,
            default: () => new EmptyEntity({}),
        },
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelType: {
            type: Function as unknown as PropType<typeof BaseEntity>,
            required: true,
        },
        required: {
            type: Boolean,
            required: false,
            default: false,
        },
        requireddMessage: {
            type: String,
            required: false,
            default: '',
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        validated: {
            type: Boolean,
            required: false,
            default: true,
        },
        validatedMessage: {
            type: String,
            required: false,
            default: '',
        },
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.saveItem);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.saveItem);
    },
    methods: {
        setNewValue(newValue: BaseEntity | undefined) {
            this.$emit('update:modelValue', newValue);
        },
        isValidated(): boolean {
            var validated = true;
            this.validationMessages = [];
            if (this.required && (this.modelValue === null || this.modelValue === undefined || this.modelValue instanceof EmptyEntity)) {
                validated = false;
                this.validationMessages.push(this.requireddMessage || `${this.propertyName} is required.`);
            }
            if (!this.validated) {
                validated = false;
                this.validationMessages.push(this.validatedMessage || `${this.propertyName} is not valid.`);
            }
            return validated;
        },
        saveItem() {
            this.isInputValidated = this.isValidated();
        },
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            Application,
            ViewTypes,
            BaseEntity,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    }
}
</script>