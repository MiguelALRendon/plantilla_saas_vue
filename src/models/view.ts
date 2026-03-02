import { Component } from 'vue';

import { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import type { EntityConstructor } from '@/types/entity.types';

export type EntityCtor = typeof BaseEntity & EntityConstructor<BaseEntity>;

export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}
