import type { GGIconKey } from '@/constants/ggicons';
import type { ViewTypes } from '@/enums/view_type';

export interface ExtraFunctions {
    icon: GGIconKey;
    text: string;
    viewTypes: ViewTypes[];
    fn: () => unknown;
}
