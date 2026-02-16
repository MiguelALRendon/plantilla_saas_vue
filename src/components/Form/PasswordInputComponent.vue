<template>
    <div
        class="TextInput PasswordInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <label :for="'id-' + metadata.propertyName" class="label-input">{{ metadata.propertyName }}</label>
        <input
            :id="'id-' + metadata.propertyName"
            :name="metadata.propertyName"
            :type="showPassword ? 'text' : 'password'"
            class="main-input"
            placeholder=" "
            :value="modelValue"
            :disabled="metadata.disabled.value"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button class="right" @click="togglePasswordVisibility" :disabled="metadata.disabled.value">
            <span :class="GGCLASS">{{ visibilityIcon }}</span>
        </button>
    </div>

    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>

    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'PasswordInputComponent',
    props: {
        entityClass: {
            type: Function as unknown as () => typeof BaseEntity,
            required: true
        },
        entity: {
            type: Object as () => BaseEntity,
            required: true
        },
        propertyKey: {
            type: String,
            required: true
        },
        modelValue: {
            type: String,
            required: true,
            default: ''
        }
    },
    setup(props) {
        const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
        return {
            metadata
        };
    },
    mounted() {
        Application.eventBus.on('validate-inputs', this.handleValidation);
    },
    beforeUnmount() {
        Application.eventBus.off('validate-inputs', this.handleValidation);
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyKey,
            showPassword: false,
            isInputValidated: true,
            validationMessages: [] as string[]
        };
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];

            if (this.metadata.required.value && (!this.modelValue || this.modelValue.trim() === '')) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.requiredMessage.value || `${this.metadata.propertyName} is required.`
                );
            }
            if (!this.metadata.validated.value) {
                validated = false;
                this.validationMessages.push(
                    this.metadata.validatedMessage.value || `${this.metadata.propertyName} is not valid.`
                );
            }

            // Validación asíncrona
            const isAsyncValid = await this.entity.isAsyncValidation(this.propertyKey);
            if (!isAsyncValid) {
                validated = false;
                const asyncMessage = this.entity.asyncValidationMessage(this.propertyKey);
                if (asyncMessage) {
                    this.validationMessages.push(asyncMessage);
                }
            }

            return validated;
        },
        async handleValidation() {
            this.isInputValidated = await this.isValidated();
            if (!this.isInputValidated) {
                Application.View.value.isValid = false;
            }
        }
    },
    computed: {
        visibilityIcon(): string {
            return this.showPassword ? GGICONS.VISIBILITY_OFF : GGICONS.VISIBILITY;
        }
    }
};
</script>
