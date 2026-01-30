<template>
<div class="TextInput ObjectInput" :class="[{disabled: metadata.disabled.value}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + metadata.propertyName" class="label-input">{{ metadata.propertyName }}</label>
    <input 
        :id="'id-' + metadata.propertyName" 
        :name="metadata.propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue?.getDefaultPropertyValue()"
        :disabled="metadata.disabled.value"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" />
    <button class="right" @click="Application.showModalOnFunction(modelType, setNewValue, ViewTypes.LOOKUPVIEW)" :disabled="metadata.disabled.value"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
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
import { useInputMetadata } from '@/composables/useInputMetadata';

export default {
    name: 'ObjectInputComponent',
    props: {
        entityClass: {
            type: Function as () => typeof BaseEntity,
            required: true,
        },
        entity: {
            type: Object as () => BaseEntity,
            required: true,
        },
        propertyKey: {
            type: String,
            required: true,
        },
        modelValue: {
            type: Object as PropType<BaseEntity>,
            required: false,
            default: () => new EmptyEntity({}),
        },
        modelType: {
            type: Function as unknown as PropType<typeof BaseEntity>,
            required: true,
        },
    },
    setup(props) {
        const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
        return {
            metadata,
        };
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
            if (this.metadata.required.value && (this.modelValue === null || this.modelValue === undefined || this.modelValue instanceof EmptyEntity)) {
                validated = false;
                this.validationMessages.push(this.metadata.requiredMessage.value || `${this.metadata.propertyName} is required.`);
            }
            if (!this.metadata.validated.value) {
                validated = false;
                this.validationMessages.push(this.metadata.validatedMessage.value || `${this.metadata.propertyName} is not valid.`);
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