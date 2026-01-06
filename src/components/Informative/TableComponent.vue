<template>
<table>
    {{ Application.activeView?.moduleModelType }}
    <td v-for="item in Application.activeView?.moduleModelType">
        {{ item }}
    </td>
</table>
</template>

<script lang="ts">
import Application from '@/models/application';
export default {
    name: 'TableComponent',
    data() {
        return {
            Application
        }
    },
}
</script>