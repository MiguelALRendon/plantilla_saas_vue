<template>
<div class="TextInput PasswordInput">
    <label :for="'id-' + propertyName" class="label-input">{{ propertyName }}</label>
    <input 
        :id="'id-' + propertyName" 
        :name="propertyName" 
        :type="showPassword ? 'text' : 'password'" 
        class="main-input" 
        placeholder=" "
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <button class="right" @click="togglePasswordVisibility">
        <span :class="GGCLASS">{{ showPassword ? GGICONS.VISIBILITY_OFF : GGICONS.VISIBILITY }}</span>
    </button>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';

export default {
    name: 'PasswordInputComponent',
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
            showPassword: false,
        }
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        }
    }
}
</script>