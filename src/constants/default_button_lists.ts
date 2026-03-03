import type { Component } from 'vue';

import {
    NewButtonComponent,
    RefreshButtonComponent,
    SaveAndNewButtonComponent,
    SaveButtonComponent,
    SendToDeviceButtonComponent,
    ValidateButtonComponent
} from '@/components/Buttons';

/**
 * Pre-configured button lists for each application view type.
 * Used by `setButtonList()` in the Application singleton and as arguments
 * to the `@DefaultViewButtonList` decorator.
 *
 * `markRaw` is intentionally NOT applied here — it is applied at runtime
 * inside `setButtonList()` when the list is assigned to `ListButtons.value`.
 */
export const DefaultButtonLists: Record<string, Component[]> = {
    /** Standard action buttons shown in list / default views. */
    ListView: [NewButtonComponent, RefreshButtonComponent],

    /** Full action toolbar shown when editing a persistent entity in detail view. */
    DetailView: [
        NewButtonComponent,
        RefreshButtonComponent,
        ValidateButtonComponent,
        SaveButtonComponent,
        SaveAndNewButtonComponent,
        SendToDeviceButtonComponent
    ],

    /** Minimal toolbar for non-persistent (transient / new) entities in detail view. */
    DetailViewNonPersistent: [ValidateButtonComponent]
};
