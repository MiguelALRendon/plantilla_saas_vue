<template>
<div class="TextInput ObjectInput">
    <label :for="'id-' + componentName" class="label-input">{{ componentName }}</label>
    <input 
        :id="'id-' + componentName" 
        :name="componentName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue.getDefaultPropertyValue()"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" />
    <button class="right"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entitiy';
import Application from '@/models/application';
import { PropType } from 'vue';

export default {
    name: 'ObjectInputComponent',
    props: {
        modelValue: {
            type: Object as PropType<BaseEntity>,
            required: true
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            Application,
            BaseEntity,
        }
    },
    computed: {
        componentName(): string | undefined {
            return (this.modelValue.constructor as typeof BaseEntity).getModuleName()
        }
    },
}
</script>