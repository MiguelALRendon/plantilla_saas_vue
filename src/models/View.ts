import { BaseEntity } from "@/entities/base_entitiy";
import { ViewTypes } from "@/enums/view_type";
import { Component } from "vue";

type EntityCtor = typeof BaseEntity;

export interface View {
    entityClass: EntityCtor | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
    isValid: boolean;
    entityOid: string;
}