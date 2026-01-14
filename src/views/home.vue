<template>
 <button class="button warning" @click="showModal">Show a Modal</button>
<div v-for="n in 100" :key="n">para pa pi pap</div>
</template>

<script lang="ts">
import Application from '@/models/application';
import { ViewTypes } from '@/enums/view_type';
import { Products } from '@/entities/products';

export default {
    name: 'HomeView',
    methods: {
        showModal() {
            Application.showModal(Products, ViewTypes.DEFAULTVIEW);
        }
    },
    data() {
        return {
            ViewTypes,
        }
    }
}
</script>