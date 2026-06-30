import type { ConfMenuType } from '@/enums/conf_menu_type';

/** Payload for the `data-error` event — raised by the data-access layer on a failed request. */
export interface DataErrorPayload {
    type: ConfMenuType;
    title: string;
    message: string;
}

export type Events = {
    'validate-inputs': void;
    'validate-entity': void;
    'show-loading': void;
    'hide-loading': void;
    'show-modal': void;
    'hide-modal': void;
    'show-confirmation': void;
    'hide-confirmation': void;
    'show-loading-menu': void;
    'hide-loading-menu': void;
    /** Emitted by entity_repository.ts on request failure; Application owns the UI reaction (SRP). */
    'data-error': DataErrorPayload;
};
