<template>
    <div
        class="boolean-input-container"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <button class="BooleanInput" @click="value = !value" :disabled="metadata.disabled.value">
            <label :for="`id-${metadata.propertyName}`" class="label-input-boolean"
                >{{ metadata.propertyName }}:
            </label>

            <div :class="['input-button', { true: modelValue }]">
                <span :class="GGCLASS" class="icon">{{ displayIcon }}</span>
            </div>
        </button>

        <div class="help-text" v-if="metadata.helpText.value">
            <span>{{ metadata.helpText.value }}</span>
        </div>

        <div class="validation-messages">
            <span v-for="message in validationMessages" :key="message">{{ message }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'BooleanInputComponent',
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
            type: Boolean,
            required: true,
            default: false
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
            isInputValidated: true,
            validationMessages: [] as string[]
        };
    },
    methods: {
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];

            if (this.metadata.required.value && !this.modelValue) {
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

            /** Validación asíncrona */
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
        value: {
            get(): boolean {
                return this.modelValue;
            },
            set(val: boolean) {
                this.$emit('update:modelValue', val);
            }
        },
        displayIcon(): string {
            return this.modelValue ? GGICONS.CHECK : GGICONS.CANCEL;
        }
    }
};
</script>

<style scoped>
.boolean-input-container {
    width: 100%;
    box-sizing: border-box;
}

.validation-messages {
    color: var(--red);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
    padding-left: var(--spacing-md);
}

.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-xs);
    cursor: pointer;
    align-items: center;
    border-radius: var(--border-radius);
    transition: var(--transition-slow) var(--timing-ease);
    border: 0px solid transparent;
}
.BooleanInput:hover {
    background-color: var(--bg-gray);
}

.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: var(--font-size-base);
    height: fit-content;
    cursor: pointer;
}

.BooleanInput .input-button {
    margin-left: var(--margin-medium);
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: all var(--transition-slow) var(--timing-ease);
    color: var(--accent-red);
    border-radius: 100%;
}
.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}

.BooleanInput:focus {
    border: var(--border-width-medium) solid var(--lavender);
}
.BooleanInput:focus .label-input-boolean {
    color: var(--gray-medium);
}

.boolean-input-container.disabled .BooleanInput {
    cursor: not-allowed;
    pointer-events: none;
    background-color: var(--gray-lighter);
}
.boolean-input-container.disabled .BooleanInput label {
    color: var(--gray-light);
}
.boolean-input-container.disabled .BooleanInput span {
    background-color: var(--gray-light);
    color: var(--gray-lighter);
}

.boolean-input-container.nonvalidated .BooleanInput label {
    color: var(--accent-red);
}
</style>
