<template>
    <div class="loading-screen">
        Loading...
    </div>
</template>

<script lang="ts">
export default {
    name: 'LoadingScreenComponent',
}
</script>

<style scoped>
    .loading-screen {
        position: absolute;
        display: flex;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        height: calc(100% - 50px);
        width: 100%;
        font-size: 1.5rem;
        top: 50px;
        z-index: 99999;
        background-color: rgba(184, 135, 135, 0);
        color: #555;
    }
</style>