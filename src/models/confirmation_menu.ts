import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';

export interface ConfirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}

/**
 * Builds a fresh empty confirmation-menu default state.
 * Shared by `ApplicationClass`'s pre-Pinia bootstrap ref and `useUiStore`.
 */
export function createDefaultConfirmationMenu(): ConfirmationMenu {
    return {
        type: confMenuType.INFO,
        title: '',
        message: '',
        confirmationAction: () => {},
    };
}
