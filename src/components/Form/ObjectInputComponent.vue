<template>
<div class="TextInput ObjectInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue.getDefaultPropertyValue()"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" />
    <button class="right" @click="Application.showModalOnFunction(componentType, setNewValue, ViewTypes.LOOKUPVIEW)"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entitiy';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';
import { PropType } from 'vue';

export default {
    name: 'ObjectInputComponent',
    props: {
        modelValue: {
            type: Object as PropType<BaseEntity>,
            required: true
        },
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
    },
    methods: {
        setNewValue(newValue: BaseEntity) {
            this.$emit('update:modelValue', newValue);
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            Application,
            ViewTypes,
            BaseEntity,
        }
    },
    computed: {
        componentType(): typeof BaseEntity {
            return (this.modelValue.constructor as typeof BaseEntity)
        }
    },
}
</script>