import { ToastType } from '@/enums/ToastType';

export class Toast {
    /**
     * Unique toast identifier used as render key.
     */
    id: string;
    /**
     * Message displayed in the toast UI.
     */
    message: string;
    /**
     * Visual toast type controlling style and semantics.
     */
    type: ToastType;

    /**
     * Creates a toast model with auto-generated identifier.
     * @param message Toast message content.
     * @param type Visual type of the toast.
     */
    constructor(message: string, type: ToastType) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.message = message;
        this.type = type;
    }
}
