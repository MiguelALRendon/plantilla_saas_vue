<template>
    <div class="container">
        <button class="button" @click="openConfigurationDetail()">{{ t('common.settings') }}</button>
    </div>
</template>

<script setup lang="ts">
import Application from '@/models/application';
import { Configuration } from '@/entities/configuration';
import { GetLanguagedText } from '@/helpers/language_helper';

interface Props {
    onOpenConfiguration?: () => void;
}

const props = defineProps<Props>();

function t(path: string): string {
    return GetLanguagedText(path);
}

function openConfigurationDetail(): void {
    if (props.onOpenConfiguration) {
        props.onOpenConfiguration();
        return;
    }
    Application.ApplicationUIService.closeDropdownMenu();
    const configuration = Configuration.fromAppConfiguration(Application.getConfigurationSnapshot());
    Application.changeViewToDetailView(configuration);
}
</script>

<style scoped>
.container {
    width: 100%;
    padding: var(--spacing-lg);
    box-sizing: border-box;
    display: grid;
    gap: var(--spacing-small);
}
.button {
    width: 100%;
}
</style>
