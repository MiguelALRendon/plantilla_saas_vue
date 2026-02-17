<template>
    <div class="ListInput" :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]">
        <button
            class="list-input-header"
            @click="openOptions"
            :id="`id-4-click-on${metadata.propertyName}`"
            :disabled="metadata.disabled.value"
        >
            <div class="list-input-container">
                <div class="label-and-value">
                    <label class="label" :class="[{ active: actualOption != '' }]">{{ metadata.propertyName }}</label>
                    <label class="value" :class="[{ active: actualOption != '' }]">{{ actualOption }}</label>
                </div>
                <span class="arrow" :class="[GGCLASS, { active: droped }]">{{ GGICONS.ARROW_UP }}</span>
            </div>
        </button>
        <div class="list-input-body" :class="[{ enabled: droped }, { 'from-bottom': fromBottom }]">
            <div class="list-input-items-wrapper">
                <div
                    class="list-input-item"
                    v-for="value in formattedEnumValues"
                    :class="[{ selected: modelValue == value.value }]"
                    :key="value.key"
                    @click="
                        $emit('update:modelValue', value.value);
                        droped = false;
                    "
                >
                    <span>{{ value.displayKey }}</span>
                </div>
            </div>
        </div>

        <div class="help-text" v-if="metadata.helpText.value">
            <span>{{ metadata.helpText.value }}</span>
        </div>

        <div class="validation-messages">
            <span v-for="message in validationMessages" :key="message">{{ message }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { EnumAdapter } from '@/models/enum_adapter';
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';

export default {
    name: 'ListInputComponent',
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        Application.eventBus.on('validate-inputs', this.handleValidation);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        Application.eventBus.off('validate-inputs', this.handleValidation);
    },
    methods: {
        parseValue(key: string): string {
            return key
                .toLowerCase()
                .split('_')
                .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
                .join(' ');
        },
        openOptions() {
            const rect = document.getElementById(`id-4-click-on${this.metadata.propertyName}`)?.getBoundingClientRect();
            if (rect) {
                this.fromBottom = window.innerHeight - rect.bottom < 300;
            }
            this.droped = !this.droped;
        },

        handleClickOutside(event: MouseEvent) {
            if (this.droped) {
                const dropdown = this.$el;
                if (!dropdown) return;

                if (!dropdown.contains(event.target as Node)) {
                    this.droped = false;
                }
            }
        },
        async isValidated(): Promise<boolean> {
            var validated = true;
            this.validationMessages = [];

            if (this.metadata.required.value && this.modelValue === '') {
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
        propertyEnumValues: {
            type: Object as () => EnumAdapter,
            required: true
        },
        modelValue: {
            type: [String, Number],
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
    computed: {
        formattedEnumValues(): Array<{ key: string; value: string | number; displayKey: string }> {
            return this.propertyEnumValues.getKeyValuePairs().map((pair) => ({
                key: pair.key,
                value: pair.value,
                displayKey: this.parseValue(pair.key)
            }));
        },
        actualOption(): String | number {
            var value =
                this.propertyEnumValues.getKeyValuePairs().find((pair) => pair.value === this.modelValue)?.key || '';
            return this.parseValue(value);
        }
    },
    data() {
        return {
            GGCLASS,
            GGICONS,
            droped: false,
            fromBottom: false,
            isInputValidated: true,
            validationMessages: [] as string[]
        };
    }
};
</script>

<style scoped>
.ListInput {
    width: 100%;
    position: relative;
}

.validation-messages {
    color: var(--red);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    padding-left: 0.75rem;
}

.list-input-container .arrow {
    transition: transform var(--transition-normal) var(--timing-ease);
    transform: rotate(180deg);
}
.list-input-container .arrow.active {
    transform: rotate(0deg);
}

.list-input-header {
    width: 100%;
    padding-top: var(--input-container-padding-top);
}

.list-input-header .list-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: var(--bg-gray);
    padding: var(--padding-medium);
    box-sizing: border-box;
    border: var(--border-width-thin) solid var(--sky);
    border-radius: var(--border-radius);
    position: relative;
}

.list-input-header label {
    pointer-events: all;
    cursor: pointer;
    font-size: 1rem;
    color: var(--blue-1);
}
.list-input-header span {
    color: var(--blue-1);
}

.label-and-value .label {
    position: absolute;
    left: var(--padding-medium);
    top: var(--input-container-padding-top);
    color: var(--blue-1);
    font-size: var(--font-size-base);
    transition: all var(--transition-slow) var(--timing-ease);
    pointer-events: none;
    overflow: visible;
    display: flex;
    flex-direction: row;
    align-items: end;
}

.label-and-value .label.active {
    color: var(--white);
    background-color: var(--sky);
    font-size: var(--font-size-small);
    top: var(--label-focused-top);
    left: var(--label-focused-left);
    padding: var(--label-focused-padding);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
}

.label-and-value .value.active {
    color: var(--gray-medium);
}

.list-input-body {
    box-shadow: var(--shadow-dark);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-rows: 0fr;
    padding: var(--padding-medium);
    max-height: var(--dropdown-max-height);
    overflow-y: auto;
    position: absolute;
    background-color: var(--white);
    z-index: var(--z-modal);
    transition: grid-template-rows var(--transition-normal) var(--timing-ease);
}
.list-input-body.from-bottom {
    bottom: 100%;
}

.list-input-body.enabled {
    grid-template-rows: 1fr;
}

.list-input-items-wrapper {
    min-height: 0;
    overflow-y: auto;
}

.list-input-item {
    padding: 0.75rem;
    cursor: pointer;
}
.list-input-item:hover {
    background-color: var(--bg-gray);
}
.list-input-item.selected {
    background-color: var(--sky);
}
.list-input-item.selected span {
    color: var(--white);
}

button:focus .list-input-container {
    background-color: var(--white);
    border: var(--border-width-medium) solid var(--lavender);
}
button:disabled {
    background-color: transparent;
}

.ListInput.disabled {
    pointer-events: none;
    cursor: not-allowed;
}
.ListInput.disabled .list-input-container,
.ListInput.disabled .list-input-container .label,
.ListInput.disabled .list-input-container span {
    border-color: var(--gray-light);
    color: var(--gray-light);
}
.ListInput.disabled .list-input-container .label.active {
    background-color: var(--gray-lighter);
}

.ListInput.nonvalidated .list-input-container {
    border-color: var(--accent-red);
}
.ListInput.nonvalidated .list-input-container,
.ListInput.nonvalidated .list-input-container .label,
.ListInput.nonvalidated .list-input-container span {
    border-color: var(--accent-red);
    color: var(--accent-rose);
}
.ListInput.nonvalidated .list-input-container .label.active {
    background-color: var(--accent-red);
    color: var(--white);
}
</style>
