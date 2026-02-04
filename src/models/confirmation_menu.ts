import { confMenuType } from "@/enums/conf_menu_type";

export interface confirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}