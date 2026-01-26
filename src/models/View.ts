import { BaseEntity } from "@/entities/base_entitiy";
import { ViewTypes } from "@/enums/view_type";
import { Component } from "vue";

export interface View {
    entityClass: typeof BaseEntity | null;
    entityObject: BaseEntity | null;
    component: Component | null;
    viewType: ViewTypes;
}