import { ToastType } from "@/enums/ToastType";

export class Toast {
    id: string;
    message: string;
    type: ToastType;

    constructor(message: string, type: ToastType) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.message = message;
        this.type = type;
    }
}