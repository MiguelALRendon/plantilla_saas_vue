import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entity';

export interface Modal {
    modalView: typeof BaseEntity | null;
    modalOnCloseFunction: ((param: unknown) => void) | null;
    viewType: ViewTypes;
    customViewId?: string;
}
