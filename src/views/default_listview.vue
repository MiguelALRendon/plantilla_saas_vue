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
    mounted() {
        Application.View.value.viewType = ViewTypes.LISTVIEW;
    }
};
</script>
