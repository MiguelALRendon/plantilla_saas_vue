<template>
<div class="TextInput NumberInput" :class="[{disabled: disabled}, {nonvalidated: !isInputValidated}]">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <button class="left" @click="value--" :disabled="disabled">
    <span :class="GGCLASS">{{ GGICONS.REMOVE }}</span>
    </button>

    <input
        type="number"
        class="main-input"
        :value="value"
        :disabled="disabled"
        @input="value = Number(($event.target as HTMLInputElement).value)"
    />

    <button class="right" @click="value++" :disabled="disabled">
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

export default {
    name: 'NumberInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: Number,
            required: true,
            default: 0,
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
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyName,
            isInputValidated: true,
            validationMessages: [] as string[],
        }
    },
    methods: {
        isValidated(): boolean {
            var validated = true;
            this.validationMessages = [];
            if (this.required && (this.modelValue === null || this.modelValue === undefined)) {
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