import type { Component, Ref } from 'vue';
import type { Emitter } from 'mitt';

import type { BaseEntity } from '@/entities/base_entity';
import type { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import type { ViewTypes } from '@/enums/view_type';

import type { AppConfiguration } from '@/models/AppConfiguration';
import type { DropdownMenu } from '@/models/dropdown_menu';
import type { Events } from '@/types/events';
import type { Modal } from '@/models/modal';
import type { Toast } from '@/models/Toast';

/**
 * Entity constructor alias used in UI state.
 */
export type EntityCtor = typeof BaseEntity;

/**
 * Global View state contract.
 */
export interface ViewState {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}

/**
 * Confirmation menu state contract.
 */
export interface ConfirmationMenu {
    type: confMenuType;
    title: string;
    message: string;
    confirmationAction?: () => void;
    acceptButtonText?: string;
    cancelButtonText?: string;
}

/**
 * Application UI context contract.
 */
export interface ApplicationUIContextState {
    AppConfiguration: Ref<AppConfiguration>;
    eventBus: Emitter<Events>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<ConfirmationMenu>;
    ToastList: Ref<Toast[]>;
}
