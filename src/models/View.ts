import { BaseEntity } from "@/entities/base_entitiy";
import { ViewTypes } from "@/enums/view_type";
import { Component } from "vue";

type EntityCtor<T extends BaseEntity = BaseEntity> = 
    (abstract new (...args: any[]) => T) & {
        createNewInstance(): T;
    };

export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
}