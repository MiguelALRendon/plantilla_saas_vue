<template>
    <DetailViewTableComponent />
</template>

<script lang="ts">
import DetailViewTableComponent from '@/components/Informative/DetailViewTableComponent.vue';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';

export default {
    name: 'DefaultListView',
    components: {
        DetailViewTableComponent
    },

    // #region LIFECYCLE
    mounted() {
        Application.View.value.viewType = ViewTypes.LISTVIEW;
        Application.setButtonList();
    }
    // #endregion
};
</script>

<style scoped>
/* Component-specific styles inherit from global table.css and form.css */
/* §04-UI-DESIGN-SYSTEM-CONTRACT 6.13.1: All Vue SFC must have scoped styles */
</style>
