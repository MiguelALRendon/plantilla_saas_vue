<template>
    <div class="container">
        <button class="button" @click="Application.ApplicationUIService.toggleDarkMode()">Cambiar Tema</button>
    </div>
</template>

<script lang="ts">
import Application from '@/models/application';
export default {
    name: 'ListView',
    data() {
        return {
            Application,
        }
    },
}
</script>

<style scoped>
.container {
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
}
.button{
    width: 100%;
}
</style>