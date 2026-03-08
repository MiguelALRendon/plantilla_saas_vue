import { shallowRef } from 'vue';

/**
 * Shared reactive store used to pass a File object to FilePreviewComponent
 * when it is rendered inside the framework modal (which cannot receive props).
 * Set `previewFile.value` before calling showModal, then clear it on unmount.
 */
export const previewFile = shallowRef<File | null>(null);
