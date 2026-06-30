import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entity';

export interface Modal {
    modalView: typeof BaseEntity | null;
    modalOnCloseFunction: ((param: unknown) => void) | null;
    viewType: ViewTypes;
    customViewId?: string;
}

/**
 * Builds a fresh closed-modal default state.
 * Shared by `ApplicationClass`'s pre-Pinia bootstrap ref and `useUiStore`.
 */
export function createDefaultModal(): Modal {
    return {
        modalView: null,
        modalOnCloseFunction: null,
        viewType: ViewTypes.LISTVIEW,
    };
}
