<template>
    <div class="FilePreview" v-if="activeFile">
        <div v-if="isImage">
            <img :src="objectUrl" class="preview-image" alt="Preview" />
        </div>
        <div v-else-if="isPdf">
            <embed :src="objectUrl" type="application/pdf" class="preview-pdf" />
        </div>
        <div v-else class="preview-unsupported">
            <span :class="[GGCLASS]" class="preview-icon">{{ GGICONS.INSERT_DRIVE_FILE }}</span>
            <span class="preview-name">{{ activeFile.name }}</span>
            <span class="preview-type">{{ activeFile.type || 'Tipo de archivo no soportado para previsualización' }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { previewFile } from '@/stores/file_preview_store';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    file?: File;
}

const props = withDefaults(defineProps<Props>(), { file: undefined });

// When rendered inside the framework modal, no props are passed.
// Fall back to the shared store so the file is still accessible.
const activeFile = computed<File | null>(() => props.file ?? previewFile.value);

const objectUrl = ref<string>('');

const isImage = computed<boolean>(() => activeFile.value?.type.startsWith('image/') ?? false);
const isPdf = computed<boolean>(() => activeFile.value?.type === 'application/pdf');

onMounted(() => {
    if (activeFile.value) {
        objectUrl.value = URL.createObjectURL(activeFile.value);
    }
});

onBeforeUnmount(() => {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
    }
});
</script>

<style scoped>
.FilePreview {
    max-width: 600px;
    max-height: 500px;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-image {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
    border-radius: var(--border-radius);
}

.preview-pdf {
    width: 580px;
    height: 460px;
    border: none;
}

.preview-unsupported {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-small);
    padding: var(--padding-large);
    color: var(--gray-medium);
}

.preview-icon {
    font-size: 3rem;
    color: var(--gray-light);
}

.preview-name {
    font-weight: 600;
    font-size: var(--font-size-sm);
}

.preview-type {
    font-size: var(--font-size-xs);
    color: var(--gray-light);
}
</style>
