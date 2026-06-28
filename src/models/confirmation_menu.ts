import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';

export interface ConfirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}
