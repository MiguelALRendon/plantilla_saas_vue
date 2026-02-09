import type { BaseEntity } from '@/entities/base_entitiy';
import { computed, type ComputedRef } from 'vue';

export interface InputMetadata {
    propertyName: string;
    required: ComputedRef<boolean>;
    disabled: ComputedRef<boolean>;
    validated: ComputedRef<boolean>;
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
    const validated = computed(() => entity.isValidation(propertyKey));
    const requiredMessage = computed(() => entity.requiredMessage(propertyKey));
    const validatedMessage = computed(() => entity.validationMessage(propertyKey));
    const helpText = computed(() => entity.getHelpText(propertyKey));

    return {
        propertyName,
        required,
        disabled,
        validated,
        requiredMessage,
        validatedMessage,
        helpText,
    };
}
