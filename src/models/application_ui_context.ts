import type { Ref } from 'vue';
import type { Emitter } from 'mitt';
import type { AppConfiguration } from './AppConfiguration';
import type { Modal } from './modal';
import type { DropdownMenu } from './dropdown_menu';
import type { confirmationMenu } from './confirmation_menu';
import type { Events } from '@/types/events';
import type { Toast } from './Toast';

export interface ApplicationUIContext {
    AppConfiguration: Ref<AppConfiguration>;
    eventBus: Emitter<Events>;
    modal: Ref<Modal>;
    dropdownMenu: Ref<DropdownMenu>;
    confirmationMenu: Ref<confirmationMenu>;
    ToastList: Ref<Toast[]>;
}
