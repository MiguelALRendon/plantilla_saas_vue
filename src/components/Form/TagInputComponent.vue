<template>
    <div
        class="TextInput TagInput"
        :class="[{ disabled: metadata.disabled.value }, { nonvalidated: !isInputValidated }]"
    >
        <label class="label-input">{{ metadata.propertyName }}</label>

        <!-- Tag chips -->
        <div class="tag-chips-container">
            <span
                v-for="(tag, index) in tags"
                :key="index"
                class="tag-chip"
            >
                <span
                    v-if="editingIndex !== index"
                    class="tag-chip-label"
                    @click="startEditing(index)"
                >{{ tag }}</span>
                <input
                    v-else
                    ref="editInputRef"
                    class="tag-chip-edit"
                    type="text"
                    :value="tag"
                    @keydown.enter.prevent="commitEdit(index, ($event.target as HTMLInputElement).value)"
                    @keydown.comma.prevent="commitEdit(index, ($event.target as HTMLInputElement).value)"
                    @keydown.escape="cancelEdit"
                    @blur="commitEdit(index, ($event.target as HTMLInputElement).value)"
                />
                <button
                    type="button"
                    class="tag-chip-remove"
                    :disabled="metadata.disabled.value || metadata.readonly.value"
                    @click.stop="removeTag(index)"
                >
                    <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
                </button>
            </span>

            <!-- Add-tag input -->
            <span v-if="addingTag" class="tag-chip tag-chip-new">
                <input
                    ref="addInputRef"
                    class="tag-chip-edit"
                    type="text"
                    placeholder="..."
                    @keydown.enter.prevent="commitAdd(($event.target as HTMLInputElement).value)"
                    @keydown.comma.prevent="commitAdd(($event.target as HTMLInputElement).value)"
                    @keydown.escape="cancelAdd"
                    @blur="commitAdd(($event.target as HTMLInputElement).value)"
                />
            </span>

            <!-- Add button -->
            <button
                v-if="!addingTag"
                type="button"
                class="tag-add-btn"
                :disabled="metadata.disabled.value || metadata.readonly.value"
                @click="beginAdd"
            >
                <span :class="GGCLASS">{{ GGICONS.ADD }}</span>
            </button>
        </div>
    </div>

    <div class="help-text" v-if="metadata.helpText.value">
        <span>{{ metadata.helpText.value }}</span>
    </div>

    <div class="validation-messages">
        <span v-for="message in validationMessages" :key="message">{{ message }}</span>
    </div>
</template>

<script setup lang="ts">
import Application from '@/models/application';
import { useInputMetadata } from '@/composables/useInputMetadata';
import type { BaseEntity } from '@/entities/base_entity';
import { ToastType } from '@/enums/toast_type';
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
    entityClass: typeof BaseEntity;
    entity: BaseEntity;
    propertyKey: string;
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), { modelValue: '' });

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const metadata = useInputMetadata(props.entityClass, props.entity, props.propertyKey);
const isInputValidated = ref(true);
const validationMessages = ref<string[]>([]);
const editingIndex = ref<number | null>(null);
const addingTag = ref(false);
const editInputRef = ref<HTMLInputElement | null>(null);
const addInputRef = ref<HTMLInputElement | null>(null);

/** Split the comma-separated modelValue into an array of non-empty trimmed tags */
const tags = computed<string[]>(() => {
    if (!props.modelValue || props.modelValue.trim() === '') return [];
    return props.modelValue.split(',').map(t => t.trim()).filter(t => t.length > 0);
});

function emitTags(newTags: string[]): void {
    emit('update:modelValue', newTags.join(','));
}

// ── Per-tag validation helpers ────────────────────────────────────────────

function validateTagSize(tag: string): boolean {
    const max = props.entity.getMaxTagSize?.(props.propertyKey);
    if (max !== undefined && tag.length > max) {
        Application.ApplicationUIService.showToast(
            `"${tag}" excede el tamaño máximo por etiqueta (${max} caracteres).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

function validateTagCount(count: number): boolean {
    const maxTags = props.entity.getMaxTags?.(props.propertyKey);
    if (maxTags !== undefined && count > maxTags) {
        Application.ApplicationUIService.showToast(
            `Se alcanzó el límite máximo de etiquetas (${maxTags}).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

function validateTotalSize(joined: string): boolean {
    const max = props.entity.getMaxStringSize?.(props.propertyKey);
    if (max !== undefined && joined.length > max) {
        Application.ApplicationUIService.showToast(
            `El total de etiquetas supera el tamaño máximo permitido (${max} caracteres).`,
            ToastType.ERROR
        );
        return false;
    }
    return true;
}

// ── Editing existing chips ────────────────────────────────────────────────

async function startEditing(index: number): Promise<void> {
    if (metadata.disabled.value || metadata.readonly.value) return;
    editingIndex.value = index;
    await nextTick();
    editInputRef.value?.focus();
}

function commitEdit(index: number, raw: string): void {
    // Guard against double-firing (blur after enter)
    if (editingIndex.value !== index) return;

    const label = raw.replace(/,/g, '').trim();
    editingIndex.value = null;

    if (!label) {
        // Remove empty tag
        const updated = [...tags.value];
        updated.splice(index, 1);
        emitTags(updated);
        return;
    }

    if (!validateTagSize(label)) return;

    const updated = [...tags.value];
    updated[index] = label;

    if (!validateTotalSize(updated.join(','))) return;

    emitTags(updated);
}

function cancelEdit(): void {
    editingIndex.value = null;
}

// ── Adding new chips ──────────────────────────────────────────────────────

async function beginAdd(): Promise<void> {
    addingTag.value = true;
    await nextTick();
    addInputRef.value?.focus();
}

function commitAdd(raw: string): void {
    addingTag.value = false;

    if (!raw.trim()) return;

    // Support pasting or typing multiple comma-separated tags at once
    const candidates = raw.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const current = [...tags.value];

    for (const candidate of candidates) {
        if (!validateTagSize(candidate)) continue;
        if (!validateTagCount(current.length + 1)) break;

        current.push(candidate);

        if (!validateTotalSize(current.join(','))) {
            current.pop();
            break;
        }
    }

    emitTags(current);
}

function cancelAdd(): void {
    addingTag.value = false;
}

// ── Removal ───────────────────────────────────────────────────────────────

function removeTag(index: number): void {
    const updated = [...tags.value];
    updated.splice(index, 1);
    emitTags(updated);
}

// ── Validation ────────────────────────────────────────────────────────────

async function isValidated(): Promise<boolean> {
    let validated = true;
    validationMessages.value = [];

    if (metadata.required.value && tags.value.length === 0) {
        validated = false;
        validationMessages.value.push(metadata.requiredMessage.value || `${metadata.propertyName} es requerido.`);
    }
    if (!metadata.validated.value) {
        validated = false;
        validationMessages.value.push(metadata.validatedMessage.value || `${metadata.propertyName} no es válido.`);
    }

    const isAsyncValid = await props.entity.isAsyncValidation(props.propertyKey);
    if (!isAsyncValid) {
        validated = false;
        const asyncMessage = props.entity.asyncValidationMessage(props.propertyKey);
        if (asyncMessage) validationMessages.value.push(asyncMessage);
    }

    return validated;
}

async function handleValidation(): Promise<void> {
    isInputValidated.value = await isValidated();
    if (!isInputValidated.value) Application.View.value.isValid = false;
}

onMounted(() => {
    Application.eventBus.on('validate-inputs', handleValidation);
});

onBeforeUnmount(() => {
    Application.eventBus.off('validate-inputs', handleValidation);
});
</script>

<style scoped>
.tag-chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-small);
    align-items: center;
    padding: var(--spacing-small);
    min-height: 2.5rem;
    /* border, border-radius, and background are controlled by form.css */
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 12px;
    border: var(--border-width-thin) solid var(--sky);
    background: var(--bg-gray);
    font-size: var(--font-size-small);
    white-space: nowrap;
    color: var(--blue-1);
}

.tag-chip-label {
    cursor: pointer;
    user-select: none;
}

.tag-chip-label:hover {
    text-decoration: underline;
}

.tag-chip-edit {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.8rem;
    width: 80px;
    min-width: 40px;
}

.tag-chip-remove {
    display: inline-flex;
    align-items: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: var(--gray-dark, #6b7280);
}

.tag-chip-remove:hover {
    color: var(--red, #ef4444);
}

.tag-chip-remove span {
    font-size: 16px;
}

.tag-add-btn {
    display: inline-flex;
    align-items: center;
    border: var(--border-width-thin) dashed var(--sky);
    background: transparent;
    border-radius: 12px;
    padding: 2px 6px;
    cursor: pointer;
    color: var(--sky);
    font-size: var(--font-size-small);
}

.tag-add-btn:hover {
    background: var(--bg-gray);
    border-style: solid;
}

.tag-add-btn span {
    font-size: var(--font-size-large);
}
</style>
