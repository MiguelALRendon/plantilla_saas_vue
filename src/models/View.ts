import { Component } from 'vue';

import { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';

type EntityCtor = typeof BaseEntity;

export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}
