import DefaultDetailView from "@/views/default_detailview.vue";
import DefaultListView from "@/views/default_listview.vue";
import { Component } from "vue";
import { BaseEntity } from "@/entities/base_entitiy";

export type ModuleClass<T extends BaseEntity> = (new (...args: any[]) => T) & typeof BaseEntity;

export abstract class Module<TModel extends BaseEntity> {
    protected abstract module_name: string;
    protected abstract module_permission: string;
    protected abstract module_icon: string;

    protected abstract module_model_type: ModuleClass<TModel>;

    protected module_list_type: Component = DefaultListView;
    protected module_detail_type: Component = DefaultDetailView;
    protected module_default_type: Component = DefaultListView;

    protected module_custom_types_list: Map<string, Component> = new Map<string, Component>();

    public get moduleName(): string {
        return this.module_name;
    }

    public get modulePermission(): string {
        return this.module_permission;
    }

    public get moduleIcon(): string {
        return this.module_icon;
    }

    public get moduleListType(): Component {
        return this.module_list_type;
    }

    public get moduleDetailType(): Component {
        return this.module_detail_type;
    }

    public get moduleDefaultType(): Component {
        return this.module_default_type;
    }

    public get moduleModelType(): ModuleClass<BaseEntity> {
        return this.module_model_type;
    }

    public moduleFromCustomTypesList(id_value : string): Component | undefined {
        return this.module_custom_types_list.get(id_value);
    }
}