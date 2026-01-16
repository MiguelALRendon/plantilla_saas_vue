<template>
<div class="TextInput DateInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        type="text" 
        class="main-input" 
        placeholder=" " 
        :value="formattedDate"
        readonly />
    <input 
        ref="dateInput"
        :id="'date-id-' + propertyName" 
        :name="propertyName" 
        type="date" 
        class="date-input"
        :value="modelValue"
        @input="updateDate" />
    <button class="right" @click="openCalendar">
        <span :class="GGCLASS">{{ GGICONS.CALENDAR }}</span>
    </button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'DateInputComponent',
    props: {
        propertyName: {
            type: String,
            required: true,
            default: '',
        },
        modelValue: {
            type: String,
            required: true,
            default: '',
        }
    },
    data() {
        return {
            GGICONS,
            GGCLASS,
            textInputId: 'text-input-' + this.propertyName,
        }
    },
    computed: {
        formattedDate(): string {
            if (!this.modelValue) return '';
            
            const date = new Date(this.modelValue + 'T00:00:00');
            
            if (isNaN(date.getTime())) return '';
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        }
    },
    methods: {
        updateDate(event: Event) {
            const value = (event.target as HTMLInputElement).value;
            this.$emit('update:modelValue', value);
        },
        openCalendar() {
            (this.$refs.dateInput as HTMLInputElement).showPicker();
        }
    }
}
</script>