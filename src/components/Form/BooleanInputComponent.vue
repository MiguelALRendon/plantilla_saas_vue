<template>
<div class="boolean-input-container">
    <button class="BooleanInput" @click="value = !value">
        <label 
        :for="'id-' + propertyName" 
        class="label-input-boolean">{{ propertyName }}: </label>

        <div :class="['input-button', { true: modelValue }]">
            <span :class="GGCLASS" class="icon">{{ modelValue ? GGICONS.CHECK : GGICONS.CANCEL }}</span>
        </div>
    </button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
export default {
    name: 'BooleanInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: Boolean,
            required: true,
            default: false,
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
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
        }
    }
}
</script>

<style scoped>
.boolean-input-container {
    width: 100%;
    box-sizing: border-box;
}
.BooleanInput {
    display: flex;
    flex-direction: row;
    margin-block: .5rem;
    padding: 0.5rem .25rem;
    cursor: pointer;
    align-items: center;
    border-radius: 1rem;
    transition: 0.5s ease;
    border: 0px solid transparent;
}
.BooleanInput:hover {
    background-color: var(--bg-gray);
}

.BooleanInput .label-input-boolean {
    color: var(--lavender);
    font-size: 1rem;
    height: fit-content;
    cursor: pointer;
}

.BooleanInput .input-button {
    margin-left: 1rem;
}

.BooleanInput .input-button .icon {
    transform: rotate(180deg);
    transition: 0.5s ease;
    color: var(--accent-red);
    border-radius: 100%;
}
.BooleanInput .input-button.true .icon {
    transform: rotate(0deg);
    background-color: var(--btn-info);
    color: var(--white);
}

.BooleanInput:focus{border: 2px solid var(--lavender);}
.BooleanInput:focus .label-input-boolean {
    color: var(--gray-medium);
}
</style>