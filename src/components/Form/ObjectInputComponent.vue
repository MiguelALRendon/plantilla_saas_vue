<template>
<div class="TextInput ObjectInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" "
        :value="modelValue?.getDefaultPropertyValue()"
        readonly="true"
        @input="$emit('update:modelValue', modelValue)" />
    <button class="right" @click="Application.showModalOnFunction(modelType, setNewValue, ViewTypes.LOOKUPVIEW)"><span :class="GGCLASS">{{ GGICONS.SEARCH }}</span></button>
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
        }
    },
    methods: {
        setNewValue(newValue: BaseEntity | undefined) {
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
    }
}
</script>