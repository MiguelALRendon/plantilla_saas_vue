import type { BaseEntity } from '@/entities/base_entity';
import Application from '@/models/application';
import { computed, ref, watch, onUnmounted, type ComputedRef, type Ref } from 'vue';

export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    readonly: ComputedRef<boolean>;
    validated: Ref<boolean>;
    requiredMessage: ComputedRef<string | undefined>;
    validatedMessage: ComputedRef<string | undefined>;
    helpText: ComputedRef<string | undefined>;
}

export function useInputMetadata(
    entityClass: typeof BaseEntity,
    entity: BaseEntity,
    propertyKey: string
): InputMetadata {
    const propertyName = entityClass.getPropertyNameByKey(propertyKey) || propertyKey;

    const required = computed(() => entity.isRequired(propertyKey));
    const disabled = computed(() => entity.isDisabled(propertyKey));
    const readonly = computed(() => entity.isReadOnly(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    // Debounced async-validation flag: avoids triggering HTTP checks on every keystroke.
    const validated = ref<boolean>(entity.isValidation(propertyKey));
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const stopWatch = watch(
        required, // re-evaluate when the required state changes (acts as a reactive proxy for entity mutation)
        () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            const delay = Application.AppConfiguration.value?.asyncValidationDebounce ?? 300;
            debounceTimer = setTimeout(() => {
                validated.value = entity.isValidation(propertyKey);
            }, delay);
        },
        { immediate: false }
    );

    onUnmounted(() => {
        stopWatch();
        if (debounceTimer) clearTimeout(debounceTimer);
    });

    return {
        propertyName,
        required,
        disabled,
        readonly,
        validated,
        requiredMessage,
        validatedMessage,
        helpText
    };
}
