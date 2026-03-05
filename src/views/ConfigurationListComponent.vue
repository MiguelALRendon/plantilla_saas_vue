<template>
    <div class="container">
        <button class="button" @click="toggleTheme()">{{ t('common.change_theme') }}</button>
        <!-- T230: Language selector — wired to SelectedLanguage in AppConfiguration -->
        <select class="language-select" v-model="selectedLanguage">
            <option :value="Language.EN">{{ t('common.english') }}</option>
            <option :value="Language.ES">{{ t('common.spanish') }}</option>
            <option :value="Language.JP">{{ t('common.japanese') }}</option>
        </select>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Application from '@/models/application';
import { Language } from '@/enums/language';
import { GetLanguagedText } from '@/helpers/language_helper';

function t(path: string): string {
    return GetLanguagedText(path);
}

function toggleTheme(): void {
    Application.ApplicationUIService.toggleDarkMode();
}

const selectedLanguage = computed<Language>({
    get: () => Application.AppConfiguration.value.selectedLanguage,
    set: (value: Language) => {
        Application.AppConfiguration.value.selectedLanguage = Number(value) as Language;
    }
});
</script>

<style scoped>
.container {
    width: 100%;
    padding: var(--spacing-lg);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
}
.button {
    width: 100%;
}
.language-select {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-small);
    border: var(--border-width-thin) solid var(--gray-lighter);
    border-radius: var(--border-radius);
    background-color: var(--white);
    color: var(--gray-medium);
    font-size: var(--font-size-base);
}
</style>
