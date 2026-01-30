<template>
<div class="TextInput NumberInput" :class="[{disabled: metadata.disabled.value}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + metadata.propertyName" class="label-input">{{ metadata.propertyName }}</label>
    <button class="left" @click="value--" :disabled="metadata.disabled.value">
    <span :class="GGCLASS">{{ GGICONS.REMOVE }}</span>
    </button>

    <input
        type="number"
        class="main-input"
        :value="value"
        :disabled="metadata.disabled.value"
        @input="value = Number(($event.target as HTMLInputElement).value)"
    />

    <button class="right" @click="value++" :disabled="metadata.disabled.value">
        <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
    </button>
</div>

<div class="validation-messages">
    <span v-for="message in validationMessages" :key="message">{{ message }}</span>
</div>
</template>

<script lang="ts">
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entitiy';

export default {
    name: 'NumberInputComponent',
    props: {
        entityClass: {
            type: Function as unknown as () => typeof BaseEntity,
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
            type: Number,
            required: true,
            default: 0,
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
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyKey,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
    methods: {
        isValidated(): boolean {
            var validated = true;
            this.validationMessages = [];
            if (this.metadata.required.value && (this.modelValue === null || this.modelValue === undefined)) {
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
    computed: {
    value: {
        get(): number {
            return this.modelValue;
        },
        set(val: number) {
            this.$emit('update:modelValue', val);
        }
    }
}
}
</script>