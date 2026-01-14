import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';

export interface Modal {
    modalView: typeof BaseEntity | null;
    modalOnCloseFunction: ((param: any) => void) | null;
    viewType : ViewTypes;
    customViewId?: string;
}